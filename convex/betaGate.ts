import { v } from "convex/values";
import { mutation } from "./_generated/server";

const ONE_MINUTE_MS = 60 * 1000;
const DEFAULT_TTL_MINUTES = 15;
const MAX_ATTEMPTS = 5;

const hashCode = async (code: string) => {
  const encoded = new TextEncoder().encode(code);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const requestBetaCode = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const normalizedEmail = normalizeEmail(email);
    const now = Date.now();

    // Remove older codes for this email to keep only the latest one active.
    const existing = await ctx.db
      .query("beta_otps")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .collect();
    for (const row of existing) {
      await ctx.db.delete(row._id);
    }

    const code = Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(6, "0");
    const expiresAt = now + DEFAULT_TTL_MINUTES * ONE_MINUTE_MS;

    await ctx.db.insert("beta_otps", {
      email: normalizedEmail,
      codeHash: await hashCode(code),
      expiresAt,
      createdAt: now,
      attempts: 0,
      maxAttempts: MAX_ATTEMPTS,
      used: false,
    });

    // Return the code so the caller (Next.js API) can send it via email/SMS.
    return { ok: true, code, expiresAt };
  },
});

export const verifyBetaCode = mutation({
  args: { email: v.string(), code: v.string() },
  handler: async (ctx, { email, code }) => {
    const normalizedEmail = normalizeEmail(email);
    const now = Date.now();
    const codeHash = await hashCode(code);

    const records = await ctx.db
      .query("beta_otps")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .collect();

    if (!records.length) {
      return { ok: false, reason: "not_found" as const };
    }

    const latest = records.reduce((prev, curr) =>
      (curr.createdAt ?? 0) > (prev.createdAt ?? 0) ? curr : prev
    );

    if (latest.used) {
      return { ok: false, reason: "used" as const };
    }

    if (latest.expiresAt < now) {
      await ctx.db.delete(latest._id);
      return { ok: false, reason: "expired" as const };
    }

    if ((latest.attempts ?? 0) >= (latest.maxAttempts ?? MAX_ATTEMPTS)) {
      await ctx.db.delete(latest._id);
      return { ok: false, reason: "too_many_attempts" as const };
    }

    if (latest.codeHash !== codeHash) {
      await ctx.db.patch(latest._id, {
        attempts: (latest.attempts ?? 0) + 1,
      });
      return { ok: false, reason: "invalid_code" as const };
    }

    await ctx.db.patch(latest._id, {
      used: true,
      usedAt: now,
    });

    return { ok: true };
  },
});

import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import sgMail from "@sendgrid/mail";
import { api } from "../../../../../convex/_generated/api";

const gateEnabled = process.env.BETA_GATE_ENABLED !== "false" && !!process.env.BETA_GATE_SECRET;
const deliverBetaCode = async (to: string, code: string, expiresAt: number) => {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.BETA_GATE_FROM_EMAIL ?? process.env.SENDGRID_FROM_EMAIL;

  // In dev/staging, allow falling back to console output if email isn't configured yet.
  if (!apiKey || !from) {
    console.warn(
      "[beta-gate] Email delivery not configured (missing SENDGRID_API_KEY/BETA_GATE_FROM_EMAIL); OTP:",
      code,
      "recipient:",
      to,
    );
    return true;
  }

  sgMail.setApiKey(apiKey);

  const expiresInMinutes = Math.max(1, Math.round((expiresAt - Date.now()) / 60_000));

  try {
    await sgMail.send({
      to,
      from,
      subject: "Your beta access code",
      text: `Your one-time code is ${code}. It expires in ${expiresInMinutes} minute(s).`,
    });

    return true;
  } catch (error) {
    console.error("[beta-gate] Failed to deliver OTP via SendGrid:", error);
    return false;
  }
};

export async function POST(req: Request) {
  if (!gateEnabled) {
    return NextResponse.json({ ok: false, message: "Beta gate disabled" }, { status: 404 });
  }

  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ ok: false, message: "Email is required" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const isEmailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizedEmail);

  if (!isEmailValid) {
    return NextResponse.json({ ok: false, message: "Invalid email" }, { status: 400 });
  }

  // Generate and store OTP in Convex. The returned code should be sent via your email system.
  const result = await fetchMutation(api.betaGate.requestBetaCode, {
    email: normalizedEmail,
  });

  const delivered = await deliverBetaCode(normalizedEmail, result.code, result.expiresAt);
  if (!delivered) {
    return NextResponse.json({ ok: false, message: "Failed to send code" }, { status: 500 });
  }

  // For security, we don't return the code in the response.
  console.log("[beta-gate] OTP generated for", normalizedEmail, "expiring", new Date(result.expiresAt).toISOString());

  return NextResponse.json({ ok: true });
}
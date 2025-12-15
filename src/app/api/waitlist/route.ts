import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";
import { SignJWT } from "jose";

const waitlistEnabled = process.env.WAITLIST_ENABLED !== "false";
const adminEmail = process.env.WAITLIST_ADMIN_EMAIL;
const waitlistSecret = process.env.WAITLIST_ADMIN_SECRET;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

const getSender = () => process.env.BETA_GATE_FROM_EMAIL ?? process.env.SENDGRID_FROM_EMAIL;
const ensureSendGridConfigured = () => {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = getSender();
  if (apiKey && from) {
    sgMail.setApiKey(apiKey);
    return { apiKey, from };
  }
  return null;
};

const signApprovalToken = async (email: string) => {
  if (!waitlistSecret) {
    throw new Error("Missing WAITLIST_ADMIN_SECRET");
  }
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(waitlistSecret));
};

export async function POST(req: Request) {
  if (!waitlistEnabled) {
    return NextResponse.json({ ok: false, message: "Waitlist disabled" }, { status: 404 });
  }

  const { email } = await req.json().catch(() => ({}));
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const isEmailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizedEmail);

  if (!isEmailValid) {
    return NextResponse.json({ ok: false, message: "Invalid email" }, { status: 400 });
  }

  if (!adminEmail) {
    console.error("[waitlist] Missing WAITLIST_ADMIN_EMAIL");
    return NextResponse.json({ ok: false, message: "Server not configured" }, { status: 500 });
  }

  const sendgrid = ensureSendGridConfigured();
  if (!sendgrid) {
    console.warn("[waitlist] SendGrid not configured; skipping email send", normalizedEmail);
    return NextResponse.json({ ok: true });
  }

  try {
    const token = await signApprovalToken(normalizedEmail);
    const approvalLinkBase = appUrl ?? "";
    const approvalUrl = `${approvalLinkBase}/api/waitlist/approve?token=${encodeURIComponent(token)}`;

    await sgMail.send({
      to: adminEmail,
      from: sendgrid.from,
      subject: "New waitlist request",
      text: `New waitlist request from ${normalizedEmail}.\nApprove: ${approvalUrl}`,
    });

    console.log("[waitlist] Request recorded for", normalizedEmail);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[waitlist] Failed to send admin email", error);
    return NextResponse.json({ ok: false, message: "Failed to process request" }, { status: 500 });
  }
}

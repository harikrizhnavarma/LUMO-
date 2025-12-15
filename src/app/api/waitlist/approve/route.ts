import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";
import { jwtVerify } from "jose";

const waitlistEnabled = process.env.WAITLIST_ENABLED !== "false";
const waitlistSecret = process.env.WAITLIST_ADMIN_SECRET;
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

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

const verifyToken = async (token: string) => {
  if (!waitlistSecret) {
    throw new Error("Missing WAITLIST_ADMIN_SECRET");
  }
  const { payload } = await jwtVerify(token, new TextEncoder().encode(waitlistSecret));
  return payload.email as string | undefined;
};

const sendInvite = async (to: string) => {
  const sendgrid = ensureSendGridConfigured();
  if (!sendgrid) {
    console.warn("[waitlist] SendGrid not configured; skipping invite to", to);
    return true;
  }

  try {
    await sgMail.send({
      to,
      from: sendgrid.from,
      subject: "You’re approved for early access",
      text: `You’ve been approved. Access the secure gate here: ${appUrl}/secure-gate`,
    });
    return true;
  } catch (error) {
    console.error("[waitlist] Failed to send invite", error);
    return false;
  }
};

export async function GET(req: Request) {
  if (!waitlistEnabled) {
    return NextResponse.json({ ok: false, message: "Waitlist disabled" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token") ?? "";
  if (!token) {
    return NextResponse.json({ ok: false, message: "Missing token" }, { status: 400 });
  }

  let email: string | undefined;
  try {
    email = await verifyToken(token);
  } catch (error) {
    console.error("[waitlist] Invalid token", error);
    return NextResponse.json({ ok: false, message: "Invalid token" }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json({ ok: false, message: "Invalid token payload" }, { status: 400 });
  }

  const sent = await sendInvite(email);
  if (!sent) {
    return NextResponse.json({ ok: false, message: "Failed to send invite" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

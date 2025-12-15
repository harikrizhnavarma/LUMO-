import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { SignJWT } from "jose";
import { api } from "../../../../../convex/_generated/api";

const gateEnabled = process.env.BETA_GATE_ENABLED !== "false" && !!process.env.BETA_GATE_SECRET;
const cookieTtlSeconds =
  Number(process.env.BETA_GATE_COOKIE_TTL_SECONDS ?? "") || 7 * 24 * 60 * 60; // default 7 days

const getSecret = () => {
  const secret = process.env.BETA_GATE_SECRET;
  if (!secret) {
    throw new Error("Missing BETA_GATE_SECRET");
  }
  return new TextEncoder().encode(secret);
};

export async function POST(req: Request) {
  if (!gateEnabled) {
    return NextResponse.json({ ok: false, message: "Beta gate disabled" }, { status: 404 });
  }

  let body: { email?: string; code?: string };
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ ok: false, message: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const code = body.code?.trim() ?? "";

  if (!email || !code) {
    return NextResponse.json({ ok: false, message: "Email and code are required" }, { status: 400 });
  }

  const isEmailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  if (!isEmailValid) {
    return NextResponse.json({ ok: false, message: "Invalid email" }, { status: 400 });
  }

  const verification = await fetchMutation(api.betaGate.verifyBetaCode, {
    email,
    code,
  });

  if (!verification.ok) {
    return NextResponse.json({ ok: false, message: verification.reason ?? "Invalid code" }, { status: 400 });
  }

  const token = await new SignJWT({ email, gate: "beta" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${cookieTtlSeconds}s`)
    .sign(getSecret());

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: "beta_gate",
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: cookieTtlSeconds,
  });

  return res;
}

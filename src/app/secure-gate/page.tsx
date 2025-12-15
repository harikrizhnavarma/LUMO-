"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const requestCode = async (email: string) => {
  const res = await fetch("/api/beta/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to request code");
  }
};

const verifyCode = async (email: string, code: string) => {
  const res = await fetch("/api/beta/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Invalid code");
  }
};

const Page = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "requested" | "error" | "success">("idle");
  const [message, setMessage] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleRequest = async () => {
    setIsRequesting(true);
    setStatus("idle");
    setMessage("");
    try {
      await requestCode(email.trim().toLowerCase());
      setStatus("requested");
      setMessage("Code sent. Check your email.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setIsRequesting(false);
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setStatus("idle");
    setMessage("");
    try {
      await verifyCode(email.trim().toLowerCase(), code.trim());
      setStatus("success");
      setMessage("Access granted. Redirecting...");
      router.replace("/auth/sign-in");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 text-white">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.06), transparent 25%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.04), transparent 20%), linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0))",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/70 to-neutral-950" />

      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Private beta access</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Secure Gate</h1>
          <p className="text-sm text-white/70">
            Enter the email you used on the waitlist. We&apos;ll send a 6-digit code to unlock sign-in.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 text-white placeholder:text-white/50"
              placeholder="you@company.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code" className="text-sm text-white">
              6-digit code
            </Label>
            <div className="flex gap-3">
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="bg-white/10 text-white placeholder:text-white/50"
                placeholder="••••••"
                maxLength={6}
              />
              <Button
                type="button"
                variant="outline"
                className="whitespace-nowrap border-white/30 bg-white/10 text-white hover:bg-white/20"
                onClick={handleRequest}
                disabled={isRequesting || !email}
              >
                {isRequesting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send code"}
              </Button>
            </div>
          </div>

          {message && (
            <p
              className={`text-sm ${
                status === "error" ? "text-destructive" : "text-white/80"
              }`}
            >
              {message}
            </p>
          )}

          <Button
            type="button"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleVerify}
            disabled={isVerifying || !email || code.length !== 6}
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Continue to sign-in"
            )}
          </Button>

          <p className="text-xs text-white/60">
            Need a new code? Use “Send code” to generate a fresh one. Codes expire after 15 minutes and are one-time use.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Page;

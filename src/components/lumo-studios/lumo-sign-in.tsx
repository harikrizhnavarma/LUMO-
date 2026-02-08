"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConvexAuth } from "convex/react";

import { useAuth } from "@/hooks/use-auth";
import { GoogleOAuthButton } from "@/components/buttons/oauth/google";

export const LumoSignIn = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const { signInForm, handleSignIn, isLoading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = signInForm;

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  return (
    <div className="signup-root">
      <div className="grid-master" />
      <div className="float-blob" />
      <div className="ob-noise" />

      <div className="signup-container">
        <div className="signup-header">
          <div className="signup-badge">PROTOCOL // 01_AUTH</div>
          <h1>
            ACCESS
            <br />
            <span className="filled">LUMO CORE</span>
          </h1>
          <p className="signup-desc">
            Authenticate to enter the LUMO studio grid and resume your active
            projects.
          </p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit(handleSignIn)}>
          <div className="signup-input-group">
            <label className="signup-label">ARCHITECT_EMAIL</label>
            <input
              className="signup-input"
              type="email"
              placeholder="name@studio"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="signup-input-group">
            <label className="signup-label">CORE_SECRET</label>
            <input
              className="signup-input"
              type="password"
              placeholder="********"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {errors.root && (
            <p className="text-xs text-red-500">{errors.root.message}</p>
          )}

          <button
            type="submit"
            className="cta-btn-prism signup-submit"
            disabled={isLoading}
          >
            {isLoading ? "SYNCING..." : "SIGN IN"}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3">
          <GoogleOAuthButton />
          <Link
            href="/auth/sign-up"
            className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            Create a new account
          </Link>
        </div>

        <div className="signup-footer-meta">
          <div className="registration-marks">
            <div className="reg-dot" style={{ background: "var(--primary)" }} />
            <div
              className="reg-dot"
              style={{ background: "var(--secondary)" }}
            />
            <div
              className="reg-dot"
              style={{ background: "var(--tertiary)" }}
            />
          </div>
          <span>SYST_REF: 4829-NC // ACCESS_AUTH_V3</span>
        </div>
      </div>
    </div>
  );
};

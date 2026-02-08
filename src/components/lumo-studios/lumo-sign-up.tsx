"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConvexAuth } from "convex/react";

import { useAuth } from "@/hooks/use-auth";
import { GoogleOAuthButton } from "@/components/buttons/oauth/google";

export const LumoSignUp = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const { signUpForm, handleSignUp, isLoading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = signUpForm;

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.replace("/onboarding");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  return (
    <div className="signup-root">
      <div className="grid-master" />
      <div className="float-blob" />
      <div className="ob-noise" />

      <div className="signup-container">
        <div className="signup-header">
          <div className="signup-badge">PROTOCOL // 00_INIT</div>
          <h1>
            ACTIVATE
            <br />
            <span className="filled">IDENTITY</span>
          </h1>
          <p className="signup-desc">
            Register your credentials to start building within the LUMO studio
            grid.
          </p>
        </div>

        <form
          className="signup-form"
          onSubmit={handleSubmit((data) => handleSignUp(data, "/onboarding"))}
        >
          <div className="signup-input-group">
            <label className="signup-label">FIRST_NAME</label>
            <input
              className="signup-input"
              type="text"
              placeholder="Your first name"
              {...register("firstName")}
            />
            {errors.firstName && (
              <p className="text-xs text-red-500">{errors.firstName.message}</p>
            )}
          </div>
          <div className="signup-input-group">
            <label className="signup-label">LAST_NAME</label>
            <input
              className="signup-input"
              type="text"
              placeholder="Your last name"
              {...register("lastName")}
            />
            {errors.lastName && (
              <p className="text-xs text-red-500">{errors.lastName.message}</p>
            )}
          </div>
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
            {isLoading ? "SYNCING..." : "CREATE ACCOUNT"}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3">
          <GoogleOAuthButton />
          <Link
            href="/auth/sign-in"
            className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            Already have access? Sign in
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

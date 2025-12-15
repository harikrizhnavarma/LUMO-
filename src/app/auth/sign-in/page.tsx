"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth } from "convex/react";

import { GoogleOAuthButton } from "@/components/buttons/oauth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Loader2,
  Twitter,
  Youtube,
} from "lucide-react";

const Page = () => {
  const router = useRouter();
  // Convex auth state – comes from `convex/react`
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();

  // Your existing auth hook
  const { signInForm, handleSignIn, isLoading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = signInForm;

  // If the user is already signed in, send them to the main entry point (`/`)
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      // `/` will then redirect to /dashboard/... or /billing/... based on entitlement
      router.replace("/");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-900 text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(10,10,10,0.68), rgba(10,10,10,0.35)), url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />

      <div className="relative z-10 grid w-full max-w-6xl grid-cols-1 gap-10 px-6 py-12 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6 lg:pr-6">
          <div className="max-w-xl space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-white/80">
              LUMO Studios
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Step into LUMO
            </h1>
            <p className="text-base text-white/80">
              Sign in to join the team crafting on-brand experiences. Your
              workspace is ready to help you build something new.
            </p>
          </div>

          <div className="flex items-center gap-3 text-white/80">
            <span className="text-sm">Follow the journey</span>
            <div className="flex items-center gap-2">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, idx) => (
                <div
                  key={idx}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm"
                >
                  <Icon className="h-4 w-4" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(handleSignIn)}
          className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 text-white shadow-2xl backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-white/0" />
          <div className="relative space-y-6 p-8 sm:p-10">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">Sign in</p>
              <h2 className="text-2xl font-semibold text-white">
                Access your workspace
              </h2>
              <p className="text-sm text-white/80">
                Use your credentials to pick up where you left off.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-white">
                  Email Address
                </Label>
                <Input
                  type="email"
                  id="email"
                  {...register("email")}
                  className={`bg-white/15 text-white placeholder:text-white/60 ${errors.email ? "border-destructive" : ""}`}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-white">
                  Password
                </Label>
                <Input
                  type="password"
                  id="password"
                  {...register("password")}
                  className={`bg-white/15 text-white placeholder:text-white/60 ${errors.password ? "border-destructive" : ""}`}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-white/80">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/50 bg-transparent text-primary focus:ring-primary"
                  />
                  Remember me
                </label>
                <Link
                  href="#"
                  className="font-medium text-white hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {errors.root && (
              <p className="text-center text-xs text-destructive">
                {errors.root.message}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs text-white/60">
              <hr className="border-dashed border-white/40" />
              <span>Or continue with</span>
              <hr className="border-dashed border-white/40" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <GoogleOAuthButton />
              <Button type="button" variant="outline" className="bg-white/10 text-white hover:bg-white/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  viewBox="0 0 256 256"
                >
                  <path fill="#f1511b" d="M121.666 121.666H0V0h121.666z"></path>
                  <path fill="#80cc28" d="M256 121.666H134.335V0H256z"></path>
                  <path
                    fill="#00adef"
                    d="M121.663 256.002H0V134.336h121.663z"
                  ></path>
                  <path
                    fill="#fbbc09"
                    d="M256 256.002H134.335V134.336H256z"
                  ></path>
                </svg>
                <span>Microsoft</span>
              </Button>
            </div>

            <p className="text-center text-sm text-white/80">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/sign-up"
                className="font-semibold text-white hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Page;

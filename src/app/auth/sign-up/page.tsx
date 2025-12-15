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
import { Loader2 } from "lucide-react";

const Page = () => {
  const router = useRouter();

  // Convex auth state
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();

  // Your existing auth hook
  const { signUpForm, handleSignUp, isLoading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = signUpForm;

  // If already signed in (e.g. after Google signup), go to "/"
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      // "/" will decide between /dashboard/... and /billing/...
      router.replace("/");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-900 text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(10,10,10,0.68), rgba(10,10,10,0.35)), url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/25 to-transparent" />

      <div className="relative z-10 grid w-full max-w-6xl grid-cols-1 gap-10 px-6 py-12 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6 lg:pr-6">
          <div className="max-w-xl space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-white/80">
              LUMO Studios
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Begin with LUMO
            </h1>
            <p className="text-base text-white/80">
              Create your account and start generating on-brand experiences
              right away. Stay aligned, move confidently, and keep your team in
              flow.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(handleSignUp)}
          className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 text-white shadow-2xl backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-white/0" />
          <div className="relative space-y-6 p-8 sm:p-10">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">Create</p>
              <h2 className="text-2xl font-semibold text-white">
                Join LUMO Studios today
              </h2>
              <p className="text-sm text-white/80">
                Set up your account to start designing with brand fidelity.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-white">
                    First Name
                  </Label>
                  <Input
                    type="text"
                    id="firstName"
                    {...register("firstName")}
                    className={`bg-white/15 text-white placeholder:text-white/60 ${errors.firstName ? "border-destructive" : ""}`}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-destructive">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-white">
                    Last Name
                  </Label>
                  <Input
                    type="text"
                    id="lastName"
                    {...register("lastName")}
                    className={`bg-white/15 text-white placeholder:text-white/60 ${errors.lastName ? "border-destructive" : ""}`}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-destructive">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

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
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs text-white/60">
              <hr className="border-dashed border-white/40" />
              <span>Or continue with</span>
              <hr className="border-dashed border-white/40" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <GoogleOAuthButton />
              <Button
                type="button"
                variant="outline"
                className="bg-white/10 text-white hover:bg-white/20"
              >
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
              Have an account?{" "}
              <Link
                href="/auth/sign-in"
                className="font-semibold text-white hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Page;

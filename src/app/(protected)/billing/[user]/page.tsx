"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSubscriptionPlan } from "@/hooks/use-billings";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Check,
  Sparkles,
  Zap,
  Users,
  Shield,
  GraduationCap,
  Crown,
  Loader2,
  ArrowLeft,
} from "lucide-react";

type PlanType = "starter" | "professional" | "business";

const BillingPage: React.FC = () => {
  const { subscribeToPlan, isFetching } = useSubscriptionPlan();
  const router = useRouter();
  const [activePlan, setActivePlan] = React.useState<PlanType | null>(null);

  const handleSubscribe = (plan: PlanType) => {
    setActivePlan(plan);
    void subscribeToPlan(plan);
  };

  const handleContact =
    (type: "enterprise" | "education") => () => {
      const email =
        type === "enterprise" ? "sales@lumo.app" : "education@lumo.app";
      const subject =
        type === "enterprise"
          ? "LUMO Enterprise Plan Enquiry"
          : "LUMO Education Plan Enquiry";
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(
        subject,
      )}`;
    };

  const isPlanLoading = (plan: PlanType) =>
    isFetching && activePlan === plan;

  const renderPrice = (amount: string, suffix: string) => (
    <div className="flex items-baseline gap-1">
      <span className="text-3xl font-bold text-foreground">{amount}</span>
      <span className="text-sm text-muted-foreground">{suffix}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl space-y-10 relative">
        {/* Back button */}
        <div className="absolute left-0 -top-2 md:-top-0">
          <Button
            variant="ghost"
            size="sm"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            onClick={() => router.push("/dashboard/account")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Button>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mt-6 md:mt-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary to-primary/60 rounded-full mb-4 shadow-lg">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Choose the right LUMO plan
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Flexible subscription tiers for individuals, teams, enterprises, and
            education partners.
          </p>
        </div>

        {/* Main tiers: Starter / Professional / Business */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* STARTER */}
          <Card className="flex flex-col border border-border/70 bg-gradient-to-b from-background/80 to-background/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Starter</CardTitle>
                <Badge variant="outline" className="text-xs">
                  Entry level
                </Badge>
              </div>
              <CardDescription className="mt-2 text-sm text-muted-foreground">
                Ideal for designers beginning with AI-powered workflows.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              {renderPrice("$29", "/month")}
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>50 generations/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Draft &amp; Standard quality</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>1 basic BrandKit</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>5 GB storage</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Watermarked exports</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Community support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pt-2">
              <Button
                className="w-full"
                onClick={() => handleSubscribe("starter")}
                disabled={isPlanLoading("starter")}
              >
                {isPlanLoading("starter") ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Redirecting…
                  </>
                ) : (
                  "Choose Starter"
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* PROFESSIONAL */}
          <Card className="relative flex flex-col border border-primary/50 bg-gradient-to-b from-primary/10 via-background to-background shadow-lg shadow-primary/30">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="flex items-center gap-1 px-3 py-1 text-[11px]">
                <Crown className="w-3 h-3" />
                Most popular
              </Badge>
            </div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Professional
                </CardTitle>
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <CardDescription className="mt-2 text-sm text-muted-foreground">
                For professionals who need unlimited generations and advanced
                control.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="space-y-1">
                {renderPrice("$79", "/month (monthly)")}
                <p className="text-xs text-muted-foreground">
                  or $69/month when billed annually
                </p>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Unlimited generations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>All quality modes including Ultra</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>10 advanced BrandKits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Unlimited Custom Palettes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>4K &amp; 8K exports</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>No watermarks</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>100 GB storage</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Priority generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Email support (24h response)</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pt-2">
              <Button
                className="w-full"
                onClick={() => handleSubscribe("professional")}
                disabled={isPlanLoading("professional")}
              >
                {isPlanLoading("professional") ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Redirecting…
                  </>
                ) : (
                  "Choose Professional"
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* BUSINESS */}
          <Card className="flex flex-col border border-border/70 bg-gradient-to-b from-background/80 to-background/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Business
                </CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </div>
              <CardDescription className="mt-2 text-sm text-muted-foreground">
                Designed for teams that need collaboration and shared assets.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              {renderPrice("$199", "/month (3 users)")}
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Everything in Professional</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Real-time collaboration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Unlimited free viewers</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Shared workspace</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Team BrandKit library</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Version control</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>500 GB shared storage</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Priority support (12h response)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Team training session</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pt-2">
              <Button
                className="w-full"
                onClick={() => handleSubscribe("business")}
                disabled={isPlanLoading("business")}
              >
                {isPlanLoading("business") ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Redirecting…
                  </>
                ) : (
                  "Choose Business"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Enterprise & Education */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* ENTERPRISE */}
          <Card className="flex flex-col border border-border/70 bg-gradient-to-b from-background/90 to-background">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Enterprise
                </CardTitle>
                <Shield className="w-4 h-4 text-muted-foreground" />
              </div>
              <CardDescription className="mt-2 text-sm text-muted-foreground">
                Custom deployment, security, and SLAs for large organizations.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <p className="text-xl font-semibold text-foreground">
                Custom pricing
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Everything in Business</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Unlimited users and workspaces</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Custom BrandKit training</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>API access &amp; SSO integration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Advanced security</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Audit logs (7-year retention)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Custom storage (5TB+)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>24/7 support (1h response)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Custom SLA</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pt-2">
              <Button
                className="w-full"
                variant="outline"
                onClick={handleContact("enterprise")}
              >
                Contact sales
              </Button>
            </CardFooter>
          </Card>

          {/* EDUCATION */}
          <Card className="flex flex-col border border-border/70 bg-gradient-to-b from-background/90 to-background">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Education
                </CardTitle>
                <GraduationCap className="w-4 h-4 text-muted-foreground" />
              </div>
              <CardDescription className="mt-2 text-sm text-muted-foreground">
                Discounted pricing for schools, universities, and programs.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              {renderPrice("$9", "/student/month")}
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Per-student licensing</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Access to core LUMO features</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Curriculum-friendly workflows</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Central admin controls</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pt-2">
              <Button
                className="w-full"
                variant="outline"
                onClick={handleContact("education")}
              >
                Contact education team
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-muted-foreground">
          © 2025 LUMO TECHNOLOGY. All rights reserved. This page summarises
          confidential and proprietary pricing information. Unauthorized
          reproduction or distribution is prohibited.
        </p>
      </div>
    </div>
  );
};

export default BillingPage;

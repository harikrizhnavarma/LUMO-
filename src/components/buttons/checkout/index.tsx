"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSubscriptionPlan } from "@/hooks/use-billings";
import type { BillingPlan } from "@/redux/api/billing";

type SubscribeButtonProps = {
  plan: BillingPlan;        // "starter" | "professional" | "business"
  label?: string;
  className?: string;
};

export const SubscribeButton: React.FC<SubscribeButtonProps> = ({
  plan,
  label,
  className,
}) => {
  const { subscribeToPlan, isFetching } = useSubscriptionPlan();

  const handleClick = React.useCallback(() => {
    void subscribeToPlan(plan);
  }, [plan, subscribeToPlan]);

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isFetching}
      className={cn(
        "inline-flex items-center justify-center rounded-full",
        "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary",
        "shadow-lg shadow-primary/30",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "text-white font-medium text-sm px-6 py-3",
        className,
      )}
    >
      {isFetching ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Redirecting…
        </>
      ) : (
        label ?? "Subscribe"
      )}
    </Button>
  );
};

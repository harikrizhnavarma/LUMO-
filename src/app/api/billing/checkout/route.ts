import { NextRequest, NextResponse } from "next/server";
import { Polar } from "@polar-sh/sdk";

type BillingPlan = "starter" | "professional" | "business";

function getProductIdForPlan(plan: BillingPlan): string | undefined {
  switch (plan) {
    case "starter":
      return process.env.POLAR_STARTER_PLAN;
    case "business":
      return process.env.POLAR_BUSINESS_PLAN;
    case "professional":
    default:
      // Backwards compatibility: fall back to existing STANDARD plan
      return (
        process.env.POLAR_PROFESSIONAL_PLAN ?? process.env.POLAR_STANDARD_PLAN
      );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const planParam = (searchParams.get("plan") || "professional")
    .toLowerCase() as BillingPlan;

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!accessToken || !appUrl) {
    return NextResponse.json(
      {
        error:
          "POLAR_ACCESS_TOKEN or NEXT_PUBLIC_APP_URL is not configured in the environment",
      },
      { status: 500 },
    );
  }

  const productId = getProductIdForPlan(planParam);

  if (!productId) {
    return NextResponse.json(
      {
        error: `No Polar product configured for plan "${planParam}". Please set POLAR_STARTER_PLAN, POLAR_PROFESSIONAL_PLAN or POLAR_BUSINESS_PLAN / POLAR_STANDARD_PLAN.`,
      },
      { status: 500 },
    );
  }

  const polar = new Polar({
    server: process.env.POLAR_ENV === "sandbox" ? "sandbox" : "production",
    accessToken,
  });

  const session = await polar.checkouts.create({
    products: [productId],
    successUrl: `${appUrl}/billing/success?plan=${planParam}`,
    metadata: {
      userId,
      plan: planParam,
    },
  });

  return NextResponse.json({ url: session.url });
}

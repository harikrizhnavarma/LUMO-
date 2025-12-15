import { createApi } from "@reduxjs/toolkit/query/react";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type BillingPlan = "starter" | "professional" | "business";

type CheckoutArgs = {
  userId: string;
  plan: BillingPlan;
};

type CheckoutResponse = {
  url: string;
};

export const BillingApi = createApi({
  reducerPath: "billing",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/billing" }),
  endpoints: (builder) => ({
    getCheckout: builder.query<CheckoutResponse, CheckoutArgs>({
      query: ({ userId, plan }) => ({
        url: "/checkout",
        method: "GET",
        params: {
          userId,
          plan,
        },
      }),
    }),
  }),
});

export const { useLazyGetCheckoutQuery } = BillingApi;

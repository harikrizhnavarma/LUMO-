import { useLazyGetCheckoutQuery, BillingPlan } from "@/redux/api/billing";
import { useAppSelector } from "@/redux/store";
import { toast } from "sonner";

export const useSubscriptionPlan = () => {
  const [trigger, { isFetching }] = useLazyGetCheckoutQuery();
  const { id } = useAppSelector((state) => state.profile);

  const subscribeToPlan = async (plan: BillingPlan) => {
    if (!id) {
      toast.error("You need to be logged in to subscribe.");
      return;
    }

    try {
      const res = await trigger({ userId: id, plan }).unwrap();
      // hosted checkout
      window.location.href = res.url;
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Could not start checkout. Please try again.");
    }
  };

  return { subscribeToPlan, isFetching };
};

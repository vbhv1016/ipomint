import { createFileRoute } from "@tanstack/react-router";
import SubscriptionStatus from "@/pages/SubscriptionStatus";

export const Route = createFileRoute("/ipo-subscription-status")({
  component: SubscriptionStatus,
});

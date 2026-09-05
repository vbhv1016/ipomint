import { createFileRoute } from "@tanstack/react-router";
import ListingGainCalculator from "@/pages/ListingGainCalculator";

export const Route = createFileRoute("/ipo-listing-gain-calculator")({
  component: ListingGainCalculator,
});

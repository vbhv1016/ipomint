import { createFileRoute } from "@tanstack/react-router";
import AllotmentCalculator from "@/pages/AllotmentCalculator";

export const Route = createFileRoute("/ipo-allotment-calculator")({
  component: AllotmentCalculator,
});

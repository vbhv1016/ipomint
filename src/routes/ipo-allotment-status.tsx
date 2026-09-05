import { createFileRoute } from "@tanstack/react-router";
import AllotmentStatus from "@/pages/AllotmentStatus";

export const Route = createFileRoute("/ipo-allotment-status")({
  component: AllotmentStatus,
});

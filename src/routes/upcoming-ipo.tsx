import { createFileRoute } from "@tanstack/react-router";
import UpcomingIPO from "@/pages/UpcomingIPO";

export const Route = createFileRoute("/upcoming-ipo")({
  component: UpcomingIPO,
});

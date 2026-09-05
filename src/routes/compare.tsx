import { createFileRoute } from "@tanstack/react-router";
import CompareIPOs from "@/pages/CompareIPOs";

export const Route = createFileRoute("/compare")({
  component: CompareIPOs,
});

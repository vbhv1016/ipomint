import { createFileRoute } from "@tanstack/react-router";
import IPOGMPList from "@/pages/IPOGMPList";

export const Route = createFileRoute("/ipo-gmp-list")({
  component: IPOGMPList,
});

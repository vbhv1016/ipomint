import { createFileRoute } from "@tanstack/react-router";
import IPOPerformance from "@/pages/IPOPerformance";

const SITE = "https://ipomint.in";
const LOGO = "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/eca61baf-936a-40f6-a9d0-2e374ca765e2/id-preview-cf0e2c7b--cba5c212-04b0-450a-b9cf-e20a67be5af0.lovable.app-1772343585398.png";

export const Route = createFileRoute("/ipo-performance")({
  component: IPOPerformance,
  head: () => {
    const url = `${SITE}/ipo-performance`;
    const title = "IPO Performance Tracker 2026 | Best & Worst Listing Gains";
    const description = "Track post-listing performance of Indian IPOs. Best and worst listing gains, sortable by year, exchange (Mainline/SME), and returns.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:image", content: LOGO },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: LOGO },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
});

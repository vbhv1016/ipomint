import { createFileRoute } from "@tanstack/react-router";
import Disclaimer from "@/pages/Disclaimer";

const SITE = "https://ipomint.in";

export const Route = createFileRoute("/disclaimer")({
  component: Disclaimer,
  head: () => {
    const url = `${SITE}/disclaimer`;
    const title = "Disclaimer & SEBI Notice | IPOMint";
    const description =
      "IPOMint is not SEBI-registered. Read our disclaimer on grey market premium data, market risk, data accuracy and liability before investing.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
});

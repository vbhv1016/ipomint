import { createFileRoute } from "@tanstack/react-router";
import Terms from "@/pages/Terms";

const SITE = "https://ipomint.in";

export const Route = createFileRoute("/terms")({
  component: Terms,
  head: () => {
    const url = `${SITE}/terms`;
    const title = "Terms of Service | IPOMint";
    const description =
      "Terms and conditions for using IPOMint: no investment advice, no SEBI registration, data accuracy, user conduct and liability limits.";
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

import { createFileRoute } from "@tanstack/react-router";
import Privacy from "@/pages/Privacy";

const SITE = "https://ipomint.in";

export const Route = createFileRoute("/privacy")({
  component: Privacy,
  head: () => {
    const url = `${SITE}/privacy`;
    const title = "Privacy Policy | IPOMint";
    const description =
      "How IPOMint collects, uses and protects your data: cookies, analytics, email subscriptions, data sharing and your rights.";
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

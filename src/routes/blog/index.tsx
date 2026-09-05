import { createFileRoute } from "@tanstack/react-router";
import Blog from "@/pages/Blog";

const SITE = "https://ipomint.in";

export const Route = createFileRoute("/blog/")({
  component: Blog,
  head: () => {
    const url = `${SITE}/blog`;
    const title = "IPO Blog | GMP Analysis, Reviews & Market Insights";
    const description =
      "Expert Indian IPO reviews, grey market premium analysis and subscription strategies, updated weekly on IPOMint.";
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

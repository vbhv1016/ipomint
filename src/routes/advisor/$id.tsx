import { createFileRoute } from "@tanstack/react-router";
import AIAdvisor from "@/pages/AIAdvisor";
import { supabase } from "@/integrations/supabase/client";

const SITE = "https://ipomint.in";
const LOGO = "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/eca61baf-936a-40f6-a9d0-2e374ca765e2/id-preview-cf0e2c7b--cba5c212-04b0-450a-b9cf-e20a67be5af0.lovable.app-1772343585398.png";

export const Route = createFileRoute("/advisor/$id")({
  component: AIAdvisor,
  loader: async ({ params }) => {
    const { data } = await supabase.from("ipos").select("id,name,slug").eq("slug", params.id).maybeSingle();
    return { ipo: data };
  },
  head: ({ params, loaderData }) => {
    const url = `${SITE}/advisor/${params.id}`;
    const name = loaderData?.ipo?.name ?? "IPO";
    const title = `Should You Apply to ${name} IPO? | AI Verdict`.slice(0, 60);
    const description = `AI-powered analysis: Apply, Neutral, or Avoid? Get an unbiased verdict on the ${name} IPO based on GMP, subscription, and fundamentals.`.slice(0, 158);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "article" },
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

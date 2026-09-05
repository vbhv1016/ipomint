import { createFileRoute } from "@tanstack/react-router";
import IPODetail from "@/pages/IPODetail";
import { supabase } from "@/integrations/supabase/client";
import { generateFAQs } from "@/components/ipo-detail/IPOFAQSection";
import type { IPORow } from "@/hooks/useIPOData";

const SITE = "https://ipomint.in";
const LOGO = "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/eca61baf-936a-40f6-a9d0-2e374ca765e2/id-preview-cf0e2c7b--cba5c212-04b0-450a-b9cf-e20a67be5af0.lovable.app-1772343585398.png";

export const Route = createFileRoute("/ipo/$id")({
  component: IPODetail,
  loader: async ({ params }) => {
    const { data: ipo } = await supabase
      .from("ipos")
      .select("*")
      .eq("slug", params.id)
      .maybeSingle();

    if (!ipo) return { ipo: null, latestGmp: 0 };

    const { data: gmp } = await supabase
      .from("gmp_updates")
      .select("gmp")
      .eq("ipo_id", (ipo as IPORow).id)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle();

    return { ipo: ipo as IPORow, latestGmp: gmp ? Number(gmp.gmp) : 0 };
  },
  head: ({ params, loaderData }) => {
    const url = `${SITE}/ipo/${params.id}`;
    if (!loaderData?.ipo) {
      return {
        meta: [
          { title: `IPO not found: ${params.id} | IPOMint` }, { name: "robots", content: "noindex, follow" },
          { name: "description", content: `The IPO "${params.id}" is not listed on IPOMint. Browse live IPO GMP, subscription and allotment data instead.` },
          { property: "og:url", content: url },
        ],
        links: [{ rel: "canonical", href: url }],
      };
    }
    const ipo = loaderData.ipo;
    const latestGmp = loaderData.latestGmp;
    const priceHigh = Number(ipo.price_band_high);
    const priceLow = Number(ipo.price_band_low);
    const expectedListing = priceHigh + latestGmp;
    const title = `${ipo.name} IPO GMP ₹${latestGmp} | Price Band & Lot Size`.slice(0, 60);
    const description = `${ipo.name} IPO GMP ₹${latestGmp}. Price band ₹${priceLow}-₹${priceHigh}, lot size ${ipo.lot_size}. Live subscription & expected listing ₹${expectedListing}.`.slice(0, 158);
    const faqs = generateFAQs(ipo, latestGmp, expectedListing);

    const availability =
      ipo.status === "open"
        ? "https://schema.org/InStock"
        : ipo.status === "upcoming"
        ? "https://schema.org/PreOrder"
        : "https://schema.org/OutOfStock";

    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Product",
          name: `${ipo.name} IPO`,
          description: `${ipo.name} Initial Public Offering on ${ipo.exchange}. Price band ₹${priceLow}-₹${priceHigh}, lot size ${ipo.lot_size} shares.`,
          brand: { "@type": "Brand", name: ipo.name },
          category: "Initial Public Offering",
          url,
          image: LOGO,
          offers: {
            "@type": "AggregateOffer",
            url,
            priceCurrency: "INR",
            lowPrice: priceLow,
            highPrice: priceHigh,
            offerCount: 1,
            availability,
            validFrom: ipo.open_date,
            priceValidUntil: ipo.close_date,
            seller: { "@type": "Organization", name: "IPOMint", url: SITE },
          },
        },
        {
          "@type": "Organization",
          name: "IPOMint",
          url: SITE,
          logo: LOGO,
        },
        {
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE },
            { "@type": "ListItem", position: 2, name: "IPO GMP List", item: `${SITE}/ipo-gmp-list` },
            { "@type": "ListItem", position: 3, name: `${ipo.name} IPO`, item: url },
          ],
        },
      ],
    };

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "product" },
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
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(jsonLd),
        },
      ],
    };
  },
});

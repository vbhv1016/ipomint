/**
 * Generates a structured SEO blog article from IPO data.
 * Returns { title, slug, excerpt, content } ready for blog_posts table.
 */

interface IPOInput {
  name: string;
  slug: string;
  exchange: string;
  price_band_low: number;
  price_band_high: number;
  lot_size: number;
  open_date: string;
  close_date: string;
  listing_date?: string | null;
  status: string;
  subscription_retail?: number | null;
  subscription_hni?: number | null;
  subscription_qib?: number | null;
  subscription_total?: number | null;
  listing_price?: number | null;
  listing_gain?: number | null;
  company_description?: string | null;
  revenue?: number | null;
  profit?: number | null;
  ipo_objective?: string | null;
}

export function generateIPOBlogContent(ipo: IPOInput) {
  const blogSlug = `${ipo.slug}-review`;
  const minInvestment = ipo.lot_size * ipo.price_band_high;
  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const title = `${ipo.name} IPO GMP Review, Price Band, Lot Size, Subscription & Listing Gain`;

  const excerpt = `${ipo.name} IPO GMP today, price band, lot size, subscription status and expected listing gain. Complete IPO review and analysis.`;

  // Build content sections
  const sections: string[] = [];

  // About
  sections.push(`## About the Company\n\n${ipo.company_description || `${ipo.name} is preparing to list its shares on the ${ipo.exchange} through an Initial Public Offering (IPO). The company aims to raise capital to fund its business growth and expansion plans. Investors are closely watching this IPO for potential listing gains.`}`);

  // IPO Details
  sections.push(`## ${ipo.name} IPO Details\n\nThe ${ipo.name} IPO has set its price band at ₹${ipo.price_band_low} to ₹${ipo.price_band_high} per share. The lot size for this IPO is ${ipo.lot_size} shares, which means the minimum investment required for retail investors is ${fmt(minInvestment)}.\n\nThe IPO is scheduled to open on ${fmtDate(ipo.open_date)} and close on ${fmtDate(ipo.close_date)}. The shares will be listed on the ${ipo.exchange}.${ipo.listing_date ? ` The expected listing date is ${fmtDate(ipo.listing_date)}.` : ''}`);

  // GMP
  sections.push(`## Grey Market Premium (GMP) Today\n\nThe Grey Market Premium (GMP) is an unofficial indicator of how an IPO might perform on listing day. A positive GMP suggests the stock may list at a premium, while a negative GMP indicates a possible discount.\n\nInvestors should note that GMP is not a guaranteed predictor of listing performance. It reflects unofficial market sentiment and can change rapidly based on market conditions, subscription numbers, and overall investor demand.\n\nFor live GMP updates, check our dedicated [${ipo.name} IPO GMP page](/ipo/${ipo.slug}).`);

  // Subscription
  if (ipo.subscription_total) {
    sections.push(`## IPO Subscription Status\n\nThe ${ipo.name} IPO has received significant interest from investors across all categories:\n\n- **Retail Investors:** ${ipo.subscription_retail ? `${ipo.subscription_retail}x subscribed` : 'Data awaited'}\n- **HNI / NII:** ${ipo.subscription_hni ? `${ipo.subscription_hni}x subscribed` : 'Data awaited'}\n- **QIB (Qualified Institutional Buyers):** ${ipo.subscription_qib ? `${ipo.subscription_qib}x subscribed` : 'Data awaited'}\n- **Overall Subscription:** ${ipo.subscription_total}x\n\n${Number(ipo.subscription_total) > 5 ? 'The strong subscription numbers indicate robust demand for this IPO.' : 'The subscription numbers suggest moderate demand for this IPO.'}`);
  } else {
    sections.push(`## IPO Subscription Status\n\nThe subscription status for ${ipo.name} IPO will be updated once the IPO opens for bidding on ${fmtDate(ipo.open_date)}. Subscription data is typically available by the end of each bidding day.\n\nInvestors can track the live subscription status on our [IPO Subscription Status](/ipo-subscription-status) page.`);
  }

  // Financials
  if (ipo.revenue || ipo.profit) {
    sections.push(`## Financial Performance\n\n${ipo.name} has reported the following financial metrics:\n\n${ipo.revenue ? `- **Revenue:** ₹${ipo.revenue.toLocaleString('en-IN')} Crore` : ''}${ipo.profit !== null && ipo.profit !== undefined ? `\n- **Profit:** ₹${ipo.profit.toLocaleString('en-IN')} Crore${Number(ipo.profit) < 0 ? ' (The company is currently operating at a loss, which investors should consider carefully.)' : ''}` : ''}\n\nInvestors should review the company's financial statements in the Draft Red Herring Prospectus (DRHP) for a comprehensive understanding of its financial health.`);
  }

  // IPO Objective
  if (ipo.ipo_objective) {
    sections.push(`## IPO Objectives\n\nThe company plans to utilize the IPO proceeds for the following purposes:\n\n${ipo.ipo_objective}\n\nUnderstanding the fund utilization plan helps investors assess whether the company's growth strategy aligns with their investment goals.`);
  }

  // Should You Apply
  sections.push(`## Should You Apply for ${ipo.name} IPO?\n\nBefore applying for the ${ipo.name} IPO, investors should consider the following factors:\n\n1. **Company Fundamentals:** Review the company's business model, revenue growth, and profitability trends.\n2. **Valuation:** Compare the IPO price band with industry peers and the company's earnings.\n3. **Market Conditions:** Consider the overall market sentiment and sector outlook.\n4. **GMP Trends:** While GMP provides a market sentiment indicator, it should not be the sole basis for investment decisions.\n5. **Risk Factors:** Read the risk factors mentioned in the DRHP carefully.\n\nInvestment decisions should be based on thorough research. Consult a SEBI-registered financial advisor before investing in any IPO.`);

  // Internal Links
  sections.push(`## More IPO Resources\n\n- [Live GMP Updates for ${ipo.name} IPO →](/ipo/${ipo.slug})\n- [View All Upcoming IPOs →](/upcoming-ipo)\n- [IPO GMP List →](/ipo-gmp-list)\n- [IPO Allotment Calculator →](/ipo-allotment-calculator)\n- [IPO Listing Gain Calculator →](/ipo-listing-gain-calculator)`);

  // FAQ
  sections.push(`## Frequently Asked Questions\n\n**Q: What is the GMP of ${ipo.name} IPO today?**\nA: The GMP of ${ipo.name} IPO changes daily based on market demand. Check our [live GMP page](/ipo/${ipo.slug}) for the latest updates.\n\n**Q: What is the lot size of ${ipo.name} IPO?**\nA: The lot size is ${ipo.lot_size} shares. The minimum investment at the upper price band is ${fmt(minInvestment)}.\n\n**Q: What is the price band of ${ipo.name} IPO?**\nA: The price band is ₹${ipo.price_band_low} to ₹${ipo.price_band_high} per share.\n\n**Q: What is the expected listing gain of ${ipo.name} IPO?**\nA: The expected listing gain depends on the current GMP and market conditions at the time of listing. Visit our [IPO detail page](/ipo/${ipo.slug}) for real-time estimates.`);

  const content = `# ${ipo.name} IPO GMP Review\n\n${sections.join('\n\n---\n\n')}`;

  return {
    title,
    slug: blogSlug,
    excerpt,
    content,
    category: 'ipo-review',
  };
}

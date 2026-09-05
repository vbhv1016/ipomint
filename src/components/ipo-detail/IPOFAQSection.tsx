import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { formatCurrency } from '@/hooks/useIPOData';
import type { IPORow } from '@/hooks/useIPOData';

interface Props {
  ipo: IPORow;
  latestGmp: number;
  expectedListing: number;
}

export function generateFAQs(ipo: IPORow, latestGmp: number, expectedListing: number) {
  return [
    {
      question: `What is the GMP of ${ipo.name} IPO today?`,
      answer: `The Grey Market Premium (GMP) of ${ipo.name} IPO today is ₹${latestGmp}. This means the stock is expected to list at ${formatCurrency(expectedListing)}, a ${((latestGmp / Number(ipo.price_band_high)) * 100).toFixed(1)}% ${latestGmp >= 0 ? 'premium' : 'discount'} over the issue price.`,
    },
    {
      question: `What is the price band of ${ipo.name} IPO?`,
      answer: `The price band of ${ipo.name} IPO is set at ₹${Number(ipo.price_band_low)} to ₹${Number(ipo.price_band_high)} per share. Retail investors can apply at the cut-off price.`,
    },
    {
      question: `What is the lot size of ${ipo.name} IPO?`,
      answer: `The lot size of ${ipo.name} IPO is ${ipo.lot_size} shares. The minimum investment required at the upper price band is ${formatCurrency(ipo.lot_size * Number(ipo.price_band_high))}.`,
    },
    {
      question: `What is the expected listing price of ${ipo.name} IPO?`,
      answer: `Based on the current GMP of ₹${latestGmp}, ${ipo.name} IPO is expected to list at approximately ${formatCurrency(expectedListing)} per share.`,
    },
    {
      question: `Should you apply for ${ipo.name} IPO?`,
      answer: `Investment decisions should be based on your own research and risk appetite. ${ipo.name} IPO has a price band of ₹${Number(ipo.price_band_low)}-₹${Number(ipo.price_band_high)} and current GMP indicates ${latestGmp >= 0 ? 'positive' : 'negative'} market sentiment. Please consult your financial advisor before investing.`,
    },
  ];
}

const IPOFAQSection = ({ ipo, latestGmp, expectedListing }: Props) => {
  const faqs = generateFAQs(ipo, latestGmp, expectedListing);

  return (
    <section className="bg-card border border-border rounded-lg p-5 mb-6">
      <h2 className="font-serif text-lg font-bold text-foreground mb-3">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-sm text-left font-medium">{faq.question}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export default IPOFAQSection;

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AlertTriangle } from 'lucide-react';

const Disclaimer = () => (
  <div className="flex min-h-screen flex-col bg-background">
    <Header />
    <main className="container mx-auto flex-1 px-4 py-10 max-w-3xl">
      <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">Disclaimer</h1>

      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 mb-8 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <p className="text-sm text-foreground">
          <strong>Important:</strong> IPOMint is <strong>not a SEBI-registered</strong> investment advisor, research analyst, or stockbroker. The information on this website is for educational purposes only and should not be construed as investment advice.
        </p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="font-serif text-xl font-semibold mb-2">SEBI Disclaimer</h2>
          <p className="text-muted-foreground">IPOMint does not hold any registration with the Securities and Exchange Board of India (SEBI). We do not provide personalized investment advice. All content is general market information published for informational purposes only.</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-2">GMP (Grey Market Premium) Disclaimer</h2>
          <p className="text-muted-foreground">Grey Market Premium (GMP) figures shown on this site are sourced from <strong className="text-foreground">unofficial grey market dealers</strong>. The grey market is an unregulated, unauthorized market and trading in it is not endorsed by SEBI, BSE, or NSE. GMP values:</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
            <li>Are indicative only and may change rapidly</li>
            <li>Do not guarantee listing price or listing gains</li>
            <li>May vary between sources and locations</li>
            <li>Should not be the sole basis for any investment decision</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-2">Market Risk Warning</h2>
          <p className="text-muted-foreground">Investments in securities markets are subject to market risks. Read all the related documents carefully before investing. Past performance of IPOs is not indicative of future results. You may lose part or all of your invested capital.</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-2">Data Accuracy</h2>
          <p className="text-muted-foreground">While we strive to provide accurate and timely information, we make no warranties about completeness, accuracy, reliability, or availability of the data. Always verify IPO details, dates, price bands, and financials from the official Red Herring Prospectus (RHP) on the SEBI website (<span className="text-primary">sebi.gov.in</span>) and exchange websites (<span className="text-primary">bseindia.com</span>, <span className="text-primary">nseindia.com</span>).</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-2">No Liability</h2>
          <p className="text-muted-foreground">IPOMint, its owners, employees, and contributors shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of information presented on this website. Users are advised to consult a SEBI-registered investment advisor before making any investment decision.</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-2">Third-Party Content</h2>
          <p className="text-muted-foreground">Market data (Nifty, Sensex, Bank Nifty) is sourced from third-party providers and may be delayed. We do not guarantee the accuracy of such third-party content.</p>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default Disclaimer;

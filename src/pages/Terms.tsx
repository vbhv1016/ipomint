import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Terms = () => (
  <div className="flex min-h-screen flex-col bg-background">
    <Header />
    <main className="container mx-auto flex-1 px-4 py-10 max-w-3xl">
      <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <div className="space-y-6">
        <section>
          <h2 className="font-serif text-xl font-semibold mb-2">1. Acceptance</h2>
          <p className="text-muted-foreground">By accessing IPOMint, you agree to these terms. If you do not agree, please do not use the service.</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-2">2. Not Investment Advice</h2>
          <p className="text-muted-foreground">All content on this site — IPO data, GMP, subscription numbers, listing gains, blog posts — is for informational and educational purposes only. It is <strong className="text-foreground">not investment advice</strong>, financial advice, or a recommendation to buy or sell any security.</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-2">3. No SEBI Registration</h2>
          <p className="text-muted-foreground">IPOMint is <strong className="text-foreground">not registered with SEBI</strong> as an investment advisor, research analyst, or stockbroker. Always consult a SEBI-registered financial advisor before making investment decisions.</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-2">4. Data Accuracy</h2>
          <p className="text-muted-foreground">We strive for accuracy but make no guarantees. GMP figures are sourced from unofficial grey market sources and may be inaccurate or outdated. Always verify with official sources (SEBI, BSE, NSE, RHP) before acting.</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-2">5. User Conduct</h2>
          <p className="text-muted-foreground">You agree not to misuse the service, attempt unauthorized access, scrape data automatically, or use the site for any unlawful purpose.</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-2">6. Limitation of Liability</h2>
          <p className="text-muted-foreground">IPOMint and its operators are not liable for any losses, damages, or claims arising from your use of the site or reliance on its content. Investing in IPOs and equities involves market risk; you may lose your entire capital.</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-2">7. Changes to Terms</h2>
          <p className="text-muted-foreground">We may update these terms at any time. Continued use of the service constitutes acceptance of the updated terms.</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-2">8. Governing Law</h2>
          <p className="text-muted-foreground">These terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of courts in India.</p>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default Terms;

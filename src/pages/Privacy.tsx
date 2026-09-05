import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Privacy = () => (
  <div className="flex min-h-screen flex-col bg-background">
    <Header />
    <main className="container mx-auto flex-1 px-4 py-10 max-w-3xl">
      <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <div className="prose prose-sm md:prose-base max-w-none text-foreground space-y-6">
        <section>
          <h2 className="font-serif text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
          <p className="text-muted-foreground">We collect minimal information needed to operate the service: email address (when you subscribe to updates or create an account), and anonymous usage analytics (page views, device type, referrer).</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mt-6 mb-2">2. How We Use Information</h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>To provide IPO updates and notifications you request</li>
            <li>To improve site performance and user experience</li>
            <li>To respond to inquiries and support requests</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mt-6 mb-2">3. Cookies & Analytics</h2>
          <p className="text-muted-foreground">We use cookies and analytics tools (such as Google Analytics) to understand how visitors use the site. You can disable cookies in your browser settings.</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mt-6 mb-2">4. Data Sharing</h2>
          <p className="text-muted-foreground">We do not sell or rent personal data. We may share data with service providers (hosting, analytics, email) under strict confidentiality agreements.</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mt-6 mb-2">5. Data Security</h2>
          <p className="text-muted-foreground">We use industry-standard security practices including encrypted connections (HTTPS), secure authentication, and row-level database security.</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mt-6 mb-2">6. Your Rights</h2>
          <p className="text-muted-foreground">You may request access, correction, or deletion of your personal data at any time by contacting us.</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mt-6 mb-2">7. Contact</h2>
          <p className="text-muted-foreground">For privacy questions, contact us via the email listed on our contact page.</p>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default Privacy;

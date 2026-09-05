import { siteOrigin } from '@/lib/utils';
import { useParams, Link } from '@/lib/router-compat';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useIPOBySlug, useGMPHistory, useSubscriptionHistory, useIPOs } from '@/hooks/useIPOData';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import IPOHeroSection from '@/components/ipo-detail/IPOHeroSection';
import IPOContentSections from '@/components/ipo-detail/IPOContentSections';
import IPOCharts from '@/components/ipo-detail/IPOCharts';
import IPOFAQSection, { generateFAQs } from '@/components/ipo-detail/IPOFAQSection';
import IPOSEOContent from '@/components/ipo-detail/IPOSEOContent';
import IPOInvestmentTable from '@/components/ipo-detail/IPOInvestmentTable';
import IPORelatedLinks from '@/components/ipo-detail/IPORelatedLinks';
import AIAdvisorCard from '@/components/AIAdvisorCard';

const IPODetail = () => {
  const { id: slug } = useParams<{ id: string }>();
  const { data: ipo, isLoading, error } = useIPOBySlug(slug || '');
  const { data: gmpHistory = [] } = useGMPHistory(ipo?.id);
  const { data: subHistory = [] } = useSubscriptionHistory(ipo?.id);
  const { data: allIPOs = [] } = useIPOs();

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading IPO details...</span>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !ipo) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <h1 className="font-serif text-2xl font-bold text-foreground mb-2">IPO Not Found</h1>
          <p className="text-muted-foreground mb-4">The IPO you're looking for doesn't exist.</p>
          <Link to="/" className="text-sm text-primary hover:underline">← Back to Dashboard</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const latestGmp = gmpHistory.length > 0 ? Number(gmpHistory[gmpHistory.length - 1].gmp) : 0;
  const expectedListing = Number(ipo.price_band_high) + latestGmp;
  const gmpPercent = ((latestGmp / Number(ipo.price_band_high)) * 100).toFixed(1);

  const faqs = generateFAQs(ipo, latestGmp, expectedListing);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />


      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link to="/ipo-gmp-list" className="hover:text-foreground transition-colors">IPO GMP List</Link>
            <span>/</span>
            <span className="text-foreground">{ipo.name} IPO</span>
          </nav>

          <IPOHeroSection ipo={ipo} latestGmp={latestGmp} expectedListing={expectedListing} gmpPercent={gmpPercent} />

          <IPOContentSections ipo={ipo} latestGmp={latestGmp} expectedListing={expectedListing} />

          <IPOCharts gmpHistory={gmpHistory} subHistory={subHistory} />

          <IPOInvestmentTable ipo={ipo} expectedListing={expectedListing} />

          <IPOSEOContent ipo={ipo} latestGmp={latestGmp} expectedListing={expectedListing} />

          <div className="my-6">
            <AIAdvisorCard ipoId={ipo.id} ipoName={ipo.name} />
          </div>

          <IPOFAQSection ipo={ipo} latestGmp={latestGmp} expectedListing={expectedListing} />

          <IPORelatedLinks relatedIPOs={allIPOs} currentSlug={ipo.slug} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default IPODetail;

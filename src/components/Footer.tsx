import { TrendingUp } from 'lucide-react';
import { Link } from '@/lib/router-compat';

const Footer = () => (
  <footer className="border-t border-border bg-card mt-auto">
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-primary">
              <TrendingUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-base font-bold text-foreground">IPOMint</span>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Track live IPO Grey Market Premium, subscription status, and listing gains for Indian stock market IPOs.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-foreground mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground transition-colors">IPO Dashboard</Link></li>
            <li><Link to="/upcoming-ipo" className="hover:text-foreground transition-colors">Upcoming IPOs</Link></li>
            <li><Link to="/ipo-calendar" className="hover:text-foreground transition-colors">IPO Calendar</Link></li>

            <li><Link to="/ipo-gmp-list" className="hover:text-foreground transition-colors">IPO GMP List</Link></li>
            <li><Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-foreground mb-3">IPO Tools</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/ipo-allotment-calculator" className="hover:text-foreground transition-colors">Allotment Calculator</Link></li>
            <li><Link to="/ipo-listing-gain-calculator" className="hover:text-foreground transition-colors">Listing Gain Calculator</Link></li>
            <li><Link to="/ipo-subscription-status" className="hover:text-foreground transition-colors">Subscription Status</Link></li>
            <li><Link to="/ipo-allotment-status" className="hover:text-foreground transition-colors">Allotment Status</Link></li>
            <li><Link to="/compare" className="hover:text-foreground transition-colors">Compare IPOs</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-foreground mb-3">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</Link></li>
            <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
          </ul>
          <p className="text-xs text-muted-foreground leading-relaxed mt-3">
            Not SEBI registered. GMP data is unofficial. Not investment advice.
          </p>
        </div>
      </div>
      <div className="mt-8 pt-4 border-t border-border text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} IPOMint. All rights reserved. · <Link to="/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</Link>
      </div>
    </div>
  </footer>
);

export default Footer;

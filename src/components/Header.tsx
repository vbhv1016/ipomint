import { Link, useLocation } from '@/lib/router-compat';
import { TrendingUp, BarChart3, Menu, X, BookOpen, GitCompareArrows, Calculator, ChevronDown, Clock, List, Users, Award, Sparkles, Trophy, Newspaper, CalendarDays, ExternalLink } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import { PRIMARY_BROKER, BROKERS } from '@/lib/brokers';

const navItems = [
  { label: 'IPO Dashboard', path: '/', icon: BarChart3 },
  { label: 'IPO Calendar', path: '/ipo-calendar', icon: CalendarDays },
  { label: 'Performance', path: '/ipo-performance', icon: Trophy },
  { label: 'Market News', path: '/market-news', icon: Newspaper },
  { label: 'Blog', path: '/blog', icon: BookOpen },
];

const toolsDropdown = [
  { label: 'Allotment Calculator', path: '/ipo-allotment-calculator', icon: Calculator },
  { label: 'Listing Gain Calculator', path: '/ipo-listing-gain-calculator', icon: TrendingUp },
];

const moreDropdown = [
  { label: 'Upcoming IPOs', path: '/upcoming-ipo', icon: Clock },
  { label: 'IPO GMP List', path: '/ipo-gmp-list', icon: List },
  { label: 'Subscription Status', path: '/ipo-subscription-status', icon: Users },
  { label: 'Allotment Status', path: '/ipo-allotment-status', icon: Award },
  { label: 'AI Advisor', path: '/ai-advisor', icon: Sparkles },
  { label: 'Compare IPOs', path: '/compare', icon: GitCompareArrows },
];


const Header = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) setToolsOpen(false);
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const DropdownMenu = ({ items, open }: { items: typeof toolsDropdown; open: boolean }) => {
    if (!open) return null;
    return (
      <div className="absolute top-full left-0 mt-1 w-52 rounded-md border border-border bg-card shadow-lg z-50 py-1">
        {items.map(item => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => { setToolsOpen(false); setMoreOpen(false); }}
            className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
              location.pathname === item.path
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </div>
    );
  };

  const isToolActive = toolsDropdown.some(t => location.pathname === t.path);
  const isMoreActive = moreDropdown.some(t => location.pathname === t.path);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold leading-tight text-foreground">IPOMint</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Grey Market Premium</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}

          {/* IPO Tools Dropdown */}
          <div className="relative" ref={toolsRef}>
            <button
              onClick={() => { setToolsOpen(!toolsOpen); setMoreOpen(false); }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isToolActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <Calculator className="h-4 w-4" />
              IPO Tools
              <ChevronDown className={`h-3 w-3 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
            </button>
            <DropdownMenu items={toolsDropdown} open={toolsOpen} />
          </div>

          {/* More Pages Dropdown */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => { setMoreOpen(!moreOpen); setToolsOpen(false); }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isMoreActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <List className="h-4 w-4" />
              More
              <ChevronDown className={`h-3 w-3 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
            </button>
            <DropdownMenu items={moreDropdown} open={moreOpen} />
          </div>
        </nav>

        <div className="flex items-center gap-1">
          <a
            href={PRIMARY_BROKER.url}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 rounded-md bg-gain px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Apply to IPO
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <ThemeToggle />

          <button
            className="md:hidden p-2 text-muted-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile backdrop blur overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-x-0 top-16 bottom-0 z-30 bg-background/60 backdrop-blur-md"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="md:hidden relative z-40 border-t border-border bg-card px-4 pb-3 max-h-[70vh] overflow-y-auto shadow-lg">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                location.pathname === item.path ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 pt-3 pb-1">IPO Tools</div>
          {toolsDropdown.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                location.pathname === item.path ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 pt-3 pb-1">More</div>
          {moreDropdown.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                location.pathname === item.path ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 pt-3 pb-1">Apply via broker</div>
          {BROKERS.map(b => (
            <a
              key={b.id}
              href={b.url}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="flex items-center justify-between gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent"
            >
              <span>{b.name}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ))}
        </nav>

      )}
    </header>
  );
};

export default Header;

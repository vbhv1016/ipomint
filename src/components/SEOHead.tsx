import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  jsonLd?: Record<string, any>;
}

const DEFAULT_OG_IMAGE = 'https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/eca61baf-936a-40f6-a9d0-2e374ca765e2/id-preview-cf0e2c7b--cba5c212-04b0-450a-b9cf-e20a67be5af0.lovable.app-1772343585398.png';

const SEOHead = ({ title, description, canonical, ogImage, jsonLd }: SEOHeadProps) => {
  useEffect(() => {
    document.title = title;

    const setMeta = (name: string, content: string, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', description);

    // Open Graph
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:image', ogImage || DEFAULT_OG_IMAGE, 'property');
    setMeta('og:locale', 'en_IN', 'property');
    if (canonical) setMeta('og:url', canonical, 'property');

    // Twitter
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage || DEFAULT_OG_IMAGE);

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) {
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonical;
    } else {
      link?.remove();
    }

    // JSON-LD
    const existingScript = document.querySelector('script[data-seo-jsonld]');
    existingScript?.remove();
    if (jsonLd) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-jsonld', 'true');
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      document.querySelector('script[data-seo-jsonld]')?.remove();
    };
  }, [title, description, canonical, ogImage, jsonLd]);

  return null;
};

export default SEOHead;

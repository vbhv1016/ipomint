import { useEffect } from "react";
import type { ReactNode } from "react";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useRouter,
  Link,
} from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import NotFound from "@/pages/NotFound";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import appCss from "../styles.css?url";

const OG_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/eca61baf-936a-40f6-a9d0-2e374ca765e2/id-preview-cf0e2c7b--cba5c212-04b0-450a-b9cf-e20a67be5af0.lovable.app-1772343585398.png";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { title: "IPOMint — Live IPOMint for Indian IPOs" },
      {
        name: "description",
        content:
          "Track live IPO Grey Market Premium (GMP), subscription status, listing gains for upcoming Indian stock market IPOs on NSE & BSE.",
      },
      { name: "author", content: "IPOMint" },
      {
        name: "google-site-verification",
        content: "XLjPoyivXNui_NojyBRnWOsh09AYhJ7-iB-77T6dBoM",
      },
      { name: "robots", content: "index, follow" },
      { name: "theme-color", content: "#1e3a5f" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "IPOMint — Live IPOMint for Indian IPOs" },
      {
        property: "og:description",
        content:
          "Track live IPO Grey Market Premium (GMP), subscription status, listing gains for upcoming Indian stock market IPOs on NSE & BSE.",
      },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "IPOMint — Live IPOMint for Indian IPOs" },
      {
        name: "twitter:description",
        content:
          "Track live IPO Grey Market Premium (GMP), subscription status, listing gains for upcoming Indian stock market IPOs on NSE & BSE.",
      },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ],
    scripts: [
      {
        // Theme bootstrap — must run before first paint to avoid a dark-mode flash.
        children:
          "(function(){var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}})();",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <h1 className="text-2xl font-bold text-foreground">This page didn't load</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Something went wrong while loading this page. You can try again or head back home.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Try again
        </button>
        <Link
          to="/"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

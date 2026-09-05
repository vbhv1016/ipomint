import { useParams } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AIAdvisorCard from "@/components/AIAdvisorCard";
import { Loader2 } from "lucide-react";
import { Link } from "@/lib/router-compat";

export default function AIAdvisor() {
  const { id } = useParams<{ id: string }>();
  const { data: ipo, isLoading } = useQuery({
    queryKey: ["ipo-by-slug", id],
    queryFn: async () => {
      const { data } = await supabase.from("ipos").select("*").eq("slug", id!).maybeSingle();
      return data;
    },
    enabled: !!id,
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-10 max-w-3xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : !ipo ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">IPO not found.</div>
            <Link to="/" className="text-primary underline">Back to home</Link>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <Link to={`/ipo/${ipo.slug}`} className="text-xs text-muted-foreground hover:text-primary">← Back to {ipo.name} IPO details</Link>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-6">
              Should You Apply to {ipo.name} IPO?
            </h1>
            <AIAdvisorCard ipoId={ipo.id} ipoName={ipo.name} />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

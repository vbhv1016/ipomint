import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@/lib/router-compat";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronLeft, ChevronRight, Loader2, BellRing, CalendarDays } from "lucide-react";

type EventKind = "open" | "close" | "allotment" | "listing";

const KIND_STYLE: Record<EventKind, { label: string; cls: string }> = {
  open: { label: "Opens", cls: "bg-gain/15 text-gain border-gain/30" },
  close: { label: "Closes", cls: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  allotment: { label: "Allotment", cls: "bg-primary/15 text-primary border-primary/30" },
  listing: { label: "Listing", cls: "bg-loss/15 text-loss border-loss/30" },
};

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: string, n: number) => {
  const x = new Date(d + "T00:00:00Z");
  x.setUTCDate(x.getUTCDate() + n);
  return iso(x);
};

export default function IPOCalendar() {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const { data: ipos = [], isLoading } = useQuery({
    queryKey: ["calendar-ipos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ipos")
        .select("id,name,slug,exchange,open_date,close_date,listing_date,status,price_band_high,lot_size")
        .order("open_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });

  const eventsByDay = useMemo(() => {
    const map = new Map<string, { kind: EventKind; ipo: (typeof ipos)[number] }[]>();
    const push = (day: string | null | undefined, kind: EventKind, ipo: (typeof ipos)[number]) => {
      if (!day) return;
      const key = day.slice(0, 10);
      const arr = map.get(key) ?? [];
      arr.push({ kind, ipo });
      map.set(key, arr);
    };
    for (const ipo of ipos) {
      push(ipo.open_date, "open", ipo);
      push(ipo.close_date, "close", ipo);
      push(ipo.close_date ? addDays(ipo.close_date.slice(0, 10), 2) : null, "allotment", ipo);
      push(ipo.listing_date, "listing", ipo);
    }
    return map;
  }, [ipos]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${year}-${String(month + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`),
  ];

  const monthLabel = cursor.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const todayKey = iso(new Date());

  const upcoming = useMemo(() => {
    const list: { day: string; kind: EventKind; ipo: (typeof ipos)[number] }[] = [];
    for (const [day, evs] of eventsByDay) {
      if (day >= todayKey) evs.forEach((e) => list.push({ day, ...e }));
    }
    return list.sort((a, b) => a.day.localeCompare(b.day)).slice(0, 12);
  }, [eventsByDay, todayKey]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <span className="text-foreground">IPO Calendar</span>
        </nav>

        <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-1">IPO Calendar 2026</h1>
        <p className="text-sm text-muted-foreground mb-5">
          Open and close dates, allotment day and listing day for every tracked IPO. Alerts are emailed automatically each morning.
        </p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCursor(new Date(year, month - 1, 1))}
              className="p-2 rounded-md border border-border hover:bg-accent"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-semibold text-foreground min-w-[9rem] text-center">{monthLabel}</span>
            <button
              onClick={() => setCursor(new Date(year, month + 1, 1))}
              className="p-2 rounded-md border border-border hover:bg-accent"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="text-xs px-3 py-2 rounded-md border border-border hover:bg-accent flex items-center gap-1.5"
          >
            <CalendarDays className="h-3.5 w-3.5" /> Today
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {(Object.keys(KIND_STYLE) as EventKind[]).map((k) => (
            <span key={k} className={`text-[11px] px-2 py-0.5 rounded-full border ${KIND_STYLE[k].cls}`}>
              {KIND_STYLE[k].label}
            </span>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            {/* Desktop grid */}
            <div className="hidden md:block rounded-lg border border-border overflow-hidden">
              <div className="grid grid-cols-7 bg-muted/50 text-[11px] uppercase tracking-wider text-muted-foreground">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="px-2 py-2 text-center font-semibold">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {cells.map((day, i) => (
                  <div
                    key={i}
                    className={`min-h-[104px] border-t border-l border-border p-1.5 ${day === todayKey ? "bg-primary/5" : ""}`}
                  >
                    {day && (
                      <>
                        <div className={`text-xs mb-1 ${day === todayKey ? "font-bold text-primary" : "text-muted-foreground"}`}>
                          {Number(day.slice(8))}
                        </div>
                        <div className="space-y-1">
                          {(eventsByDay.get(day) ?? []).slice(0, 3).map((e, j) => (
                            <Link
                              key={j}
                              to={`/ipo/${e.ipo.slug}`}
                              className={`block truncate text-[10px] px-1.5 py-0.5 rounded border ${KIND_STYLE[e.kind].cls}`}
                              title={`${e.ipo.name} — ${KIND_STYLE[e.kind].label}`}
                            >
                              {e.ipo.name}
                            </Link>
                          ))}
                          {(eventsByDay.get(day) ?? []).length > 3 && (
                            <div className="text-[10px] text-muted-foreground pl-1">
                              +{(eventsByDay.get(day) ?? []).length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile agenda */}
            <div className="md:hidden space-y-2">
              {cells.filter((d): d is string => !!d && (eventsByDay.get(d)?.length ?? 0) > 0).map((day) => (
                <div key={day} className="rounded-lg border border-border bg-card p-3">
                  <div className={`text-xs font-semibold mb-2 ${day === todayKey ? "text-primary" : "text-muted-foreground"}`}>
                    {new Date(day + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                  </div>
                  <div className="space-y-1.5">
                    {(eventsByDay.get(day) ?? []).map((e, j) => (
                      <Link key={j} to={`/ipo/${e.ipo.slug}`} className="flex items-center justify-between gap-2">
                        <span className="text-sm text-foreground truncate">{e.ipo.name}</span>
                        <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded border ${KIND_STYLE[e.kind].cls}`}>
                          {KIND_STYLE[e.kind].label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              {cells.every((d) => !d || (eventsByDay.get(d)?.length ?? 0) === 0) && (
                <div className="text-center text-sm text-muted-foreground py-10">No IPO events this month.</div>
              )}
            </div>
          </>
        )}

        {/* Upcoming list */}
        <section className="mt-8">
          <h2 className="font-serif text-xl font-bold text-foreground mb-3 flex items-center gap-2">
            <BellRing className="h-5 w-5 text-primary" /> Next up
          </h2>
          <div className="rounded-lg border border-border divide-y divide-border">
            {upcoming.length === 0 && <div className="p-4 text-sm text-muted-foreground">No upcoming dates.</div>}
            {upcoming.map((e, i) => (
              <Link key={i} to={`/ipo/${e.ipo.slug}`} className="flex items-center justify-between gap-3 p-3 hover:bg-accent">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{e.ipo.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(e.day + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} · {e.ipo.exchange}
                  </div>
                </div>
                <span className={`shrink-0 text-[11px] px-2 py-0.5 rounded-full border ${KIND_STYLE[e.kind].cls}`}>
                  {KIND_STYLE[e.kind].label}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

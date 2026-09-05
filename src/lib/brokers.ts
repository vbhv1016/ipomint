/**
 * Broker account-opening links used for IPO "Apply" CTAs.
 *
 * To switch to your affiliate/referral links, replace the `url` values below
 * with the tracked URLs from each broker's partner dashboard.
 */
export interface Broker {
  id: string;
  name: string;
  url: string;
  tagline: string;
}

export const BROKERS: Broker[] = [
  {
    id: "zerodha",
    name: "Zerodha",
    url: "https://zerodha.com/open-account/",
    tagline: "Apply via UPI on Kite",
  },
  {
    id: "groww",
    name: "Groww",
    url: "https://groww.in/open-demat-account",
    tagline: "One-tap IPO application",
  },
  {
    id: "angelone",
    name: "Angel One",
    url: "https://www.angelone.in/open-demat-account",
    tagline: "Mainline + SME IPOs",
  },
  {
    id: "upstox",
    name: "Upstox",
    url: "https://upstox.com/open-demat-account/",
    tagline: "Fast UPI mandate",
  },
];

/** Primary broker used for compact single-button CTAs (e.g. the header). */
export const PRIMARY_BROKER = BROKERS[0];

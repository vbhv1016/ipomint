import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// SSR-safe origin — window doesn't exist during server rendering.
export function siteOrigin(): string {
  return typeof window !== "undefined" ? window.location.origin : "https://ipomint.in";
}

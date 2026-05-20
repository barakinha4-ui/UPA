import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility to format dates
export function formatDate(dateStr: string | null | undefined, locale: 'pt' | 'en'): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr; // fallback for partial strings
    return d.toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC' // keep release date stable
    });
  } catch {
    return dateStr;
  }
}

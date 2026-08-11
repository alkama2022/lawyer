import { format, formatDistanceToNow, differenceInCalendarDays } from "date-fns";

export const fmtDate = (d?: string) => (d ? format(new Date(d), "dd MMM yyyy") : "—");
export const fmtLongDate = (d?: string) => (d ? format(new Date(d), "EEEE, dd MMMM yyyy") : "—");
export const fmtMonth = (d: string) => format(new Date(d), "MMM yyyy");
export const fmtRelative = (d: string) => formatDistanceToNow(new Date(d), { addSuffix: true });
export const daysUntil = (d: string) => differenceInCalendarDays(new Date(d), new Date());

export function fmtSize(kb: number) {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

export function initials(name: string) {
  return name
    .replace(/^(Barrister|Chief|Mr\.|Ms\.|Mrs\.|Hon\.)\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function durationBetween(a?: string, b?: string) {
  if (!a || !b) return "—";
  const days = Math.abs(differenceInCalendarDays(new Date(b), new Date(a)));
  if (days < 45) return `${days} days`;
  const months = Math.round(days / 30);
  return months >= 12 ? `${(months / 12).toFixed(1)} years` : `${months} months`;
}

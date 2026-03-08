import type { Bucket, Payload } from "../types/types";

export function getBuckets(data: Payload): Bucket[] {
  return data.aggregates.byMinute ?? data.aggregates.byHour ?? [];
}

export function getTotalVisitors(data: Payload): number {
  // Business logic: Total visitors today is usually taken as IN
  return data.aggregates.total.in;
}

export function getOccupancy(data: Payload): number {
  return (
    data.aggregates.occupancyEstimate?.current ?? data.aggregates.total.net ?? 0
  );
}

export function getPeakBucket(buckets: Bucket[]): Bucket | null {
  if (buckets.length === 0) return null;
  return buckets.reduce((best, cur) =>
    cur.in + cur.out > best.in + best.out ? cur : best,
  );
}

export function formatHHMM(isoTs: string): string {
  // Simplify by directly extracting HH:MM from the ISO string
  // For example "2026-02-17T09:12:00+02:00" => "09:12"
  const tIndex = isoTs.indexOf("T");
  if (tIndex === -1) return isoTs;
  return isoTs.substring(tIndex + 1, tIndex + 6);
}

export function formatUptime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const days = Math.floor(s / 86400);
  const hrs = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  if (days > 0) return `${days}d ${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

export function formatSiteName(siteId: string): string {
  const map: Record<string, string> = {
    "tampere-campus-A": "Tampere Campus A",
    "tampere-campus-B": "Tampere Campus B",
  };
  return map[siteId] ?? siteId;
}

export function formatRequestTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return String(date.getUTCFullYear()).padStart(4, "0") + pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) + pad(date.getUTCHours()) + pad(date.getUTCMinutes()) + pad(date.getUTCSeconds());
}

/**
 * Consistent date handling for workout dates.
 * Uses YYYY-MM-DD format to avoid timezone and locale parsing issues.
 */

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Parse entry.date (from storage) to YYYY-MM-DD key.
 * Handles both "YYYY-MM-DD" and "M/D/YYYY" / "MM/DD/YYYY" formats.
 */
export function parseEntryDateToKey(dateStr: string): string | null {
  if (!dateStr || typeof dateStr !== "string") return null;

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // M/D/YYYY or MM/DD/YYYY (en-US format: month/day/year)
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (isNaN(month) || isNaN(day) || isNaN(year)) return null;
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  // Try native parse as fallback
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return toDateKey(d);
}

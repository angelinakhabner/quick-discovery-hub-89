import type { ResultItem } from "@/lib/mock-data";

function parseEventDateTime(item: ResultItem): { start: Date; end: Date } | null {
  // Parse Polish date like "12 marca" + time like "19:00"
  const polishMonths: Record<string, number> = {
    stycznia: 0, lutego: 1, marca: 2, kwietnia: 3, maja: 4, czerwca: 5,
    lipca: 6, sierpnia: 7, września: 8, października: 9, listopada: 10, grudnia: 11,
  };

  if (!item.date || !item.time) return null;

  const dateMatch = item.date.match(/(\d+)\s+(\w+)/);
  if (!dateMatch) return null;

  const day = parseInt(dateMatch[1], 10);
  const monthStr = dateMatch[2].toLowerCase();
  const month = polishMonths[monthStr];
  if (month === undefined) return null;

  const timeMatch = item.time.match(/(\d{1,2}):(\d{2})/);
  if (!timeMatch) return null;

  const hours = parseInt(timeMatch[1], 10);
  const minutes = parseInt(timeMatch[2], 10);

  const now = new Date();
  const year = now.getFullYear();

  const start = new Date(year, month, day, hours, minutes);

  // Estimate end from duration or default 2h
  let durationMinutes = 120;
  if (item.duration) {
    const durMatch = item.duration.match(/(\d+)/);
    if (durMatch) durationMinutes = parseInt(durMatch[1], 10);
  }

  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  return { start, end };
}

function formatICSDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function formatGoogleDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function generateICSFile(item: ResultItem): string | null {
  const dt = parseEventDateTime(item);
  if (!dt) return null;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Whatson//EN",
    "BEGIN:VEVENT",
    `DTSTART:${formatICSDate(dt.start)}`,
    `DTEND:${formatICSDate(dt.end)}`,
    `SUMMARY:${item.title}`,
    `LOCATION:${item.venue || ""}`,
    `DESCRIPTION:${(item.description || "").replace(/\n/g, "\\n")}`,
    item.sourceUrl ? `URL:${item.sourceUrl}` : "",
    `UID:${Date.now()}-${Math.random().toString(36).slice(2)}@whatson`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  return lines.join("\r\n");
}

export function downloadICS(item: ResultItem) {
  const ics = generateICSFile(item);
  if (!ics) return;

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${item.title.replace(/[^a-zA-Z0-9]/g, "_")}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getGoogleCalendarUrl(item: ResultItem): string | null {
  const dt = parseEventDateTime(item);
  if (!dt) return null;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: item.title,
    dates: `${formatGoogleDate(dt.start)}/${formatGoogleDate(dt.end)}`,
    details: item.description || "",
    location: item.venue || "",
  });

  if (item.sourceUrl) {
    params.set("details", `${item.description || ""}\n\n${item.sourceUrl}`);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

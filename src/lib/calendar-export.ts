import { ACTIVITY_TYPE_CONFIG } from "@/config/activity-types";
import { AGENDA_CONFIG } from "@/config/agenda";
import { COURSES } from "@/data/activities";
import type { Activity } from "@/types/activity";

const encoder = new TextEncoder();

const zonedFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: AGENDA_CONFIG.timezone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function utcStamp(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

/**
 * Converts Santiago wall time to UTC using the browser's timezone database.
 * Rejects nonexistent local times instead of silently shifting the activity.
 */
export function toCalendarUtc(date: string, time: string): string {
  const target = Date.parse(`${date}T${time}:00Z`);

  if (!Number.isFinite(target)) {
    throw new Error("La actividad tiene una fecha u horario inválido.");
  }

  let instant = target;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = zonedFormatter.formatToParts(new Date(instant));

    function part(type: string): string {
      const value = parts.find((item) => item.type === type)?.value;

      if (!value) {
        throw new Error(`No se pudo obtener ${type}.`);
      }

      return value;
    }

    const represented = Date.parse(
      `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}:${part("second")}Z`,
    );

    const difference = target - represented;

    if (difference === 0) {
      return utcStamp(new Date(instant));
    }

    instant += difference;
  }

  throw new Error("El horario no existe en la zona horaria de Santiago.");
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

/** RFC 5545 limits content lines to 75 octets, including continuation spaces. */
function foldLine(value: string): string {
  const lines: string[] = [];
  let line = "";
  let bytes = 0;

  for (const character of value) {
    const size = encoder.encode(character).length;

    if (bytes + size > 75) {
      lines.push(line);
      line = " ";
      bytes = 1;
    }

    line += character;
    bytes += size;
  }

  lines.push(line);

  return lines.join("\r\n");
}

function getEventDetails(activity: Activity) {
  const category = ACTIVITY_TYPE_CONFIG[activity.type];
  const course = COURSES.find((item) => item.id === activity.courseId)?.name ?? activity.title;

  return {
    title: `${category.label}: ${activity.title}`,
    description: [
      category.description,
      `Tipo: ${category.label}`,
      `Curso: ${course}`,
      `Responsable: ${activity.mentor}`,
      `Zona horaria: ${AGENDA_CONFIG.timezone}`,
    ].join("\n"),
    start: toCalendarUtc(activity.date, activity.startTime),
    end: toCalendarUtc(activity.date, activity.endTime),
  };
}

export function buildCalendar(activities: readonly Activity[], now: Date = new Date()): string {
  const events = activities.toSorted(
    (first, second) =>
      first.date.localeCompare(second.date) ||
      first.startTime.localeCompare(second.startTime) ||
      first.id.localeCompare(second.id),
  );

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Open UCSH//Agenda ICCI//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Agenda ICCI",
    `X-WR-TIMEZONE:${AGENDA_CONFIG.timezone}`,
  ];

  for (const activity of events) {
    const event = getEventDetails(activity);

    lines.push(
      "BEGIN:VEVENT",
      `UID:${encodeURIComponent(activity.id)}@agenda.open-ucsh`,
      `DTSTAMP:${utcStamp(now)}`,
      `DTSTART:${event.start}`,
      `DTEND:${event.end}`,
      `SUMMARY:${escapeText(event.title)}`,
      `DESCRIPTION:${escapeText(event.description)}`,
      `LOCATION:${escapeText(activity.location)}`,
      `CATEGORIES:${escapeText(ACTIVITY_TYPE_CONFIG[activity.type].label)}`,
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");

  return `${lines.map(foldLine).join("\r\n")}\r\n`;
}

export function downloadCalendar(activities: readonly Activity[], filename: string): void {
  if (activities.length === 0) {
    return;
  }

  const blob = new Blob([buildCalendar(activities)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();

  // Leave enough time for mobile browsers to consume the download URL.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function getGoogleCalendarUrl(activity: Activity): string {
  const event = getEventDetails(activity);
  const url = new URL("https://calendar.google.com/calendar/render");

  url.search = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${event.start}/${event.end}`,
    details: event.description,
    location: activity.location,
    ctz: AGENDA_CONFIG.timezone,
  }).toString();

  return url.toString();
}

import { describe, expect, it } from "vite-plus/test";

import { buildCalendar, getGoogleCalendarUrl, toCalendarUtc } from "@/lib/calendar-export";
import type { Activity } from "@/types/activity";

const activity: Activity = {
  id: "test:2026-10-20",
  periodId: "test-period",
  courseId: "test-course",
  title: "Cálculo, límites; práctica",
  type: "mentoring",
  date: "2026-10-20",
  startTime: "10:00",
  endTime: "11:30",
  location: "Sala 1",
  mentor: "Profesor Ejemplo",
};

describe("calendar export", () => {
  it("uses Santiago summer time independently of the device timezone", () => {
    expect(toCalendarUtc("2026-10-20", "10:00")).toBe("20261020T130000Z");
  });

  it("uses Santiago winter time", () => {
    expect(toCalendarUtc("2026-06-15", "10:00")).toBe("20260615T140000Z");
  });

  it("handles a date near the daylight saving transition", () => {
    expect(toCalendarUtc("2026-09-05", "10:00")).toBe("20260905T140000Z");
    expect(toCalendarUtc("2026-09-06", "10:00")).toBe("20260906T130000Z");
  });

  it("rejects a nonexistent Santiago local time", () => {
    expect(() => toCalendarUtc("2026-09-06", "00:30")).toThrow();
  });

  it("includes event details and escapes calendar text", () => {
    const calendar = buildCalendar([activity], new Date("2026-10-20T12:00:00Z"));

    expect(calendar).toContain("DTSTART:20261020T130000Z\r\n");
    expect(calendar).toContain("DTEND:20261020T143000Z\r\n");
    expect(calendar).toContain("DTSTAMP:20261020T120000Z\r\n");
    expect(calendar).toContain("Cálculo\\, límites\\; práctica");
    expect(calendar).toContain("Curso: ");
    expect(calendar).toContain("Responsable: Profesor Ejemplo");
    expect(calendar).toContain("LOCATION:Sala 1\r\n");
    expect(calendar).toContain("CATEGORIES:Mentoría\r\n");
    expect(calendar).toMatch(/END:VCALENDAR\r\n$/);
  });

  it("exports exactly the supplied activities", () => {
    const calendar = buildCalendar([activity]);

    expect(calendar.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(buildCalendar([])).not.toContain("BEGIN:VEVENT");
  });

  it("folds UTF-8 lines without exceeding 75 bytes", () => {
    const calendar = buildCalendar([{ ...activity, title: "Álgebra y computación ".repeat(20) }]);

    for (const line of calendar.split("\r\n")) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }

    const unfolded = calendar.replace(/\r\n /g, "");

    expect(unfolded).toContain(escapeExpectedTitle());
  });

  it("prevents description text from injecting calendar properties", () => {
    const calendar = buildCalendar([{ ...activity, location: "Sala\nSUMMARY:Otro evento" }]);

    expect(calendar).toContain("LOCATION:Sala\\nSUMMARY:Otro evento\r\n");
    expect(calendar).not.toContain("\r\nSUMMARY:Otro evento\r\n");
  });

  it("creates a Google Calendar link with the same UTC interval", () => {
    const url = new URL(getGoogleCalendarUrl(activity));

    expect(url.origin).toBe("https://calendar.google.com");
    expect(url.searchParams.get("dates")).toBe("20261020T130000Z/20261020T143000Z");
    expect(url.searchParams.get("ctz")).toBe("America/Santiago");
    expect(url.searchParams.get("location")).toBe(activity.location);
    expect(url.searchParams.get("text")).toContain(activity.title);
  });
});

function escapeExpectedTitle(): string {
  return `SUMMARY:Mentoría: ${"Álgebra y computación ".repeat(20)}`;
}

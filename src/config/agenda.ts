import { getDateInTimezone, parseDateKey, startOfWeek } from "@/lib/dates";

export const AGENDA_CONFIG = {
  timezone: "America/Santiago",
  firstAvailableDate: "2026-10-01",
  defaultStartHour: 9,
  defaultEndHour: 19,
} as const;

export function getFirstAvailableDate(): Date {
  return parseDateKey(AGENDA_CONFIG.firstAvailableDate);
}

export function getFirstAvailableWeek(): Date {
  return startOfWeek(getFirstAvailableDate());
}

export function clampWeek(date: Date): Date {
  const week = startOfWeek(date);
  const firstWeek = getFirstAvailableWeek();

  return week < firstWeek ? firstWeek : week;
}

export function getSantiagoDate(now: Date = new Date()): Date {
  return getDateInTimezone(AGENDA_CONFIG.timezone, now);
}

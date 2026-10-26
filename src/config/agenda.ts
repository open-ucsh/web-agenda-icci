import { ACADEMIC_DAY_START, ACADEMIC_DAY_END } from "@/config/academic-blocks";
import { getDateInTimezone, parseDateKey, startOfWeek } from "@/lib/dates";

export const AGENDA_CONFIG = {
  timezone: "America/Santiago",
  firstAvailableDate: "2026-10-01",
  defaultStartHour: ACADEMIC_DAY_START / 60,
  defaultEndHour: ACADEMIC_DAY_END / 60,
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

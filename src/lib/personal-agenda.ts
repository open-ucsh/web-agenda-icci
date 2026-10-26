import { ACTIVITY_TYPES } from "@/config/activity-types";
import type { CourseSection } from "@/lib/course-sections";
import { addDays, dateKey, parseDateKey } from "@/lib/dates";
import type { Activity, ActivityType, Holiday } from "@/types/activity";

export interface PersonalClass {
  id: string;
  courseCode: string;
  title: string;
  weekday: number;
  startTime: string;
  endTime: string;
  location: string;
  mentor: string;
}

export interface PersonalSchedule {
  periodId: string;
  validFrom: string;
  validUntil: string;
  entries: PersonalClass[];
}

export interface PersonalAgendaData {
  schedules: PersonalSchedule[];
  selectedTypes: ActivityType[];
  onlyFree: boolean;
}

export function emptyPersonalAgenda(): PersonalAgendaData {
  return {
    schedules: [],
    selectedTypes: ACTIVITY_TYPES.filter((type) => type !== "class"),
    onlyFree: false,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  try {
    return dateKey(parseDateKey(value)) === value;
  } catch {
    return false;
  }
}

function isTime(value: unknown): value is string {
  return typeof value === "string" && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function isPersonalClass(value: unknown): value is PersonalClass {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.courseCode === "string" &&
    typeof value.title === "string" &&
    typeof value.weekday === "number" &&
    Number.isInteger(value.weekday) &&
    value.weekday >= 1 &&
    value.weekday <= 7 &&
    isTime(value.startTime) &&
    isTime(value.endTime) &&
    value.startTime < value.endTime &&
    typeof value.location === "string" &&
    typeof value.mentor === "string"
  );
}

function isPersonalSchedule(value: unknown): value is PersonalSchedule {
  return (
    isRecord(value) &&
    typeof value.periodId === "string" &&
    value.periodId.length > 0 &&
    isDate(value.validFrom) &&
    isDate(value.validUntil) &&
    value.validFrom <= value.validUntil &&
    Array.isArray(value.entries) &&
    value.entries.length > 0 &&
    value.entries.length <= 2000 &&
    value.entries.every(isPersonalClass) &&
    new Set(value.entries.map((entry) => entry.id)).size === value.entries.length
  );
}

export function parsePersonalAgenda(raw: string | null): PersonalAgendaData {
  if (raw === null) return emptyPersonalAgenda();
  const value: unknown = JSON.parse(raw);

  if (
    !isRecord(value) ||
    value.version !== 1 ||
    !Array.isArray(value.schedules) ||
    !value.schedules.every(isPersonalSchedule) ||
    new Set(value.schedules.map((schedule) => schedule.periodId)).size !== value.schedules.length ||
    !Array.isArray(value.selectedTypes) ||
    !value.selectedTypes.every(
      (type: unknown) => typeof type === "string" && ACTIVITY_TYPES.some((item) => item === type),
    ) ||
    typeof value.onlyFree !== "boolean"
  ) {
    throw new Error("El horario guardado tiene un formato inválido.");
  }

  return {
    schedules: value.schedules,
    selectedTypes: [...new Set(value.selectedTypes)] as ActivityType[],
    onlyFree: value.onlyFree,
  };
}

function formatTime(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

export function createPersonalSchedule(
  sections: readonly CourseSection[],
  periodId: string,
  validFrom: string,
  validUntil: string,
): PersonalSchedule {
  const unique = new Map<string, PersonalClass>();

  for (const section of sections) {
    for (const row of section.rows) {
      if (!section.section || row.scheduleIssues.length > 0 || row.blocks.length === 0) {
        throw new Error("El horario contiene una sección con información pendiente.");
      }

      for (const block of row.blocks) {
        const id = JSON.stringify([section.id, block.day, block.startMinutes, block.endMinutes]);

        if (unique.has(id)) continue;
        unique.set(id, {
          id,
          courseCode: section.code,
          title: `${row.name} · S${section.section} · ${row.activity}`,
          weekday: block.day,
          startTime: formatTime(block.startMinutes),
          endTime: formatTime(block.endMinutes),
          location: block.room || "Sala por confirmar",
          mentor: row.teachers || "Docente por confirmar",
        });
      }
    }
  }

  const schedule = { periodId, validFrom, validUntil, entries: [...unique.values()] };
  if (!isPersonalSchedule(schedule)) {
    throw new Error("Confirma el período y un rango de fechas válido.");
  }

  const hasOverlap = schedule.entries.some((first, index) =>
    schedule.entries
      .slice(index + 1)
      .some(
        (second) =>
          first.weekday === second.weekday &&
          first.startTime < second.endTime &&
          second.startTime < first.endTime,
      ),
  );

  if (hasOverlap) throw new Error("El horario contiene clases que se superponen.");

  return schedule;
}

export function getPersonalWeekActivities(
  schedule: PersonalSchedule | undefined,
  weekStart: Date,
  holidays: readonly Holiday[],
): Activity[] {
  if (!schedule) return [];
  const holidayDates = new Set(holidays.map((holiday) => holiday.date));

  return schedule.entries.flatMap((entry) => {
    const date = dateKey(addDays(weekStart, entry.weekday - 1));
    if (date < schedule.validFrom || date > schedule.validUntil || holidayDates.has(date)) {
      return [];
    }

    return [
      {
        id: `personal:${schedule.periodId}:${entry.id}:${date}`,
        periodId: schedule.periodId,
        courseId: `personal:${entry.courseCode}`,
        title: entry.title,
        type: "class" as const,
        date,
        startTime: entry.startTime,
        endTime: entry.endTime,
        location: entry.location,
        mentor: entry.mentor,
      },
    ];
  });
}

export function composeWeekAgenda(
  activities: readonly Activity[],
  classes: readonly Activity[],
  selectedTypes: readonly ActivityType[],
  onlyFree: boolean,
): Activity[] {
  const visibleSupport = activities.filter(
    (activity) =>
      selectedTypes.includes(activity.type) &&
      (!onlyFree ||
        !classes.some(
          (lesson) =>
            lesson.date === activity.date &&
            lesson.startTime < activity.endTime &&
            activity.startTime < lesson.endTime,
        )),
  );

  return [...(selectedTypes.includes("class") ? classes : []), ...visibleSupport];
}

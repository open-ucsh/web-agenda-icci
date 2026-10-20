import { academicDates, periods, schedules } from "@/data/agenda.generated";

export type ActivityType = "pace" | "mentoring" | "tutoring";

export interface Activity {
  id: string;
  periodId: string;
  courseId: string;
  title: string;
  type: ActivityType;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  mentor: string;
}

export const PERIODS = periods;
export const ACADEMIC_DATES = academicDates;

export const COURSES = schedules.map((schedule) => ({
  id: schedule.id,
  name: schedule.name,
}));

function dateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function getSantiagoDate(now: Date = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);

  function part(type: string): number {
    const value = parts.find((item) => item.type === type)?.value;

    if (!value) {
      throw new Error(`No se pudo obtener la fecha: ${type}.`);
    }

    return Number(value);
  }

  return new Date(part("year"), part("month") - 1, part("day"), 12);
}

export function getWeekActivities(weekStart: Date, periodId: string): Activity[] {
  return schedules.flatMap((schedule) => {
    if (schedule.periodId !== periodId) {
      return [];
    }

    const date = new Date(
      weekStart.getFullYear(),
      weekStart.getMonth(),
      weekStart.getDate() + schedule.weekday - 1,
      12,
    );
    const key = dateKey(date);

    if (key < schedule.validFrom || key > schedule.validUntil) {
      return [];
    }

    const role = schedule.responsibleRole === "student" ? "Estudiante" : "Profesor";

    return [
      {
        id: `${schedule.id}:${key}`,
        periodId: schedule.periodId,
        courseId: schedule.id,
        title: schedule.name,
        type: schedule.type,
        date: key,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        location: schedule.location ?? "Ubicación por confirmar",
        mentor: `${role} ${schedule.responsibleName}`,
      },
    ];
  });
}

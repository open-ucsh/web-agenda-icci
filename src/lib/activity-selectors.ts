import { addDays, dateKey } from "@/lib/dates";
import type { Activity, Holiday, ResponsibleRole, WeeklyActivitySchedule } from "@/types/activity";

const RESPONSIBLE_ROLES = {
  student: "Estudiante",
  professor: "Profesor",
  facilitator: "Tallerista",
} satisfies Record<ResponsibleRole, string>;

export function buildWeekActivities(
  schedules: readonly WeeklyActivitySchedule[],
  holidays: readonly Holiday[],
  weekStart: Date,
  periodId: string,
): Activity[] {
  const holidayDates = new Set(holidays.map((holiday) => holiday.date));

  return schedules.flatMap((schedule) => {
    if (schedule.periodId !== periodId) {
      return [];
    }

    const date = addDays(weekStart, schedule.weekday - 1);
    const key = dateKey(date);

    if (key < schedule.validFrom || key > schedule.validUntil || holidayDates.has(key)) {
      return [];
    }

    const role = RESPONSIBLE_ROLES[schedule.responsibleRole];

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

import { agendaRepository } from "@/data/agenda.repository";
import { buildWeekActivities } from "@/lib/activity-selectors";
import type { Activity, Holiday } from "@/types/activity";

export { getSantiagoDate } from "@/config/agenda";
export type { Activity, ActivityType, Holiday } from "@/types/activity";

export const ONLINE_CLASS_NOTICE = {
  date: "2026-10-20",
  title: "Martes 20 de octubre · Clases online",
  message:
    "Por posibles precipitaciones y tormentas eléctricas, todas las clases se realizarán online durante esta jornada. Cuídate y evita desplazamientos innecesarios.",
} as const;

export const PERIODS = agendaRepository.getPeriods();
export const ACADEMIC_DATES = agendaRepository.getAcademicDates();
export const HOLIDAYS: readonly Holiday[] = agendaRepository.getHolidays();

const schedules = agendaRepository.getSchedules();

const holidaysByDate = new Map<string, Holiday>(HOLIDAYS.map((holiday) => [holiday.date, holiday]));

export const COURSES = schedules.map((schedule) => ({
  id: schedule.id,
  name: schedule.name,
}));

export function getHoliday(date: string): Holiday | undefined {
  return holidaysByDate.get(date);
}

export function getWeekActivities(weekStart: Date, periodId: string): Activity[] {
  return buildWeekActivities(schedules, HOLIDAYS, weekStart, periodId);
}

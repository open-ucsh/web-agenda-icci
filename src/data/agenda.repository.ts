import { academicDates, holidays, periods, schedules } from "@/data/agenda.generated";

export const agendaRepository = {
  getPeriods: () => periods,
  getSchedules: () => schedules,
  getAcademicDates: () => academicDates,
  getHolidays: () => holidays,
};

import { formatAcademicTime } from "@/lib/academic-time-axis";
export const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export const HOUR_HEIGHT = 72;

export const fullDateFormatter = new Intl.DateTimeFormat("es-CL", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatHour(hour: number): string {
  return formatAcademicTime(hour * 60);
}

export function dayColumnClass(index: number, selectedDay: number): string {
  return [
    "min-w-0 basis-0",
    index === selectedDay ? "block" : "hidden md:block",
    index >= 5 ? "grow md:grow-3" : "grow md:grow-5",
  ].join(" ");
}

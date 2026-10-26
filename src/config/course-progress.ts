import type { CourseDisplayStatus } from "@/types/curriculum-progress";

export const COURSE_PROGRESS_CONFIG = {
  available: {
    label: "Cumple requisitos",
    className: "border-blue-200 border-l-blue-500 bg-blue-50",
    textClassName: "text-blue-800",
    symbol: "○",
  },
  blocked: {
    label: "Bloqueado",
    className: "border-border border-l-slate-300 bg-background",
    textClassName: "text-muted",
    symbol: "—",
  },
  "in-progress": {
    label: "Cursando",
    className: "border-amber-200 border-l-amber-500 bg-amber-50",
    textClassName: "text-amber-800",
    symbol: "◷",
  },
  approved: {
    label: "Aprobado",
    className: "border-emerald-200 border-l-emerald-500 bg-emerald-50",
    textClassName: "text-emerald-800",
    symbol: "✓",
  },
  failed: {
    label: "Reprobado",
    className: "border-rose-200 border-l-rose-500 bg-rose-50",
    textClassName: "text-rose-800",
    symbol: "×",
  },
} satisfies Record<
  CourseDisplayStatus,
  {
    label: string;
    className: string;
    textClassName: string;
    symbol: string;
  }
>;

export function isCourseDisplayStatus(value: string): value is CourseDisplayStatus {
  return Object.hasOwn(COURSE_PROGRESS_CONFIG, value);
}

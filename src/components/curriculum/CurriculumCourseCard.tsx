import { COURSE_PROGRESS_CONFIG } from "@/config/course-progress";
import type { CurriculumCourse } from "@/types/curriculum";
import type { CourseDisplayStatus } from "@/types/curriculum-progress";

interface CurriculumCourseCardProps {
  course: CurriculumCourse;
  status: CourseDisplayStatus;
  onOpen: (course: CurriculumCourse, trigger: HTMLButtonElement) => void;
}

const KIND_LABELS = {
  required: "Obligatorio",
  elective: "Optativo",
  general: "Formación general",
} as const;

export function CurriculumCourseCard({ course, status, onOpen }: CurriculumCourseCardProps) {
  const appearance = COURSE_PROGRESS_CONFIG[status];

  return (
    <button
      aria-haspopup="dialog"
      aria-label={`${course.name}, ${course.code}, ${course.credits} SCT. ${appearance.label}. Ver detalles y cambiar estado.`}
      className={[
        "flex w-full flex-col gap-2 rounded-md border border-l-3 p-3 text-left transition-[filter] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none",
        appearance.className,
      ].join(" ")}
      onClick={(event) => onOpen(course, event.currentTarget)}
      type="button"
    >
      <span className="flex w-full items-center justify-between gap-3">
        <span className="font-mono text-xs text-muted">{course.code}</span>
        <span className="text-xs font-semibold tabular-nums text-brand">{course.credits} SCT</span>
      </span>

      <span className="text-sm font-semibold leading-5 text-text">{course.name}</span>

      <span className="flex w-full flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-muted">{KIND_LABELS[course.kind]}</span>

        <span className={`font-medium ${appearance.textClassName}`}>
          <span aria-hidden="true">{appearance.symbol} </span>
          {appearance.label}
        </span>
      </span>
    </button>
  );
}

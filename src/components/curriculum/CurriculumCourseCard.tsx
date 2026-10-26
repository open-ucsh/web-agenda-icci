import { Check, Circle, Clock3, LockKeyhole, X } from "lucide-react";

import { COURSE_PROGRESS_CONFIG } from "@/config/course-progress";
import type { CurriculumCourse } from "@/types/curriculum";
import type { CourseDisplayStatus } from "@/types/curriculum-progress";

interface CurriculumCourseCardProps {
  course: CurriculumCourse;
  status: CourseDisplayStatus;
  onOpen: (course: CurriculumCourse, trigger: HTMLButtonElement) => void;
}

const ICONS = {
  approved: Check,
  available: Circle,
  blocked: LockKeyhole,
  "in-progress": Clock3,
  failed: X,
};

export function CurriculumCourseCard({ course, status, onOpen }: CurriculumCourseCardProps) {
  const config = COURSE_PROGRESS_CONFIG[status];
  const Icon = ICONS[status];

  return (
    <button
      aria-haspopup="dialog"
      aria-label={`${course.name}, ${course.credits} SCT. ${config.label}. Cambiar estado.`}
      className={[
        "flex h-24 w-full flex-col justify-between rounded border border-l-2 p-2.5 text-left transition-[filter] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        config.className,
      ].join(" ")}
      onClick={(event) => onOpen(course, event.currentTarget)}
      title={`${course.name} · ${config.label}`}
      type="button"
    >
      <span className="flex w-full items-start gap-2">
        <span className="line-clamp-2 flex-1 text-xs font-semibold leading-4 text-text">
          {course.name}
        </span>
        <Icon aria-hidden="true" className={`mt-0.5 size-3.5 shrink-0 ${config.textClassName}`} />
      </span>

      <span className="flex w-full justify-between gap-2 text-xs text-muted">
        <span className="font-mono">{course.code}</span>
        <span className="tabular-nums">{course.credits} SCT</span>
      </span>
    </button>
  );
}

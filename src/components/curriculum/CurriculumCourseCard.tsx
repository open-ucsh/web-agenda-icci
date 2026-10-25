import type { CurriculumCourse } from "@/types/curriculum";

interface CurriculumCourseCardProps {
  course: CurriculumCourse;
  prerequisiteNames: readonly string[];
}

const COURSE_KIND_CONFIG = {
  required: {
    label: "Obligatorio",
    className: "border-l-brand",
  },
  elective: {
    label: "Optativo",
    className: "border-l-amber-500",
  },
  general: {
    label: "Formación general",
    className: "border-l-sky-400",
  },
} as const;

export function CurriculumCourseCard({ course, prerequisiteNames }: CurriculumCourseCardProps) {
  const kind = COURSE_KIND_CONFIG[course.kind];

  return (
    <article
      className={[
        "flex flex-col gap-2 rounded-md border border-border border-l-3 bg-background p-3",
        kind.className,
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs text-muted">{course.code}</span>
        <span className="shrink-0 text-xs font-semibold tabular-nums text-brand">
          {course.credits} SCT
        </span>
      </div>

      <h4 className="text-sm font-semibold leading-5 text-text">{course.name}</h4>

      <p className="text-xs text-muted">{kind.label}</p>

      {(prerequisiteNames.length > 0 || course.minimumCredits > 0) && (
        <div className="border-t border-border pt-2 text-xs leading-5 text-muted">
          {prerequisiteNames.length > 0 && (
            <p>
              <span className="font-medium text-text">Requiere: </span>
              {prerequisiteNames.join(", ")}
            </p>
          )}

          {course.minimumCredits > 0 && (
            <p>
              <span className="font-medium text-text">Requiere: </span>
              {course.minimumCredits} SCT aprobados
            </p>
          )}
        </div>
      )}
    </article>
  );
}

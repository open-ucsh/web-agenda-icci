import { CURRICULUM_COURSES } from "@/data/curriculum";
import { getCurriculumCredits } from "@/lib/curriculum";
import { getApprovedCredits, getCourseDisplayStatus } from "@/lib/curriculum-progress";
import type { CourseDisplayStatus, CurriculumProgress } from "@/types/curriculum-progress";

interface CurriculumProgressSummaryProps {
  progress: CurriculumProgress;
}

const TOTAL_CREDITS = getCurriculumCredits(CURRICULUM_COURSES);

export function CurriculumProgressSummary({ progress }: CurriculumProgressSummaryProps) {
  const approvedCredits = getApprovedCredits(CURRICULUM_COURSES, progress);

  function count(status: CourseDisplayStatus): number {
    return CURRICULUM_COURSES.filter(
      (course) => getCourseDisplayStatus(course, CURRICULUM_COURSES, progress) === status,
    ).length;
  }

  return (
    <div className="mb-4 flex shrink-0 flex-wrap items-center gap-x-6 gap-y-3 border-y border-border py-3">
      <div className="min-w-40 flex-1">
        <p className="text-sm">
          <span className="font-semibold text-brand">{approvedCredits}</span>
          <span className="text-muted"> / {TOTAL_CREDITS} SCT aprobados</span>
        </p>

        <progress
          aria-label="Créditos aprobados del plan"
          className="mt-1 h-2 w-full accent-emerald-600"
          max={TOTAL_CREDITS}
          value={approvedCredits}
        />
      </div>

      <p className="text-xs text-muted">
        <span className="font-semibold text-emerald-700">{count("approved")}</span>
        {" aprobados"}
      </p>

      <p className="text-xs text-muted">
        <span className="font-semibold text-amber-700">{count("in-progress")}</span>
        {" cursando"}
      </p>

      <p className="text-xs text-muted">
        <span className="font-semibold text-rose-700">{count("failed")}</span>
        {" por recuperar"}
      </p>

      <p className="text-xs text-muted">
        <span className="font-semibold text-blue-700">{count("available")}</span>
        {" disponibles por prerrequisitos"}
      </p>
    </div>
  );
}

import type { PersonalSchedule } from "@/lib/personal-agenda";
import { useRef, useState } from "react";

import { CurriculumCourseDialog } from "@/components/curriculum/CurriculumCourseDialog";
import { SemesterPlanner } from "@/components/curriculum/SemesterPlanner";
import { useCurriculumProgress } from "@/hooks/use-curriculum-progress";
import type { CurriculumCourse } from "@/types/curriculum";

interface SemesterPlannerPageProps {
  onUseSchedule: (schedule: PersonalSchedule) => void;
}

export function SemesterPlannerPage({ onUseSchedule }: SemesterPlannerPageProps) {
  const { progress, message, setCourseStatus } = useCurriculumProgress();
  const [course, setCourse] = useState<CurriculumCourse | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      {message && (
        <p className="shrink-0 pt-3 text-xs text-amber-800" role="status">
          {message}
        </p>
      )}

      <SemesterPlanner
        onUseSchedule={onUseSchedule}
        onBack={() => {
          window.location.hash = "#malla";
        }}
        onEditCourse={(selectedCourse, trigger) => {
          triggerRef.current = trigger;
          setCourse(selectedCourse);
        }}
        progress={progress}
      />

      <CurriculumCourseDialog
        course={course}
        onClose={() => setCourse(null)}
        onStatusChange={setCourseStatus}
        progress={progress}
        triggerRef={triggerRef}
      />
    </>
  );
}

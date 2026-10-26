import { Check, ChevronRight, Circle, Clock3, LockKeyhole, X } from "lucide-react";

import { COURSE_PROGRESS_CONFIG } from "@/config/course-progress";
import { CURRICULUM_COURSES } from "@/data/curriculum";
import { getCourseDisplayStatus, getCourseRequirements } from "@/lib/curriculum-progress";
import type { CurriculumCourse } from "@/types/curriculum";
import type { CurriculumProgress } from "@/types/curriculum-progress";

import styles from "./CurriculumSearchResults.module.css";

interface CurriculumSearchResultsProps {
  courses: readonly CurriculumCourse[];
  progress: CurriculumProgress;
  query: string;
  onClear: () => void;
  onOpen: (course: CurriculumCourse, trigger: HTMLButtonElement) => void;
}

const ICONS = {
  approved: Check,
  available: Circle,
  blocked: LockKeyhole,
  "in-progress": Clock3,
  failed: X,
};

const COURSE_NAMES = new Map(CURRICULUM_COURSES.map((course) => [course.code, course.name]));

export function CurriculumSearchResults({
  courses,
  progress,
  query,
  onClear,
  onOpen,
}: CurriculumSearchResultsProps) {
  if (courses.length === 0) {
    return (
      <div className={styles.empty}>
        <h3>No encontramos «{query.trim()}» en este plan.</h3>
        <p>Prueba con parte del nombre o con el código del ramo.</p>
        <button onClick={onClear} type="button">
          Volver a la malla
        </button>
      </div>
    );
  }

  return (
    <ul aria-label="Resultados de búsqueda" className={styles.list}>
      {courses.map((course) => {
        const status = getCourseDisplayStatus(course, CURRICULUM_COURSES, progress);
        const config = COURSE_PROGRESS_CONFIG[status];
        const Icon = ICONS[status];
        const requirements = getCourseRequirements(course, CURRICULUM_COURSES, progress);
        const missingNames = requirements.missingPrerequisites.map(
          (code) => COURSE_NAMES.get(code) ?? code,
        );

        return (
          <li key={course.code}>
            <button
              aria-haspopup="dialog"
              className={styles.result}
              onClick={(event) => onOpen(course, event.currentTarget)}
              type="button"
            >
              <Icon aria-hidden="true" className={`${styles.icon} ${config.textClassName}`} />

              <span className={styles.content}>
                <span className={styles.name}>{course.name}</span>
                <span className={styles.meta}>
                  {course.code} · {Math.ceil(course.semester / 2)}.º año · Semestre{" "}
                  {course.semester} · {course.credits} SCT
                </span>

                {status === "blocked" && missingNames.length > 0 && (
                  <span className={styles.requirement}>
                    Requiere aprobar: {missingNames.join(", ")}.
                  </span>
                )}
                {status === "blocked" && requirements.missingCredits > 0 && (
                  <span className={styles.requirement}>
                    Faltan {requirements.missingCredits} SCT aprobados para cumplir el mínimo.
                  </span>
                )}
              </span>

              <span className={`${styles.status} ${config.textClassName}`}>{config.label}</span>
              <ChevronRight aria-hidden="true" className={styles.chevron} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

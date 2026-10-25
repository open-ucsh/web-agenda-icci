import { X } from "lucide-react";
import { useEffect, useId, useRef, type RefObject } from "react";

import { Dialog } from "@/components/ui/Dialog";
import { COURSE_PROGRESS_CONFIG } from "@/config/course-progress";
import { CURRICULUM_COURSES } from "@/data/curriculum";
import {
  getCourseDisplayStatus,
  getCourseRequirements,
  getDependentCourses,
  isCourseProgressStatus,
} from "@/lib/curriculum-progress";
import type { CurriculumCourse } from "@/types/curriculum";
import type { CourseProgressStatus, CurriculumProgress } from "@/types/curriculum-progress";

interface CurriculumCourseDialogProps {
  course: CurriculumCourse | null;
  progress: CurriculumProgress;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onStatusChange: (code: string, status: CourseProgressStatus | null) => void;
}

const COURSE_NAMES = new Map(CURRICULUM_COURSES.map((course) => [course.code, course.name]));

export function CurriculumCourseDialog({
  course,
  progress,
  triggerRef,
  onClose,
  onStatusChange,
}: CurriculumCourseDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const statusId = useId();

  useEffect(() => {
    if (course && !dialogRef.current?.open) {
      dialogRef.current?.showModal();
    }
  }, [course]);

  const requirements = course ? getCourseRequirements(course, CURRICULUM_COURSES, progress) : null;

  const dependents = course ? getDependentCourses(CURRICULUM_COURSES, course.code) : [];

  const appearance = course
    ? COURSE_PROGRESS_CONFIG[getCourseDisplayStatus(course, CURRICULUM_COURSES, progress)]
    : null;

  return (
    <Dialog
      aria-labelledby={titleId}
      dialogRef={dialogRef}
      onClose={onClose}
      restoreFocusRef={triggerRef}
      size="medium"
    >
      <header className="flex items-start justify-between gap-4 border-b border-border p-5">
        <div>
          <h2 className="text-lg font-semibold text-brand" id={titleId}>
            {course?.name ?? "Detalle de asignatura"}
          </h2>

          {course && (
            <p className="mt-1 text-xs text-muted">
              {course.code} · {course.credits} SCT · Nivel {course.semester * 100}
            </p>
          )}
        </div>

        <button
          aria-label="Cerrar detalle de asignatura"
          className="grid size-9 shrink-0 place-items-center rounded-md text-muted hover:bg-surface focus-visible:outline-2 focus-visible:outline-brand"
          onClick={() => dialogRef.current?.close()}
          type="button"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </header>

      {course && requirements && appearance && (
        <div className="min-h-0 space-y-5 overflow-y-auto p-5">
          <div className="flex items-center justify-between gap-4">
            <label className="text-sm font-medium" htmlFor={statusId}>
              Mi estado
            </label>

            <select
              className="h-10 rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-brand"
              id={statusId}
              onChange={(event) => {
                const value = event.currentTarget.value;

                if (value === "pending") {
                  onStatusChange(course.code, null);
                } else if (isCourseProgressStatus(value)) {
                  onStatusChange(course.code, value);
                }
              }}
              value={progress[course.code] ?? "pending"}
            >
              <option value="pending">Sin cursar</option>
              <option disabled={!requirements.eligible} value="in-progress">
                Cursando
              </option>
              <option value="approved">Aprobado</option>
              <option value="failed">Reprobado</option>
            </select>
          </div>

          <p aria-live="polite" className={`text-sm font-medium ${appearance.textClassName}`}>
            {appearance.label}
          </p>

          <section>
            <h3 className="text-sm font-semibold text-text">Prerrequisitos</h3>

            {course.prerequisites.length === 0 && course.minimumCredits === 0 ? (
              <p className="mt-2 text-sm text-muted">Sin prerrequisitos indicados en este plan.</p>
            ) : (
              <ul className="mt-2 space-y-2 text-sm">
                {course.prerequisites.map((code) => {
                  const approved = progress[code] === "approved";

                  return (
                    <li className="flex justify-between gap-3" key={code}>
                      <span>{COURSE_NAMES.get(code) ?? code}</span>
                      <span className={approved ? "text-emerald-700" : "text-muted"}>
                        {approved ? "Aprobado" : "Pendiente"}
                      </span>
                    </li>
                  );
                })}

                {course.minimumCredits > 0 && (
                  <li className="text-muted">
                    {course.minimumCredits} SCT aprobados.
                    {requirements.missingCredits > 0 &&
                      ` Faltan ${requirements.missingCredits} SCT.`}
                  </li>
                )}
              </ul>
            )}
          </section>

          {dependents.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-text">Ramos que dependen de este</h3>

              <p className="mt-1 text-xs leading-5 text-muted">
                Dependencias directas e indirectas del plan.
              </p>

              <ul className="mt-2 space-y-2 text-sm text-muted">
                {dependents.map((dependent) => (
                  <li key={dependent.code}>
                    {dependent.name}
                    <span className="ml-2 font-mono text-xs">{dependent.code}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {progress[course.code] === "in-progress" && !requirements.eligible && (
            <p className="rounded-md bg-amber-50 p-3 text-xs leading-5 text-amber-900">
              Este ramo sigue registrado como cursando, pero cambiaron sus prerrequisitos. Revisa tu
              avance antes de planificar.
            </p>
          )}
        </div>
      )}

      <footer className="border-t border-border px-5 py-3 text-xs leading-5 text-muted">
        Disponible indica que cumples los prerrequisitos registrados. La oferta y la inscripción se
        confirman con la universidad.
      </footer>
    </Dialog>
  );
}

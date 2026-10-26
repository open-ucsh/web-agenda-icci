import { Check, CheckCircle2, Circle, Clock3, RotateCcw, X, XCircle } from "lucide-react";
import { useEffect, useId, useRef, useState, type RefObject } from "react";

import { Dialog } from "@/components/ui/Dialog";
import { getCourseAppearance } from "@/config/course-appearance";
import { CURRICULUM_COURSES } from "@/data/curriculum";
import { getCourseRequirements, getDependentCourses } from "@/lib/curriculum-progress";
import type { CurriculumCourse } from "@/types/curriculum";
import type { CourseProgressStatus, CurriculumProgress } from "@/types/curriculum-progress";

import styles from "./CurriculumCourseDialog.module.css";

interface CurriculumCourseDialogProps {
  course: CurriculumCourse | null;
  progress: CurriculumProgress;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onStatusChange: (code: string, status: CourseProgressStatus | null) => void;
}

interface LastChange {
  code: string;
  previous: CourseProgressStatus | null;
  next: CourseProgressStatus | null;
}

const STATUS_OPTIONS = [
  {
    value: "in-progress",
    label: "Cursando",
    Icon: Clock3,
    color: "#a67516",
    background: "#fcf5e7",
  },
  {
    value: "approved",
    label: "Aprobado",
    Icon: CheckCircle2,
    color: "#15803d",
    background: "#edf7ef",
  },
  { value: "failed", label: "Reprobado", Icon: XCircle, color: "#be3455", background: "#fff0f3" },
] as const;

function statusLabel(status: CourseProgressStatus | null): string {
  return STATUS_OPTIONS.find((option) => option.value === status)?.label ?? "Sin cursar";
}

export function CurriculumCourseDialog({
  course,
  progress,
  triggerRef,
  onClose,
  onStatusChange,
}: CurriculumCourseDialogProps) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [lastChange, setLastChange] = useState<LastChange | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (course && !dialog.open) dialog.showModal();
    if (!course && dialog.open) dialog.close();
  }, [course]);

  const currentStatus = course ? (progress[course.code] ?? null) : null;
  const requirements = course ? getCourseRequirements(course, CURRICULUM_COURSES, progress) : null;
  const dependents = course ? getDependentCourses(CURRICULUM_COURSES, course.code) : [];
  const appearance = getCourseAppearance(course?.code ?? "");

  const canUndo = Boolean(
    course &&
    lastChange?.code === course.code &&
    currentStatus === lastChange.next &&
    lastChange.previous !== lastChange.next,
  );

  function changeStatus(next: CourseProgressStatus | null): void {
    if (!course || next === currentStatus) return;

    setLastChange({ code: course.code, previous: currentStatus, next });
    onStatusChange(course.code, next);
  }

  function undo(): void {
    if (!course || !lastChange || !canUndo) return;
    onStatusChange(course.code, lastChange.previous);
    setLastChange(null);
  }

  return (
    <Dialog
      aria-labelledby={`${id}-title`}
      dialogRef={dialogRef}
      onClose={onClose}
      restoreFocusRef={triggerRef}
      size="medium"
    >
      <header className={styles.header}>
        <div className={styles.identity} style={{ borderLeftColor: appearance.accent }}>
          <h2 className={styles.title} id={`${id}-title`}>
            {course?.name ?? "Detalle del ramo"}
          </h2>
          {course && (
            <p className={styles.metadata}>
              {course.code} · {course.credits} SCT · Semestre {course.semester}
            </p>
          )}
        </div>
        <button
          aria-label="Cerrar detalle del ramo"
          className={styles.close}
          onClick={() => dialogRef.current?.close()}
          type="button"
        >
          <X aria-hidden="true" />
        </button>
      </header>

      {course && requirements && (
        <div className={styles.body}>
          <fieldset>
            <legend className={styles.sectionTitle}>¿Cómo vas en este ramo?</legend>
            <div className={styles.options}>
              {STATUS_OPTIONS.map(({ value, label, Icon, color, background }) => {
                const selected = currentStatus === value;
                const disabled = value !== "failed" && !requirements.eligible && !selected;

                return (
                  <button
                    aria-describedby={disabled ? `${id}-requirements-message` : undefined}
                    aria-pressed={selected}
                    className={styles.option}
                    disabled={disabled}
                    key={value}
                    onClick={() => changeStatus(value)}
                    style={{
                      borderColor: selected ? color : "#e2e8f0",
                      backgroundColor: selected ? background : "#ffffff",
                      color: selected ? color : "#142b4a",
                    }}
                    type="button"
                  >
                    <span aria-hidden="true" className={styles.selectionMark}>
                      {selected ? <Check /> : <Circle />}
                    </span>
                    <Icon aria-hidden="true" className={styles.statusIcon} style={{ color }} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className={styles.statusRow}>
            <p aria-live="polite" className={styles.currentStatus}>
              {canUndo ? "Estado actualizado" : `Estado actual: ${statusLabel(currentStatus)}`}
            </p>
            {currentStatus !== null && (
              <button
                className={styles.textButton}
                onClick={() => changeStatus(null)}
                type="button"
              >
                Volver a sin cursar
              </button>
            )}
          </div>

          {canUndo && (
            <button className={styles.undo} onClick={undo} type="button">
              <RotateCcw aria-hidden="true" />
              Deshacer último cambio
            </button>
          )}

          <section className={styles.requirements} aria-labelledby={`${id}-requirements-title`}>
            <h3 className={styles.sectionTitle} id={`${id}-requirements-title`}>
              Prerrequisitos
            </h3>

            {course.prerequisites.length > 0 ? (
              <ul className={styles.requirementList}>
                {course.prerequisites.map((code) => {
                  const prerequisite = CURRICULUM_COURSES.find((item) => item.code === code);
                  const approved = progress[code] === "approved";

                  return (
                    <li className={styles.requirement} key={code}>
                      {approved ? (
                        <CheckCircle2 aria-hidden="true" className={styles.approvedIcon} />
                      ) : (
                        <Circle aria-hidden="true" className={styles.pendingIcon} />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className={styles.requirementName}>{prerequisite?.name ?? code}</p>
                        <p className={styles.requirementCode}>{code}</p>
                      </div>
                      <span className={approved ? styles.approvedText : styles.pendingText}>
                        {approved ? "Aprobado" : "Pendiente"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className={styles.helper}>
                Este ramo no tiene prerrequisitos de asignaturas registrados.
              </p>
            )}

            {course.minimumCredits > 0 && (
              <p className={styles.helper}>
                Créditos exigidos: {course.minimumCredits} SCT.
                {requirements.missingCredits > 0
                  ? ` Faltan ${requirements.missingCredits} SCT aprobados.`
                  : " Requisito cumplido."}
              </p>
            )}

            <p
              className={requirements.eligible ? styles.helper : styles.blockedMessage}
              id={`${id}-requirements-message`}
            >
              {requirements.eligible
                ? "Cumples los requisitos registrados de este ramo."
                : "Para marcarlo como cursando o aprobado, primero debes cumplir sus requisitos."}
            </p>
          </section>

          {dependents.length > 0 && (
            <details className={styles.dependents}>
              <summary>Ramos que dependen de este ({dependents.length})</summary>
              <p className={styles.helper}>
                La habilitación también depende de los demás requisitos de cada ramo.
              </p>
              <ul className={styles.dependentList}>
                {dependents.map((item) => (
                  <li key={item.code}>
                    <span>{item.name}</span>
                    <span>{item.code}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      <footer className={styles.footer}>
        <p>Los cambios se guardan automáticamente en este navegador.</p>
        <button className={styles.done} onClick={() => dialogRef.current?.close()} type="button">
          Listo
        </button>
      </footer>
    </Dialog>
  );
}

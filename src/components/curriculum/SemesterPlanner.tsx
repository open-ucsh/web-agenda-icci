import { ClipboardList, X } from "lucide-react";
import { useId, useRef, useState } from "react";

import { CourseOfferingImport } from "@/components/curriculum/CourseOfferingImport";
import { Dialog } from "@/components/ui/Dialog";
import { PERIODS } from "@/data/activities";
import { CURRICULUM_COURSES } from "@/data/curriculum";
import { getCourseRequirements } from "@/lib/curriculum-progress";
import {
  evaluateSemesterPlan,
  type CourseOffering,
  type MinimumLoadException,
} from "@/lib/semester-plan";
import type { CurriculumProgress } from "@/types/curriculum-progress";

interface SemesterPlannerProps {
  progress: CurriculumProgress;
}

interface Draft {
  selectedCodes: string[];
  offerings: Partial<Record<string, CourseOffering>>;
  minimumException: MinimumLoadException;
}

function emptyDraft(): Draft {
  return { selectedCodes: [], offerings: {}, minimumException: "none" };
}

function isOffering(value: string): value is CourseOffering {
  return value === "unknown" || value === "offered" || value === "unavailable";
}

function isException(value: string): value is MinimumLoadException {
  return value === "none" || value === "last-semester" || value === "insufficient-offer";
}

export function SemesterPlanner({ progress }: SemesterPlannerProps) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [periodId, setPeriodId] = useState<string>(PERIODS[0]?.id ?? "");
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [query, setQuery] = useState("");

  const draft = drafts[periodId] ?? emptyDraft();

  function updateDraft(next: Draft): void {
    setDrafts((current) => ({ ...current, [periodId]: next }));
  }

  const evaluation = evaluateSemesterPlan({
    courses: CURRICULUM_COURSES,
    progress,
    ...draft,
  });

  const normalizedQuery = query.toLocaleLowerCase("es").trim();

  const candidates = CURRICULUM_COURSES.filter(
    (course) => progress[course.code] !== "approved" || draft.selectedCodes.includes(course.code),
  )
    .filter((course) =>
      `${course.name} ${course.code}`.toLocaleLowerCase("es").includes(normalizedQuery),
    )
    .toSorted(
      (first, second) =>
        Number(progress[second.code] === "failed") - Number(progress[first.code] === "failed") ||
        first.semester - second.semester ||
        first.code.localeCompare(second.code),
    );

  const controlClass =
    "h-10 rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-brand";

  return (
    <>
      <button
        aria-haspopup="dialog"
        className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-3 text-xs font-medium text-white hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        onClick={() => dialogRef.current?.showModal()}
        ref={triggerRef}
        type="button"
      >
        <ClipboardList aria-hidden="true" className="size-4" />
        Planificar semestre
      </button>

      <Dialog
        aria-labelledby={`${id}-title`}
        dialogRef={dialogRef}
        restoreFocusRef={triggerRef}
        size="large"
      >
        <header className="flex items-center justify-between gap-4 border-b border-border p-5">
          <div>
            <h2 className="text-lg font-semibold text-brand" id={`${id}-title`}>
              Planificar semestre
            </h2>
            <p className="mt-1 text-xs text-muted">Borrador orientativo · Artículos 12 y 13</p>
          </div>

          <button
            aria-label="Cerrar planificación"
            className="grid size-9 place-items-center rounded-md hover:bg-surface focus-visible:outline-2 focus-visible:outline-brand"
            onClick={() => dialogRef.current?.close()}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </header>

        <div className="min-h-0 space-y-5 overflow-y-auto p-5">
          <CourseOfferingImport selectedCodes={draft.selectedCodes} />
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted" htmlFor={`${id}-period`}>
                Período del borrador
              </label>
              <select
                className={controlClass}
                id={`${id}-period`}
                onChange={(event) => setPeriodId(event.currentTarget.value)}
                value={periodId}
              >
                {PERIODS.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>

            <p aria-live="polite" className="text-sm font-semibold text-brand">
              {evaluation.credits} SCT seleccionados
              <span className="block text-xs font-normal text-muted">
                {evaluation.maximumCredits === null
                  ? "Máximo por confirmar con la carrera"
                  : "Máximo aplicable: 36 SCT"}
              </span>
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted" htmlFor={`${id}-exception`}>
              Excepción confirmada al mínimo de 12 SCT
            </label>
            <select
              className={`${controlClass} w-full`}
              id={`${id}-exception`}
              onChange={(event) => {
                const value = event.currentTarget.value;
                if (isException(value)) {
                  updateDraft({ ...draft, minimumException: value });
                }
              }}
              value={draft.minimumException}
            >
              <option value="none">Sin excepción confirmada</option>
              <option value="last-semester">Último semestre del plan confirmado</option>
              <option value="insufficient-offer">Falta de oferta según mi avance confirmada</option>
            </select>
          </div>

          <div>
            <label className="sr-only" htmlFor={`${id}-search`}>
              Buscar ramo para planificar
            </label>
            <input
              className={`${controlClass} w-full`}
              id={`${id}-search`}
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder="Buscar ramo o código"
              type="search"
              value={query}
            />
          </div>

          <p className="text-xs leading-5 text-muted">
            Los reprobados aparecen primero, ordenados por nivel. Indica la oferta solo si la
            confirmaste; cumplir prerrequisitos no confirma cupos ni habilitación de inscripción.
          </p>

          <ul className="divide-y divide-border">
            {candidates.map((course) => {
              const selected = draft.selectedCodes.includes(course.code);
              const eligible = getCourseRequirements(course, CURRICULUM_COURSES, progress).eligible;
              const offering = draft.offerings[course.code] ?? "unknown";
              const approved = progress[course.code] === "approved";

              return (
                <li className="space-y-2 py-3" key={course.code}>
                  <label className="flex items-start gap-3">
                    <input
                      checked={selected}
                      className="mt-1 size-4 accent-brand"
                      disabled={!selected && (!eligible || approved || offering === "unavailable")}
                      onChange={(event) => {
                        const selectedCodes = event.currentTarget.checked
                          ? [...draft.selectedCodes, course.code]
                          : draft.selectedCodes.filter((code) => code !== course.code);
                        updateDraft({ ...draft, selectedCodes });
                      }}
                      type="checkbox"
                    />

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{course.name}</span>
                      <span className="text-xs text-muted">
                        {course.code} · {course.credits} SCT · Nivel {course.semester * 100}
                        {progress[course.code] === "failed" && " · Reprobado"}
                        {!eligible && " · Requisitos pendientes"}
                        {approved && " · Ya aprobado"}
                      </span>
                    </span>
                  </label>

                  <div className="flex items-center justify-between gap-3 pl-7">
                    <label className="text-xs text-muted" htmlFor={`${id}-${course.code}`}>
                      Oferta del período
                    </label>
                    <select
                      className="h-8 rounded border border-border bg-background px-2 text-xs focus-visible:outline-2 focus-visible:outline-brand"
                      id={`${id}-${course.code}`}
                      onChange={(event) => {
                        const value = event.currentTarget.value;
                        if (isOffering(value)) {
                          updateDraft({
                            ...draft,
                            offerings: { ...draft.offerings, [course.code]: value },
                          });
                        }
                      }}
                      value={offering}
                    >
                      <option value="unknown">Por confirmar</option>
                      <option value="offered">Ofertado confirmado</option>
                      <option value="unavailable">No ofertado confirmado</option>
                    </select>
                  </div>
                </li>
              );
            })}
          </ul>

          {candidates.length === 0 && (
            <p className="text-sm text-muted">No hay ramos con esa búsqueda.</p>
          )}

          <section aria-labelledby={`${id}-review`} className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold" id={`${id}-review`}>
              Revisión del borrador
            </h3>

            <ul className="mt-2 space-y-2 text-xs leading-5" aria-live="polite">
              {evaluation.errors.map((error) => (
                <li className="text-rose-800" key={error}>
                  {error}
                </li>
              ))}
              {evaluation.notices.map((notice) => (
                <li className="text-amber-900" key={notice}>
                  {notice}
                </li>
              ))}
              {evaluation.errors.length === 0 && (
                <li className="text-emerald-800">
                  Sin incumplimientos detectados en las comprobaciones implementadas. Esto no
                  autoriza la inscripción.
                </li>
              )}
            </ul>
          </section>
        </div>

        <footer className="border-t border-border px-5 py-3 text-xs leading-5 text-muted">
          El borrador permanece mientras esta vista esté abierta. No modifica tu avance ni inscribe
          ramos en la universidad.
        </footer>
      </Dialog>
    </>
  );
}

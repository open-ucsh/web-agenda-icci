import { CheckCircle2, ChevronLeft, ChevronRight, FileSpreadsheet, X } from "lucide-react";
import { useId, useRef } from "react";

import { OfferingImportGuide } from "@/components/curriculum/OfferingImportGuide";
import { ScheduleApply } from "@/components/curriculum/ScheduleApply";
import { SchedulePreview } from "@/components/curriculum/SchedulePreview";
import { ScheduleSections } from "@/components/curriculum/ScheduleSections";
import { Dialog } from "@/components/ui/Dialog";
import { getCourseAppearance } from "@/config/course-appearance";
import { useSemesterPlanner } from "@/hooks/use-semester-planner";
import type { PersonalSchedule } from "@/lib/personal-agenda";
import type { CurriculumCourse } from "@/types/curriculum";
import type { CurriculumProgress } from "@/types/curriculum-progress";

import layout from "./SemesterPlannerLayout.module.css";
import styles from "./SemesterPlanner.module.css";

interface SemesterPlannerProps {
  progress: CurriculumProgress;
  onBack: () => void;
  onEditCourse: (course: CurriculumCourse, trigger: HTMLButtonElement) => void;
  onUseSchedule: (schedule: PersonalSchedule) => void;
}

export function SemesterPlanner({ progress, onUseSchedule }: SemesterPlannerProps) {
  const id = useId();
  const planner = useSemesterPlanner(progress);
  const inputRef = useRef<HTMLInputElement>(null);
  const sectionsRef = useRef<HTMLDialogElement>(null);
  const sectionsTriggerRef = useRef<HTMLButtonElement>(null);

  function renderCourse(course: CurriculumCourse) {
    const appearance = getCourseAppearance(course.code);
    const checked = planner.selectedCodes.includes(course.code);

    return (
      <li key={course.code}>
        <label
          className={styles.course}
          style={{
            backgroundColor: checked ? appearance.background : "#ffffff",
            borderLeftColor: appearance.accent,
          }}
        >
          <input
            checked={checked}
            onChange={(event) => planner.toggleCourse(course.code, event.currentTarget.checked)}
            style={{ accentColor: appearance.accent }}
            type="checkbox"
          />
          <span className="min-w-0 flex-1">
            <span className={styles.courseName}>{course.name}</span>
            <span className={styles.courseMeta}>
              {course.code} · {course.credits} SCT
              {progress[course.code] === "failed" && " · Reprobado"}
            </span>
          </span>
        </label>
      </li>
    );
  }

  return (
    <section aria-labelledby={`${id}-title`} className={styles.page}>
      <h2 className="sr-only" id={`${id}-title`}>
        Planificar semestre
      </h2>

      <input
        accept=".xls,.html,.htm"
        aria-label="Subir reporte de oferta académica"
        className="hidden"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          if (file) void planner.importFile(file);
        }}
        ref={inputRef}
        type="file"
      />

      {planner.loading && (
        <p className="py-3 text-xs text-muted" role="status">
          Leyendo oferta académica…
        </p>
      )}
      {planner.error && (
        <p className="py-3 text-xs text-rose-800" role="alert">
          {planner.error}
        </p>
      )}

      {!planner.report ? (
        <OfferingImportGuide
          loading={planner.loading}
          onSelectFile={() => inputRef.current?.click()}
        />
      ) : (
        <div className={layout.workspace}>
          <aside aria-labelledby={`${id}-courses`} className={layout.sidebar}>
            <h3 className={layout.title} id={`${id}-courses`}>
              Ramos
            </h3>

            <div className={layout.file}>
              <FileSpreadsheet aria-hidden="true" className="size-4 shrink-0" />
              <span className="sr-only">Oferta académica cargada:</span>
              <span className={layout.fileName} title={planner.imported?.fileName}>
                {planner.imported?.fileName ?? "Oferta académica"}
              </span>
              <button
                className={layout.fileButton}
                disabled={planner.loading}
                onClick={() => inputRef.current?.click()}
                type="button"
              >
                Cambiar oferta
              </button>
            </div>

            <label className="sr-only" htmlFor={`${id}-search`}>
              Buscar ramo o código
            </label>
            <input
              className={styles.search}
              id={`${id}-search`}
              onChange={(event) => planner.setQuery(event.currentTarget.value)}
              placeholder="Buscar ramo o código"
              type="search"
              value={planner.query}
            />

            <div aria-live="polite" className={styles.summary}>
              <span>{planner.selectedCodes.length} seleccionados</span>
              <span>{planner.evaluation.credits} SCT</span>
            </div>

            <div className={styles.courseList}>
              <ul>{planner.available.map(renderCourse)}</ul>

              {planner.available.length === 0 && (
                <p className="py-4 text-xs leading-5 text-muted">
                  No hay ramos disponibles con esa búsqueda y tu avance actual.
                </p>
              )}
            </div>

            <button
              className={`${styles.secondary} mt-3 shrink-0`}
              disabled={planner.selectedCodes.length === 0 || planner.loading}
              onClick={planner.generate}
              type="button"
            >
              {planner.result ? "Actualizar opciones" : "Buscar horarios"}
            </button>
          </aside>

          <div className={layout.calendar}>
            <div className={layout.calendarHeader}>
              <div className={layout.calendarIdentity}>
                <h3 className={layout.title}>Horario</h3>
                {planner.combination.length > 0 && (
                  <span className={styles.status}>
                    <CheckCircle2 aria-hidden="true" className="size-4" />
                    Sin topes
                  </span>
                )}
              </div>

              <div className={layout.navigation}>
                <div aria-label="Opciones de horario" className={layout.options} role="group">
                  <button
                    aria-label="Horario anterior"
                    className={styles.iconButton}
                    disabled={!planner.result || planner.option === 0}
                    onClick={planner.previous}
                    type="button"
                  >
                    <ChevronLeft aria-hidden="true" className="size-4" />
                  </button>
                  <span aria-live="polite" className={layout.optionLabel}>
                    {planner.result && planner.result.combinations.length > 0
                      ? `${planner.option + 1} de ${planner.result.combinations.length}`
                      : "Sin opciones"}
                  </span>
                  <button
                    aria-label="Horario siguiente"
                    className={styles.iconButton}
                    disabled={
                      !planner.result || planner.option >= planner.result.combinations.length - 1
                    }
                    onClick={planner.next}
                    type="button"
                  >
                    <ChevronRight aria-hidden="true" className="size-4" />
                  </button>
                </div>

                <button
                  aria-haspopup="dialog"
                  className={layout.sectionsButton}
                  disabled={planner.combination.length === 0}
                  onClick={() => sectionsRef.current?.showModal()}
                  ref={sectionsTriggerRef}
                  type="button"
                >
                  Ver secciones
                </button>
              </div>
            </div>

            <SchedulePreview sections={planner.combination} />

            <div aria-live="polite" className={styles.notes}>
              {!planner.result && <p>Selecciona tus ramos y pulsa Buscar horarios.</p>}

              {planner.result && planner.result.unresolvedCodes.length > 0 && (
                <p>Faltan horarios completos para {planner.result.unresolvedCodes.join(", ")}.</p>
              )}

              {planner.result &&
                planner.result.unresolvedCodes.length === 0 &&
                planner.result.combinations.length === 0 && (
                  <p>
                    {planner.result.limited
                      ? "No se encontró un horario dentro del límite de búsqueda."
                      : "No hay combinaciones sin topes para estos ramos."}
                  </p>
                )}

              {planner.result?.limited && (
                <p>La búsqueda alcanzó su límite; las opciones son parciales.</p>
              )}

              {planner.result && planner.result.excludedSections.length > 0 && (
                <p>
                  {planner.result.excludedSections.length} secciones omitidas por información
                  pendiente o cruces internos.
                </p>
              )}

              {planner.selectedCodes.length > 0 &&
                planner.evaluation.errors.map((message) => <p key={message}>{message}</p>)}
            </div>

            <footer className={layout.calendarFooter}>
              <p>Puedes comparar opciones antes de confirmar.</p>
              <ScheduleApply
                key={planner.imported?.revision}
                onUse={onUseSchedule}
                reportPeriod={planner.report.period}
                sections={planner.combination}
              />
            </footer>
          </div>
        </div>
      )}

      <Dialog
        aria-labelledby={`${id}-sections-title`}
        dialogRef={sectionsRef}
        restoreFocusRef={sectionsTriggerRef}
        size="medium"
      >
        <header className="flex items-center justify-between gap-3 border-b border-border p-5">
          <h2 className="font-semibold text-brand" id={`${id}-sections-title`}>
            Secciones de este horario
          </h2>
          <button
            aria-label="Cerrar secciones"
            className={styles.iconButton}
            onClick={() => sectionsRef.current?.close()}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </header>
        <ScheduleSections sections={planner.combination} />
      </Dialog>
    </section>
  );
}

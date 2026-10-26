import { ScheduleSections } from "@/components/curriculum/ScheduleSections";
import { getCourseAppearance } from "@/config/course-appearance";
import { CheckCircle2, ChevronLeft, ChevronRight, FileSpreadsheet, X } from "lucide-react";
import { useId, useRef } from "react";

import { OfferingImportGuide } from "@/components/curriculum/OfferingImportGuide";
import { ScheduleApply } from "@/components/curriculum/ScheduleApply";
import { SchedulePreview } from "@/components/curriculum/SchedulePreview";
import { Dialog } from "@/components/ui/Dialog";
import { useSemesterPlanner } from "@/hooks/use-semester-planner";
import type { PersonalSchedule } from "@/lib/personal-agenda";
import type { MinimumLoadException } from "@/lib/semester-plan";
import type { CurriculumCourse } from "@/types/curriculum";
import type { CurriculumProgress } from "@/types/curriculum-progress";

import styles from "./SemesterPlanner.module.css";

interface SemesterPlannerProps {
  progress: CurriculumProgress;
  onBack: () => void;
  onEditCourse: (course: CurriculumCourse, trigger: HTMLButtonElement) => void;
  onUseSchedule: (schedule: PersonalSchedule) => void;
}

function isException(value: string): value is MinimumLoadException {
  return value === "none" || value === "last-semester" || value === "insufficient-offer";
}

export function SemesterPlanner({ progress, onEditCourse, onUseSchedule }: SemesterPlannerProps) {
  const id = useId();
  const planner = useSemesterPlanner(progress);
  const inputRef = useRef<HTMLInputElement>(null);
  const advanceRef = useRef<HTMLDialogElement>(null);
  const advanceTriggerRef = useRef<HTMLButtonElement>(null);
  const sectionsRef = useRef<HTMLDialogElement>(null);
  const sectionsTriggerRef = useRef<HTMLButtonElement>(null);

  function renderCourse(course: CurriculumCourse, blocked: boolean) {
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
            disabled={blocked}
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

      <header className={planner.report ? styles.heading : "hidden"}>
        <div>
          <h2 className={styles.title} id={`${id}-title`}>
            Arma tu semestre
          </h2>
          <p className={styles.subtitle}>Elige tus ramos y encuentra un horario sin topes.</p>
        </div>

        {planner.imported && (
          <div className={styles.file}>
            <FileSpreadsheet aria-hidden="true" className="size-6 text-brand" />
            <div>
              <p className="font-medium text-brand">Oferta cargada</p>
              <span className={styles.fileName} title={planner.report?.period}>
                {planner.imported.fileName}
              </span>
            </div>
            <button
              className={styles.textButton}
              disabled={planner.loading}
              onClick={() => inputRef.current?.click()}
              type="button"
            >
              Cambiar
            </button>
          </div>
        )}
      </header>

      {planner.loading && (
        <p className="mb-3 text-xs text-muted" role="status">
          Leyendo oferta académica…
        </p>
      )}
      {planner.error && (
        <p className="mb-3 text-xs text-rose-800" role="alert">
          {planner.error}
        </p>
      )}

      {!planner.report ? (
        <OfferingImportGuide
          loading={planner.loading}
          onSelectFile={() => inputRef.current?.click()}
        />
      ) : (
        <>
          <div className={styles.workspace}>
            <aside aria-labelledby={`${id}-courses`} className={styles.sidebar}>
              <div className={styles.sidebarHeader}>
                <h3 className={styles.sectionTitle} id={`${id}-courses`}>
                  Ramos del período
                </h3>
                <button
                  aria-haspopup="dialog"
                  className={styles.textButton}
                  onClick={() => advanceRef.current?.showModal()}
                  ref={advanceTriggerRef}
                  type="button"
                >
                  Editar avance
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
                <ul>{planner.available.map((course) => renderCourse(course, false))}</ul>

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

              <details className={styles.disclosure}>
                <summary>Revisar carga académica</summary>
                <div className="mt-3 space-y-3">
                  <p>
                    {planner.evaluation.maximumCredits === null
                      ? "Máximo de SCT por confirmar con la carrera."
                      : "Máximo aplicable: 36 SCT."}
                  </p>
                  <label className="block">
                    Excepción confirmada al mínimo de 12 SCT
                    <select
                      className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-xs"
                      onChange={(event) => {
                        const value = event.currentTarget.value;
                        if (isException(value)) planner.setException(value);
                      }}
                      value={planner.exception}
                    >
                      <option value="none">Sin excepción</option>
                      <option value="last-semester">Último semestre confirmado</option>
                      <option value="insufficient-offer">Falta de oferta confirmada</option>
                    </select>
                  </label>
                  {planner.evaluation.errors.map((item) => (
                    <p className="text-rose-800" key={item}>
                      {item}
                    </p>
                  ))}
                  {planner.evaluation.notices.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                  {planner.unknownCodes.length > 0 && (
                    <p>
                      Códigos sin correspondencia en esta malla: {planner.unknownCodes.join(", ")}.
                    </p>
                  )}
                  {planner.report.issues.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                  <p>La universidad confirma los cupos y la inscripción.</p>
                </div>
              </details>
            </aside>

            <div className={styles.calendar}>
              <div className={styles.calendarHeader}>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className={styles.sectionTitle}>Horario propuesto</h3>
                  {planner.combination.length > 0 && (
                    <span className={styles.status}>
                      <CheckCircle2 aria-hidden="true" className="size-4" /> Sin topes
                    </span>
                  )}
                </div>
                <div className={styles.navigation}>
                  <button
                    aria-label="Horario anterior"
                    className={styles.iconButton}
                    disabled={!planner.result || planner.option === 0}
                    onClick={planner.previous}
                    type="button"
                  >
                    <ChevronLeft aria-hidden="true" className="size-4" />
                  </button>
                  <span aria-live="polite" className="min-w-16 text-center">
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
                  <button
                    aria-haspopup="dialog"
                    className={styles.textButton}
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
                {planner.selectedCodes.length > 0 && planner.evaluation.errors.length > 0 && (
                  <p>Revisa la carga académica antes de confirmar tu inscripción.</p>
                )}
              </div>
            </div>
          </div>

          <footer className={styles.footer}>
            <div>
              <p className={styles.footerTitle}>
                {planner.selectedCodes.length} ramos · {planner.evaluation.credits} SCT
              </p>
              <p className="mt-1 text-xs text-muted">El avance se guarda por separado</p>
            </div>
            <div className={styles.actions}>
              <ScheduleApply
                key={planner.imported?.revision}
                onUse={onUseSchedule}
                reportPeriod={planner.report.period}
                sections={planner.combination}
              />
            </div>
          </footer>
        </>
      )}

      <Dialog
        aria-labelledby={`${id}-advance-title`}
        dialogRef={advanceRef}
        restoreFocusRef={advanceTriggerRef}
        size="medium"
      >
        <header className="flex items-center justify-between gap-3 border-b border-border p-5">
          <h2 className="font-semibold text-brand" id={`${id}-advance-title`}>
            Editar avance
          </h2>
          <button
            aria-label="Cerrar avance"
            className={styles.iconButton}
            onClick={() => advanceRef.current?.close()}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </header>
        <div className="min-h-0 overflow-y-auto p-5">
          <p className="mb-3 text-xs leading-5 text-muted">
            Los cambios también se reflejan en Mi malla.
          </p>
          <ul className="divide-y divide-border">
            {planner.offeredCourses.map((course) => (
              <li className="flex items-center justify-between gap-3 py-3" key={course.code}>
                <div>
                  <p className="text-sm font-medium">{course.name}</p>
                  <p className="mt-1 text-xs text-muted">
                    {course.code} ·{" "}
                    {progress[course.code] === "approved"
                      ? "Aprobado"
                      : progress[course.code] === "failed"
                        ? "Reprobado"
                        : progress[course.code] === "in-progress"
                          ? "En curso"
                          : "Pendiente"}
                  </p>
                </div>
                <button
                  className={styles.textButton}
                  onClick={(event) => {
                    const trigger = advanceTriggerRef.current ?? event.currentTarget;
                    advanceRef.current?.close();
                    onEditCourse(course, trigger);
                  }}
                  type="button"
                >
                  Cambiar
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Dialog>

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

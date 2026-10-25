import { ScheduleApply } from "@/components/curriculum/ScheduleApply";
import type { PersonalSchedule } from "@/lib/personal-agenda";
import type { CurriculumCourse } from "@/types/curriculum";
import { ArrowLeft, ChevronLeft, ChevronRight, FileUp, Search } from "lucide-react";
import { useId, useRef, useState } from "react";

import { SchedulePreview } from "@/components/curriculum/SchedulePreview";
import { CURRICULUM_COURSES, CURRICULUM_PLAN } from "@/data/curriculum";
import { decodeOfferingFile, parseCourseOfferingReport } from "@/lib/course-offering-import";
import { groupCourseSections } from "@/lib/course-sections";
import { getCourseRequirements } from "@/lib/curriculum-progress";
import { generateScheduleCombinations } from "@/lib/schedule-combinations";
import {
  evaluateSemesterPlan,
  type CourseOffering,
  type MinimumLoadException,
} from "@/lib/semester-plan";
import type { CourseOfferingReport } from "@/types/course-offering";
import type { CurriculumProgress } from "@/types/curriculum-progress";

interface SemesterPlannerProps {
  progress: CurriculumProgress;
  onBack: () => void;
  onUseSchedule: (schedule: PersonalSchedule) => void;
  onEditCourse: (course: CurriculumCourse, trigger: HTMLButtonElement) => void;
}

interface ImportedOffering {
  report: CourseOfferingReport;
  fileName: string;
  revision: number;
}

interface SearchSnapshot {
  signature: string;
  result: ReturnType<typeof generateScheduleCombinations>;
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function isException(value: string): value is MinimumLoadException {
  return value === "none" || value === "last-semester" || value === "insufficient-offer";
}

export function SemesterPlanner({
  progress,
  onBack,
  onEditCourse,
  onUseSchedule,
}: SemesterPlannerProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef(0);
  const [imported, setImported] = useState<ImportedOffering | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [exception, setException] = useState<MinimumLoadException>("none");
  const [search, setSearch] = useState<SearchSnapshot | null>(null);
  const [option, setOption] = useState(0);

  const report = imported?.report;
  const sections = groupCourseSections(report?.rows ?? []);
  const offeredCodes = new Set(report?.rows.map((row) => row.code));
  const selectedCodes = selected.filter((code) => {
    const course = CURRICULUM_COURSES.find((item) => item.code === code);
    return (
      course !== undefined &&
      offeredCodes.has(code) &&
      progress[code] !== "approved" &&
      getCourseRequirements(course, CURRICULUM_COURSES, progress).eligible
    );
  });

  const offerings: Partial<Record<string, CourseOffering>> = {};
  for (const code of offeredCodes) offerings[code] = "offered";

  const evaluation = evaluateSemesterPlan({
    courses: CURRICULUM_COURSES,
    progress,
    selectedCodes,
    offerings,
    minimumException: exception,
  });

  const signature = JSON.stringify([imported?.revision, [...selectedCodes].sort()]);
  const result = search?.signature === signature ? search.result : null;
  const combination = result?.combinations[option] ?? [];
  const unknownCodes = [...offeredCodes].filter(
    (code) => !CURRICULUM_COURSES.some((course) => course.code === code),
  );

  const candidates = CURRICULUM_COURSES.filter(
    (course) => offeredCodes.has(course.code) && progress[course.code] !== "approved",
  )
    .filter((course) => normalize(`${course.name} ${course.code}`).includes(normalize(query)))
    .toSorted(
      (first, second) =>
        Number(progress[second.code] === "failed") - Number(progress[first.code] === "failed") ||
        first.semester - second.semester ||
        first.code.localeCompare(second.code),
    );

  async function importFile(file: File): Promise<void> {
    const request = ++requestRef.current;
    setLoading(true);
    setError("");

    try {
      if (file.size > 5 * 1024 * 1024) throw new Error("El archivo supera el máximo de 5 MB.");
      const buffer = await file.arrayBuffer();
      const nextReport = parseCourseOfferingReport(decodeOfferingFile(buffer));
      if (request !== requestRef.current) return;

      setImported({
        report: nextReport,
        fileName: file.name,
        revision: request,
      });
      setSelected([]);
      setSearch(null);
      setOption(0);
      setException("none");
      setQuery("");
    } catch (cause) {
      if (request !== requestRef.current) return;
      setError(cause instanceof Error ? cause.message : "No se pudo importar el reporte.");
    } finally {
      if (request === requestRef.current) setLoading(false);
    }
  }

  function downloadSchedule(): void {
    if (!report || combination.length === 0) return;

    const content = {
      version: 1,
      program: report.program,
      period: report.period,
      credits: evaluation.credits,
      sections: combination,
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(content, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "horario-icci.json";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const outlineButton =
    "inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border px-3 text-xs font-medium text-brand hover:bg-surface disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-brand";

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="flex min-h-0 flex-1 flex-col overflow-y-auto"
    >
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 py-5">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-brand" id={`${id}-title`}>
            Arma tu semestre
          </h2>
          <p className="mt-1 text-xs text-muted">ICCI · Plan {CURRICULUM_PLAN.year}</p>
        </div>
        <button className={outlineButton} onClick={onBack} type="button">
          <ArrowLeft aria-hidden="true" className="size-4" />
          Volver a mi malla
        </button>
      </header>

      <div className="mb-5 flex shrink-0 flex-wrap items-center gap-3 rounded-md border border-border px-4 py-3">
        <FileUp aria-hidden="true" className="size-5 shrink-0 text-brand" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-brand">
            {loading
              ? "Leyendo reporte…"
              : imported
                ? imported.fileName
                : "Importa tu oferta académica"}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            {report
              ? report.period || "Período no identificado en el reporte"
              : "Reporte .xls descargado desde la universidad"}
          </p>
        </div>
        <input
          accept=".xls,.html,.htm"
          aria-label="Importar reporte de oferta académica"
          className="hidden"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = "";
            if (file) void importFile(file);
          }}
          ref={inputRef}
          type="file"
        />
        <button
          className={outlineButton}
          disabled={loading}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          {report ? "Cambiar archivo" : "Importar oferta"}
        </button>
      </div>

      {error && (
        <p className="mb-3 text-xs text-rose-800" role="alert">
          {error}
        </p>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-[19rem_minmax(0,1fr)]">
        <aside
          aria-labelledby={`${id}-courses`}
          className="flex min-h-0 flex-col lg:border-r lg:border-border lg:pr-5"
        >
          <h3 className="text-lg font-semibold text-brand" id={`${id}-courses`}>
            Tus ramos
          </h3>
          <p aria-live="polite" className="mt-1 text-xs text-muted">
            {selectedCodes.length} seleccionados · {evaluation.credits} SCT
          </p>

          <div className="relative my-4">
            <label className="sr-only" htmlFor={`${id}-query`}>
              Buscar ramo
            </label>
            <Search aria-hidden="true" className="absolute left-3 top-3 size-4 text-muted" />
            <input
              className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm focus-visible:outline-2 focus-visible:outline-brand"
              id={`${id}-query`}
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder="Buscar ramo"
              type="search"
              value={query}
            />
          </div>

          <ul className="max-h-72 min-h-0 divide-y divide-border overflow-y-auto lg:max-h-none lg:flex-1">
            {candidates.map((course) => {
              const requirements = getCourseRequirements(course, CURRICULUM_COURSES, progress);
              const missingNames = requirements.missingPrerequisites.map(
                (code) => CURRICULUM_COURSES.find((item) => item.code === code)?.name ?? code,
              );

              return (
                <li key={course.code}>
                  <label className="flex items-start gap-3 py-3">
                    <input
                      checked={selectedCodes.includes(course.code)}
                      className="mt-1 size-4 shrink-0 accent-brand"
                      disabled={!requirements.eligible}
                      onChange={(event) => {
                        const checked = event.currentTarget.checked;
                        setSelected((current) =>
                          checked
                            ? [...new Set([...current, course.code])]
                            : current.filter((code) => code !== course.code),
                        );
                        setSearch(null);
                        setOption(0);
                      }}
                      type="checkbox"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{course.name}</span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {course.code} · {course.credits} SCT
                        {progress[course.code] === "failed" && " · Reprobado"}
                      </span>
                      {missingNames.length > 0 && (
                        <span className="mt-1 block text-xs text-muted">
                          Requiere {missingNames.join(", ")}
                        </span>
                      )}
                      {requirements.missingCredits > 0 && (
                        <span className="mt-1 block text-xs text-muted">
                          Faltan {requirements.missingCredits} SCT aprobados
                        </span>
                      )}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>

          {candidates.length === 0 && (
            <p className="py-5 text-xs leading-5 text-muted">
              {report
                ? "No hay ramos pendientes que coincidan con la búsqueda."
                : "Importa la oferta para ver los ramos del período."}
            </p>
          )}

          <button
            className="my-4 h-10 shrink-0 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            disabled={selectedCodes.length === 0 || loading}
            onClick={() => {
              setOption(0);
              setSearch({
                signature,
                result: generateScheduleCombinations(sections, selectedCodes),
              });
            }}
            type="button"
          >
            Buscar horarios
          </button>

          {report && (
            <details className="shrink-0 border-t border-border py-3 text-xs">
              <summary className="cursor-pointer font-medium text-brand">
                Actualizar mi avance
              </summary>
              <p className="mt-2 leading-5 text-muted">
                Los cambios se comparten con Mi malla. Aprobar un ramo actualiza los requisitos de
                los demás.
              </p>
              <ul className="mt-2 max-h-56 divide-y divide-border overflow-y-auto">
                {CURRICULUM_COURSES.filter((course) => offeredCodes.has(course.code)).map(
                  (course) => (
                    <li className="flex items-center justify-between gap-3 py-2" key={course.code}>
                      <div className="min-w-0">
                        <p className="font-medium">{course.name}</p>
                        <p className="mt-0.5 text-muted">
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
                        className="shrink-0 rounded-md border border-border px-2 py-1.5 text-brand hover:bg-surface focus-visible:outline-2 focus-visible:outline-brand"
                        onClick={(event) => onEditCourse(course, event.currentTarget)}
                        type="button"
                      >
                        Cambiar estado
                      </button>
                    </li>
                  ),
                )}
              </ul>
            </details>
          )}

          <details className="shrink-0 border-t border-border py-3 text-xs">
            <summary className="cursor-pointer font-medium text-brand">
              Condiciones de inscripción
            </summary>
            <div className="mt-3 space-y-3 leading-5">
              <p className="text-muted">
                {evaluation.maximumCredits === null
                  ? "Máximo de SCT por confirmar con la carrera."
                  : "Máximo aplicable: 36 SCT."}
              </p>
              <label className="block">
                Excepción confirmada al mínimo de 12 SCT
                <select
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 focus-visible:outline-2 focus-visible:outline-brand"
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    if (isException(value)) setException(value);
                  }}
                  value={exception}
                >
                  <option value="none">Sin excepción</option>
                  <option value="last-semester">Último semestre confirmado</option>
                  <option value="insufficient-offer">Falta de oferta confirmada</option>
                </select>
              </label>
              {evaluation.errors.map((item) => (
                <p className="text-rose-800" key={item}>
                  {item}
                </p>
              ))}
              {evaluation.notices.map((item) => (
                <p className="text-muted" key={item}>
                  {item}
                </p>
              ))}
              {unknownCodes.length > 0 && (
                <p className="text-muted">
                  Códigos del reporte sin correspondencia en esta malla: {unknownCodes.join(", ")}.
                </p>
              )}
              {report?.issues.map((item) => (
                <p className="text-amber-900" key={item}>
                  {item}
                </p>
              ))}
              <p className="text-muted">
                La oferta y los cupos corresponden al reporte descargado. La universidad confirma la
                inscripción.
              </p>
            </div>
          </details>
        </aside>

        <div className="flex min-h-120 min-w-0 flex-col lg:min-h-0">
          <header className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-brand">Tu horario</h3>
            <div className="flex items-center gap-2">
              <button
                aria-label="Combinación anterior"
                className={outlineButton}
                disabled={!result || option === 0}
                onClick={() => setOption((current) => Math.max(0, current - 1))}
                type="button"
              >
                <ChevronLeft aria-hidden="true" className="size-4" />
              </button>
              <span aria-live="polite" className="min-w-24 text-center text-xs">
                {result && result.combinations.length > 0
                  ? `Opción ${option + 1} de ${result.combinations.length}`
                  : "Sin opción"}
              </span>
              <button
                aria-label="Combinación siguiente"
                className={outlineButton}
                disabled={!result || option >= result.combinations.length - 1}
                onClick={() => setOption((current) => current + 1)}
                type="button"
              >
                <ChevronRight aria-hidden="true" className="size-4" />
              </button>
            </div>
          </header>

          <SchedulePreview sections={combination} />

          <div aria-live="polite" className="shrink-0 space-y-2 pt-3 text-xs leading-5">
            {!result && <p className="text-muted">Elige tus ramos y pulsa Buscar horarios.</p>}
            {result && result.unresolvedCodes.length > 0 && (
              <p className="text-amber-900">
                Faltan secciones con horarios completos para {result.unresolvedCodes.join(", ")}.
              </p>
            )}
            {result && result.unresolvedCodes.length === 0 && result.combinations.length === 0 && (
              <p className="text-amber-900">
                {result.limited
                  ? "No se encontró un horario dentro del límite de búsqueda."
                  : "No hay combinaciones sin topes para estos ramos."}
              </p>
            )}
            {result?.limited && (
              <p className="text-muted">Resultados parciales: se alcanzó el límite de búsqueda.</p>
            )}
            {result && result.excludedSections.length > 0 && (
              <p className="text-muted">
                Se omitieron {result.excludedSections.length} secciones con horarios incompletos o
                cruces internos.
              </p>
            )}
            {combination.length > 0 && (
              <p className="text-emerald-700">
                Sin topes de horario entre las secciones mostradas.
              </p>
            )}
            {selectedCodes.length > 0 && evaluation.errors.length > 0 && (
              <p className="text-amber-900">
                Revisa las condiciones de inscripción de este borrador.
              </p>
            )}
          </div>

          {combination.length > 0 && (
            <details className="mt-3 shrink-0 text-xs">
              <summary className="cursor-pointer font-medium text-brand">Revisar secciones</summary>
              <ul className="mt-2 max-h-40 space-y-3 overflow-auto">
                {combination.map((section) => (
                  <li key={section.id}>
                    <p className="font-medium">
                      {section.code} · Sección {section.section} · Grupo {section.group} ·{" "}
                      {section.shift}
                    </p>
                    {section.rows.map((row) => (
                      <p className="mt-1 leading-5 text-muted" key={row.sourceRow}>
                        {row.activity}: {row.rawSchedule} · {row.teachers || "Docente pendiente"} ·
                        Cupos: {row.capacity || "por confirmar"}
                      </p>
                    ))}
                  </li>
                ))}
              </ul>
            </details>
          )}

          <footer className="mt-3 flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border py-3">
            {combination.length > 0 && report && (
              <ScheduleApply
                key={String(imported?.revision)}
                onUse={onUseSchedule}
                reportPeriod={report.period}
                sections={combination}
              />
            )}
            <p className="text-xs text-muted">El horario no modifica tu avance</p>
            <button
              className={outlineButton}
              disabled={combination.length === 0}
              onClick={downloadSchedule}
              type="button"
            >
              Descargar horario
            </button>
          </footer>
        </div>
      </div>
    </section>
  );
}

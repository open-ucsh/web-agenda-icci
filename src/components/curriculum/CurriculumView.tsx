import { Search } from "lucide-react";
import { useId, useState } from "react";

import { CurriculumCourseCard } from "@/components/curriculum/CurriculumCourseCard";
import { CURRICULUM_COURSES, CURRICULUM_PLAN } from "@/data/curriculum";
import { filterCurriculumCourses, getCourseYear, getCurriculumCredits } from "@/lib/curriculum";
import type { CourseKind } from "@/types/curriculum";

const YEARS = Array.from({ length: CURRICULUM_PLAN.years }, (_, index) => index + 1);

const COURSE_NAMES = new Map(CURRICULUM_COURSES.map((course) => [course.code, course.name]));

const TOTAL_CREDITS = getCurriculumCredits(CURRICULUM_COURSES);

function isKind(value: string): value is CourseKind | "all" {
  return value === "all" || value === "required" || value === "elective" || value === "general";
}

export function CurriculumView() {
  const headingId = useId();
  const searchId = useId();
  const yearId = useId();
  const kindId = useId();

  const [query, setQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedKind, setSelectedKind] = useState<CourseKind | "all">("all");

  const courses = filterCurriculumCourses(CURRICULUM_COURSES, {
    query,
    year: selectedYear,
    kind: selectedKind,
  });

  const visibleYears = YEARS.filter((year) =>
    courses.some((course) => getCourseYear(course) === year),
  );

  const hasFilters = query.trim() !== "" || selectedYear !== null || selectedKind !== "all";

  function clearFilters(): void {
    setQuery("");
    setSelectedYear(null);
    setSelectedKind("all");
  }

  const controlClass =
    "h-10 rounded-md border border-border bg-background px-3 text-sm text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

  return (
    <section aria-labelledby={headingId} className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              className="text-xl font-semibold tracking-tight text-brand sm:text-2xl"
              id={headingId}
            >
              Mi malla
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted">{CURRICULUM_PLAN.name}</p>
          </div>

          <span className="rounded-md border border-border px-2.5 py-1 text-xs text-muted">
            Plan {CURRICULUM_PLAN.year}
          </span>
        </div>

        <p className="mt-3 text-xs leading-5 text-muted">
          <span className="font-semibold text-text">{TOTAL_CREDITS} SCT</span>
          {" · "}
          {CURRICULUM_COURSES.length} asignaturas
          {" · "}
          {CURRICULUM_PLAN.semesters} niveles
          {" · "}
          {CURRICULUM_PLAN.years} años
        </p>
      </header>

      <div className="mb-4 flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1 sm:min-w-60">
          <label className="sr-only" htmlFor={searchId}>
            Buscar asignatura por nombre o código
          </label>

          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
          />

          <input
            className={`${controlClass} w-full pl-9`}
            id={searchId}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Buscar ramo o código"
            type="search"
            value={query}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex">
          <div>
            <label className="sr-only" htmlFor={yearId}>
              Filtrar por año
            </label>

            <select
              className={`${controlClass} w-full`}
              id={yearId}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setSelectedYear(value === "all" ? null : Number(value));
              }}
              value={selectedYear ?? "all"}
            >
              <option value="all">Todos los años</option>
              {YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}.º año
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="sr-only" htmlFor={kindId}>
              Filtrar por tipo de asignatura
            </label>

            <select
              className={`${controlClass} w-full`}
              id={kindId}
              onChange={(event) => {
                const value = event.currentTarget.value;

                if (isKind(value)) {
                  setSelectedKind(value);
                }
              }}
              value={selectedKind}
            >
              <option value="all">Todos los tipos</option>
              <option value="required">Obligatorios</option>
              <option value="elective">Optativos</option>
              <option value="general">Formación general</option>
            </select>
          </div>
        </div>

        {hasFilters && (
          <button
            className="self-start rounded-md px-2 py-2 text-xs font-medium text-brand hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            onClick={clearFilters}
            type="button"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <p aria-live="polite" className="mb-3 shrink-0 text-xs text-muted">
        {hasFilters
          ? `${courses.length} asignaturas · ${getCurriculumCredits(courses)} SCT en los resultados`
          : "Explora las asignaturas y sus prerrequisitos por año."}
      </p>

      {courses.length > 0 ? (
        <div
          aria-label="Malla curricular por año. Desplázate para consultar los niveles."
          className="min-h-0 flex-1 overflow-auto overscroll-contain rounded-md border border-border focus-visible:outline-2 focus-visible:outline-brand"
          role="region"
          tabIndex={0}
        >
          <div className="flex min-h-full items-start gap-4 p-4">
            {visibleYears.map((year) => (
              <section
                aria-labelledby={`${headingId}-year-${year}`}
                className="w-72 shrink-0"
                key={year}
              >
                <h3
                  className="mb-3 flex items-center justify-between border-b border-border pb-3 text-sm font-semibold text-brand"
                  id={`${headingId}-year-${year}`}
                >
                  <span>{year}.º año</span>
                  <span className="text-xs font-normal text-muted">
                    {getCurriculumCredits(
                      CURRICULUM_COURSES.filter((course) => getCourseYear(course) === year),
                    )}{" "}
                    SCT
                  </span>
                </h3>

                <div className="space-y-5">
                  {[year * 2 - 1, year * 2].map((semester) => {
                    const semesterCourses = courses.filter(
                      (course) => course.semester === semester,
                    );

                    if (semesterCourses.length === 0) {
                      return null;
                    }

                    return (
                      <section aria-labelledby={`${headingId}-semester-${semester}`} key={semester}>
                        <h4
                          className="mb-2 text-xs font-medium text-muted"
                          id={`${headingId}-semester-${semester}`}
                        >
                          Semestre {semester}
                          {" · "}
                          Nivel {semester * 100}
                        </h4>

                        <ul className="space-y-2">
                          {semesterCourses.map((course) => (
                            <li key={course.code}>
                              <CurriculumCourseCard
                                course={course}
                                prerequisiteNames={course.prerequisites.map(
                                  (code) => COURSE_NAMES.get(code) ?? code,
                                )}
                              />
                            </li>
                          ))}
                        </ul>
                      </section>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border p-6 text-center">
          <p className="text-sm font-medium text-text">No hay asignaturas con esos filtros</p>

          <button
            className="rounded-md px-3 py-2 text-sm text-brand hover:bg-surface focus-visible:outline-2 focus-visible:outline-brand"
            onClick={clearFilters}
            type="button"
          >
            Mostrar toda la malla
          </button>
        </div>
      )}

      <footer className="shrink-0 py-3 text-xs leading-5 text-muted">
        Fuente: Plan de Estudios ICCI UCSH {CURRICULUM_PLAN.year}, Plan N.º {CURRICULUM_PLAN.number}
        . Los optativos y la formación general también forman parte de los créditos del plan.
      </footer>
    </section>
  );
}

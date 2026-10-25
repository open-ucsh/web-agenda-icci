import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useId, useRef, useState } from "react";

import { CurriculumCourseCard } from "@/components/curriculum/CurriculumCourseCard";
import { CurriculumCourseDialog } from "@/components/curriculum/CurriculumCourseDialog";
import { COURSE_PROGRESS_CONFIG, isCourseDisplayStatus } from "@/config/course-progress";
import { CURRICULUM_COURSES, CURRICULUM_PLAN } from "@/data/curriculum";
import { useCurriculumProgress } from "@/hooks/use-curriculum-progress";
import { filterCurriculumCourses, getCurriculumCredits } from "@/lib/curriculum";
import { getApprovedCredits, getCourseDisplayStatus } from "@/lib/curriculum-progress";
import type { CurriculumCourse } from "@/types/curriculum";
import type { CourseDisplayStatus } from "@/types/curriculum-progress";

const TOTAL = getCurriculumCredits(CURRICULUM_COURSES);
const SEMESTERS = Array.from({ length: 12 }, (_, index) => index + 1);

export function CurriculumView() {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CurriculumCourse | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<CourseDisplayStatus | "all">("all");
  const { progress, message, setCourseStatus } = useCurriculumProgress();

  const credits = getApprovedCredits(CURRICULUM_COURSES, progress);
  const approved = CURRICULUM_COURSES.filter(
    (course) => progress[course.code] === "approved",
  ).length;

  const searching = query.trim() !== "";
  const semesters = searching ? SEMESTERS : SEMESTERS.slice(page * 6, page * 6 + 6);

  const courses = filterCurriculumCourses(CURRICULUM_COURSES, {
    query,
    year: null,
    kind: "all",
  }).filter(
    (course) =>
      status === "all" || getCourseDisplayStatus(course, CURRICULUM_COURSES, progress) === status,
  );

  function openCourse(course: CurriculumCourse, trigger: HTMLButtonElement): void {
    triggerRef.current = trigger;
    setSelectedCourse(course);
  }

  function goToProgress(): void {
    const pending = CURRICULUM_COURSES.find((course) => progress[course.code] !== "approved");

    setQuery("");
    setStatus("all");
    setPage(pending && pending.semester > 6 ? 1 : 0);
  }

  const navigationClass =
    "grid size-9 place-items-center rounded-md border border-border text-muted enabled:hover:bg-surface disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-brand";

  return (
    <section aria-labelledby={`${id}-title`} className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 py-4">
        <div className="flex items-center gap-5">
          <div>
            <h2 className="text-lg font-semibold text-brand" id={`${id}-title`}>
              Malla curricular
            </h2>
            <p className="mt-1 text-xs text-muted">
              {searching
                ? "Resultados en toda la malla"
                : page === 0
                  ? "1.º a 3.º año"
                  : "4.º a 6.º año"}
              {" · "}Plan {CURRICULUM_PLAN.year}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              aria-label="Mostrar los primeros seis semestres"
              className={navigationClass}
              disabled={searching || page === 0}
              onClick={() => setPage(0)}
              type="button"
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
            </button>
            <button
              className="h-9 rounded-md border border-border px-3 text-xs font-medium hover:bg-surface focus-visible:outline-2 focus-visible:outline-brand"
              onClick={goToProgress}
              type="button"
            >
              Mi avance
            </button>
            <button
              aria-label="Mostrar los últimos seis semestres"
              className={navigationClass}
              disabled={searching || page === 1}
              onClick={() => setPage(1)}
              type="button"
            >
              <ChevronRight aria-hidden="true" className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <label className="sr-only" htmlFor={`${id}-search`}>
              Buscar ramo
            </label>
            <Search aria-hidden="true" className="absolute top-3 left-3 size-4 text-muted" />
            <input
              className="h-10 w-52 rounded-md border border-border bg-background pr-3 pl-9 text-sm focus-visible:outline-2 focus-visible:outline-brand"
              id={`${id}-search`}
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder="Buscar ramo o código"
              type="search"
              value={query}
            />
          </div>

          <label className="sr-only" htmlFor={`${id}-status`}>
            Filtrar estado
          </label>
          <select
            className="h-10 rounded-md border border-border bg-background px-3 text-xs focus-visible:outline-2 focus-visible:outline-brand"
            id={`${id}-status`}
            onChange={(event) => {
              const value = event.currentTarget.value;
              if (value === "all" || isCourseDisplayStatus(value)) {
                setStatus(value);
              }
            }}
            value={status}
          >
            <option value="all">Todos los estados</option>
            {Object.entries(COURSE_PROGRESS_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="mb-4 flex shrink-0 items-center gap-4 text-xs">
        <p className="shrink-0 text-muted">
          <span className="font-semibold text-brand">{credits}</span> / {TOTAL} SCT aprobados
        </p>
        <progress
          aria-label="Créditos aprobados"
          className="h-1.5 min-w-8 flex-1 accent-emerald-600"
          max={TOTAL}
          value={credits}
        />
        <span className="hidden text-muted sm:block">{approved} ramos aprobados</span>
      </div>

      {message && (
        <p className="mb-3 text-xs text-amber-800" role="status">
          {message}
        </p>
      )}

      <div
        aria-label="Malla curricular por semestre"
        className="min-h-0 flex-1 overflow-auto overscroll-contain rounded-md border border-border focus-visible:outline-2 focus-visible:outline-brand"
        role="region"
        tabIndex={0}
      >
        <div className="flex min-h-full min-w-full">
          {semesters.map((semester) => {
            const items = courses.filter((course) => course.semester === semester);
            const semesterCredits = getCurriculumCredits(
              CURRICULUM_COURSES.filter((course) => course.semester === semester),
            );

            return (
              <section
                aria-labelledby={`${id}-semester-${semester}`}
                className="min-w-52 flex-1 basis-0 border-r border-border last:border-r-0"
                key={semester}
              >
                <header className="sticky top-0 z-10 border-b border-border bg-background text-center">
                  <p className="border-b border-border bg-surface py-2 text-xs font-medium text-brand">
                    {Math.ceil(semester / 2)}.º año
                  </p>
                  <h3
                    className="pt-3 text-sm font-semibold text-brand"
                    id={`${id}-semester-${semester}`}
                  >
                    Semestre {semester}
                  </h3>
                  <p className="pb-3 pt-1 text-xs text-muted">
                    Nivel {semester * 100} · {semesterCredits} SCT
                  </p>
                </header>

                <ul className="space-y-2 p-2">
                  {items.map((course) => (
                    <li key={course.code}>
                      <CurriculumCourseCard
                        course={course}
                        onOpen={openCourse}
                        status={getCourseDisplayStatus(course, CURRICULUM_COURSES, progress)}
                      />
                    </li>
                  ))}
                </ul>

                {items.length === 0 && (
                  <p className="p-4 text-center text-xs text-muted">Sin coincidencias</p>
                )}
              </section>
            );
          })}
        </div>
      </div>

      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 py-3 text-xs text-muted">
        <span>Plan ICCI UCSH {CURRICULUM_PLAN.year}</span>
        <span aria-live="polite">
          {searching
            ? `${courses.length} resultados`
            : `Semestres ${page * 6 + 1}–${page * 6 + 6} de 12`}
        </span>
        <span>Open UCSH</span>
      </footer>

      <CurriculumCourseDialog
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
        onStatusChange={setCourseStatus}
        progress={progress}
        triggerRef={triggerRef}
      />
    </section>
  );
}

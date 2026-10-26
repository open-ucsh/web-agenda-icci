import { Search } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { CurriculumCourseCard } from "@/components/curriculum/CurriculumCourseCard";
import { CurriculumSearchResults } from "@/components/curriculum/CurriculumSearchResults";
import { CurriculumCourseDialog } from "@/components/curriculum/CurriculumCourseDialog";
import { COURSE_PROGRESS_CONFIG } from "@/config/course-progress";
import { CURRICULUM_COURSES, CURRICULUM_PLAN } from "@/data/curriculum";
import { useCurriculumProgress } from "@/hooks/use-curriculum-progress";
import { getCurriculumCredits } from "@/lib/curriculum";
import { getApprovedCredits, getCourseDisplayStatus } from "@/lib/curriculum-progress";
import type { CurriculumCourse } from "@/types/curriculum";

import styles from "./CurriculumView.module.css";

const TOTAL = getCurriculumCredits(CURRICULUM_COURSES);
const YEARS = [1, 2, 3, 4, 5, 6] as const;
const PAGES = [
  { value: 0, label: "1.º–3.º año" },
  { value: 1, label: "4.º–6.º año" },
] as const;

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-CL")
    .trim()
    .replace(/\s+/g, " ");
}

export function CurriculumView() {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CurriculumCourse | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { progress, message, setCourseStatus } = useCurriculumProgress();

  const credits = getApprovedCredits(CURRICULUM_COURSES, progress);
  const approved = CURRICULUM_COURSES.filter(
    (course) => progress[course.code] === "approved",
  ).length;

  const terms = normalizeSearch(query).split(" ").filter(Boolean);
  const searching = terms.length > 0;
  const courses = CURRICULUM_COURSES.filter((course) => {
    const text = normalizeSearch(`${course.name} ${course.code}`);
    return terms.every((term) => text.includes(term));
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ left: 0, top: 0 });
  }, [query, page]);

  const visibleYears = searching
    ? YEARS.filter((year) => courses.some((course) => Math.ceil(course.semester / 2) === year))
    : YEARS.slice(page * 3, page * 3 + 3);

  function openCourse(course: CurriculumCourse, trigger: HTMLButtonElement): void {
    triggerRef.current = trigger;
    setSelectedCourse(course);
  }

  return (
    <section aria-labelledby={`${id}-title`} className={styles.view}>
      <header className={styles.header}>
        <div className={styles.identity}>
          <h2 id={`${id}-title`}>Mi malla</h2>
          <span>Plan {CURRICULUM_PLAN.year}</span>
        </div>

        <div className={styles.controls}>
          <div className={styles.search}>
            <label className="sr-only" htmlFor={`${id}-search`}>
              Buscar ramo o código
            </label>
            <Search aria-hidden="true" />
            <input
              id={`${id}-search`}
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder="Buscar ramo o código"
              type="search"
              value={query}
            />
          </div>
        </div>
      </header>

      <div className={styles.summary}>
        {searching ? (
          <div className="flex flex-wrap items-center gap-4">
            <p aria-live="polite" className={styles.results}>
              {courses.length} {courses.length === 1 ? "resultado" : "resultados"} en toda la malla
            </p>
            <button
              className="min-h-9 rounded px-2 text-xs font-medium text-brand hover:bg-surface focus-visible:outline-2 focus-visible:outline-brand"
              onClick={() => setQuery("")}
              type="button"
            >
              Volver a la malla
            </button>
          </div>
        ) : (
          <div aria-label="Años de la malla" className={styles.navigation} role="group">
            {PAGES.map((item) => (
              <button
                aria-pressed={page === item.value}
                key={item.value}
                onClick={() => setPage(item.value)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        <div className={styles.progress}>
          <p>
            <strong>{credits}</strong> / {TOTAL} SCT aprobados
          </p>
          <progress aria-label="Créditos aprobados" max={TOTAL} value={credits} />
          <span>{approved} ramos aprobados</span>
        </div>
      </div>

      {message && (
        <p className={styles.message} role="status">
          {message}
        </p>
      )}

      <div
        aria-label="Malla curricular por año y semestre"
        className={styles.scroll}
        ref={scrollRef}
        role="region"
        tabIndex={0}
      >
        {searching ? (
          <CurriculumSearchResults
            courses={courses}
            onClear={() => setQuery("")}
            onOpen={openCourse}
            progress={progress}
            query={query}
          />
        ) : visibleYears.length === 0 ? (
          <div className={styles.empty}>
            <p>No encontramos ramos con esa búsqueda.</p>
            <button
              onClick={() => {
                setQuery("");
              }}
              type="button"
            >
              Limpiar búsqueda
            </button>
          </div>
        ) : (
          <div className={styles.years}>
            {visibleYears.map((year) => (
              <section aria-labelledby={`${id}-year-${year}`} className={styles.year} key={year}>
                <header className={styles.yearHeader}>
                  <h3 id={`${id}-year-${year}`}>{year}.º año</h3>
                  <div className={styles.semesterHeaders}>
                    {[year * 2 - 1, year * 2].map((semester) => (
                      <div key={semester}>
                        <h4 id={`${id}-semester-${semester}`}>Semestre {semester}</h4>
                        <p>
                          {getCurriculumCredits(
                            CURRICULUM_COURSES.filter((course) => course.semester === semester),
                          )}{" "}
                          SCT
                        </p>
                      </div>
                    ))}
                  </div>
                </header>

                <div className={styles.semesters}>
                  {[year * 2 - 1, year * 2].map((semester) => {
                    const items = courses.filter((course) => course.semester === semester);

                    return (
                      <section
                        aria-labelledby={`${id}-semester-${semester}`}
                        className={styles.semester}
                        key={semester}
                      >
                        <ul className={styles.courses}>
                          {items.map((course) => (
                            <li key={course.code}>
                              <CurriculumCourseCard
                                course={course}
                                onOpen={openCourse}
                                status={getCourseDisplayStatus(
                                  course,
                                  CURRICULUM_COURSES,
                                  progress,
                                )}
                              />
                            </li>
                          ))}
                        </ul>
                        {items.length === 0 && (
                          <p className={styles.noMatches}>Sin coincidencias</p>
                        )}
                      </section>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <div aria-label="Estados de los ramos" className={styles.legend}>
          {Object.entries(COURSE_PROGRESS_CONFIG).map(([value, config]) => (
            <span className={styles.legendItem} key={value}>
              <i aria-hidden="true" className={`${styles.legendSample} ${config.className}`} />
              {config.label}
            </span>
          ))}
        </div>
        <p>Selecciona un ramo para ver sus requisitos o cambiar su estado.</p>
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

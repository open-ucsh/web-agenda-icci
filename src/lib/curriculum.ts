import type { CurriculumCourse, CurriculumFilters } from "@/types/curriculum";

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim();
}

export function getCourseYear(course: CurriculumCourse): number {
  return Math.ceil(course.semester / 2);
}

export function getCurriculumCredits(courses: readonly CurriculumCourse[]): number {
  return courses.reduce((total, course) => total + course.credits, 0);
}

export function filterCurriculumCourses(
  courses: readonly CurriculumCourse[],
  filters: CurriculumFilters,
): CurriculumCourse[] {
  const terms = normalizeSearch(filters.query).split(/\s+/).filter(Boolean);

  return courses.filter((course) => {
    if (filters.year !== null && getCourseYear(course) !== filters.year) {
      return false;
    }

    if (filters.kind !== "all" && course.kind !== filters.kind) {
      return false;
    }

    const searchable = normalizeSearch(`${course.code} ${course.name}`);

    return terms.every((term) => searchable.includes(term));
  });
}

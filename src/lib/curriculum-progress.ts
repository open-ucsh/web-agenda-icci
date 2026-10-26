import type { CurriculumCourse } from "@/types/curriculum";
import type {
  CourseDisplayStatus,
  CourseProgressStatus,
  CurriculumProgress,
} from "@/types/curriculum-progress";

export function isCourseProgressStatus(value: unknown): value is CourseProgressStatus {
  return value === "in-progress" || value === "approved" || value === "failed";
}

export function getApprovedCredits(
  courses: readonly CurriculumCourse[],
  progress: CurriculumProgress,
): number {
  return courses.reduce(
    (total, course) => total + (progress[course.code] === "approved" ? course.credits : 0),
    0,
  );
}

export function getCourseRequirements(
  course: CurriculumCourse,
  courses: readonly CurriculumCourse[],
  progress: CurriculumProgress,
) {
  const missingPrerequisites = course.prerequisites.filter((code) => progress[code] !== "approved");

  const approvedCredits = courses.reduce(
    (total, item) =>
      total + (item.code !== course.code && progress[item.code] === "approved" ? item.credits : 0),
    0,
  );

  const missingCredits = Math.max(0, course.minimumCredits - approvedCredits);

  return {
    missingPrerequisites,
    missingCredits,
    eligible: missingPrerequisites.length === 0 && missingCredits === 0,
  };
}

export function getCourseDisplayStatus(
  course: CurriculumCourse,
  courses: readonly CurriculumCourse[],
  progress: CurriculumProgress,
): CourseDisplayStatus {
  const recorded = progress[course.code];

  if (recorded) {
    return recorded;
  }

  return getCourseRequirements(course, courses, progress).eligible ? "available" : "blocked";
}

export function getDependentCourses(
  courses: readonly CurriculumCourse[],
  code: string,
): CurriculumCourse[] {
  const visited = new Set([code]);
  const pending = [code];

  for (const current of pending) {
    for (const course of courses) {
      if (course.prerequisites.includes(current) && !visited.has(course.code)) {
        visited.add(course.code);
        pending.push(course.code);
      }
    }
  }

  return courses.filter((course) => course.code !== code && visited.has(course.code));
}

export function updateCourseProgress(
  progress: CurriculumProgress,
  code: string,
  status: CourseProgressStatus | null,
): CurriculumProgress {
  const next = { ...progress };

  if (status === null) {
    delete next[code];
  } else {
    next[code] = status;
  }

  return next;
}

export function parseCurriculumProgress(
  serialized: string | null,
  courses: readonly CurriculumCourse[],
): CurriculumProgress {
  if (serialized === null) {
    return {};
  }

  const value: unknown = JSON.parse(serialized);

  if (
    typeof value !== "object" ||
    value === null ||
    !("version" in value) ||
    value.version !== 1 ||
    !("progress" in value) ||
    typeof value.progress !== "object" ||
    value.progress === null ||
    Array.isArray(value.progress)
  ) {
    throw new Error("Formato de avance no compatible.");
  }

  const knownCodes = new Set(courses.map((course) => course.code));
  const progress: Partial<Record<string, CourseProgressStatus>> = {};

  for (const [code, status] of Object.entries(value.progress)) {
    if (knownCodes.has(code) && isCourseProgressStatus(status)) {
      progress[code] = status;
    }
  }

  return progress;
}

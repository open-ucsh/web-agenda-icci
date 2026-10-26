import { getCourseRequirements } from "@/lib/curriculum-progress";
import type { CurriculumCourse } from "@/types/curriculum";
import type { CurriculumProgress } from "@/types/curriculum-progress";

export type CourseOffering = "unknown" | "offered" | "unavailable";
export type MinimumLoadException = "none" | "last-semester" | "insufficient-offer";

interface SemesterPlanInput {
  courses: readonly CurriculumCourse[];
  progress: CurriculumProgress;
  selectedCodes: readonly string[];
  offerings: Readonly<Partial<Record<string, CourseOffering>>>;
  minimumException: MinimumLoadException;
}

export function evaluateSemesterPlan({
  courses,
  progress,
  selectedCodes,
  offerings,
  minimumException,
}: SemesterPlanInput) {
  const selected = new Set(selectedCodes);
  const selectedCourses = courses.filter((course) => selected.has(course.code));
  const credits = selectedCourses.reduce((total, course) => total + course.credits, 0);
  const firstYear = courses.filter((course) => course.semester <= 2);

  const firstYearApproved =
    firstYear.length > 0 && firstYear.every((course) => progress[course.code] === "approved");

  const maximumCredits = firstYearApproved ? 36 : null;
  const errors: string[] = [];
  const notices: string[] = [];

  if (selectedCodes.some((code) => !courses.some((course) => course.code === code))) {
    errors.push("El borrador contiene un código que no pertenece al plan.");
  }

  if (credits < 12 && minimumException === "none") {
    errors.push("Artículo 12: la carga es inferior al mínimo de 12 SCT.");
  }

  if (maximumCredits !== null && credits > maximumCredits) {
    errors.push("Artículo 12: la carga supera el máximo de 36 SCT.");
  }

  if (!firstYearApproved) {
    notices.push(
      "El primer año no está completamente aprobado. El artículo 12 no permite determinar aquí tu máximo de carga; debes confirmarlo con la carrera.",
    );
  }

  if (minimumException !== "none") {
    notices.push(
      "La excepción al mínimo fue indicada manualmente y debe estar confirmada por la universidad.",
    );
  }

  for (const course of selectedCourses) {
    if (progress[course.code] === "approved") {
      errors.push(`${course.name}: ya está aprobado.`);
    }

    if (!getCourseRequirements(course, courses, progress).eligible) {
      errors.push(`${course.name}: faltan prerrequisitos o créditos aprobados.`);
    }

    if (offerings[course.code] === "unavailable") {
      errors.push(`${course.name}: lo marcaste como no ofertado.`);
    }
  }

  const unconfirmed = selectedCourses.filter(
    (course) => !offerings[course.code] || offerings[course.code] === "unknown",
  );

  if (unconfirmed.length > 0) {
    notices.push(`Falta confirmar la oferta de ${unconfirmed.length} ramos seleccionados.`);
  }

  const overdue = courses
    .filter((course) => progress[course.code] === "failed")
    .toSorted(
      (first, second) => first.semester - second.semester || first.code.localeCompare(second.code),
    );

  const omittedOffered = overdue.filter(
    (course) => !selected.has(course.code) && offerings[course.code] === "offered",
  );

  if (omittedOffered.length > 0) {
    notices.push(
      "Artículo 13: revisa los reprobados ofertados que no seleccionaste, priorizando los niveles inferiores: " +
        omittedOffered.map((course) => course.name).join(", ") +
        ".",
    );
  }

  if (overdue.some((course) => !offerings[course.code] || offerings[course.code] === "unknown")) {
    notices.push(
      "Artículo 13: confirma la oferta de tus ramos reprobados para inscribirlos en la primera oportunidad posible.",
    );
  }

  return {
    credits,
    maximumCredits,
    firstYearApproved,
    selectedCourses,
    overdue,
    errors,
    notices,
  };
}

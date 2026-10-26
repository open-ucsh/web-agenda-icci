import { useSyncExternalStore } from "react";

import { CURRICULUM_COURSES } from "@/data/curriculum";
import {
  getCourseRequirements,
  parseCurriculumProgress,
  updateCourseProgress,
} from "@/lib/curriculum-progress";
import type { CourseProgressStatus, CurriculumProgress } from "@/types/curriculum-progress";

const STORAGE_KEY = "open-ucsh:icci:plan-2023:progress:v1";
const listeners = new Set<() => void>();

interface ProgressSnapshot {
  progress: CurriculumProgress;
  message: string | null;
}

const EMPTY_SNAPSHOT: ProgressSnapshot = {
  progress: {},
  message: null,
};

let snapshot = EMPTY_SNAPSHOT;
let initialized = false;

function readStoredProgress(): ProgressSnapshot {
  try {
    return {
      progress: parseCurriculumProgress(
        window.localStorage.getItem(STORAGE_KEY),
        CURRICULUM_COURSES,
      ),
      message: null,
    };
  } catch {
    return {
      progress: {},
      message:
        "No se pudo recuperar el avance guardado. Los datos originales no se han sobrescrito.",
    };
  }
}

function getSnapshot(): ProgressSnapshot {
  if (!initialized) {
    snapshot = readStoredProgress();
    initialized = true;
  }

  return snapshot;
}

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  function handleStorage(event: StorageEvent): void {
    if (event.key !== STORAGE_KEY && event.key !== null) {
      return;
    }

    try {
      if (event.storageArea !== window.localStorage) {
        return;
      }
    } catch {
      return;
    }

    snapshot = readStoredProgress();
    initialized = true;
    notify();
  }

  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function getServerSnapshot(): ProgressSnapshot {
  return EMPTY_SNAPSHOT;
}

function setCourseStatus(code: string, status: CourseProgressStatus | null): void {
  const current = getSnapshot();
  const course = CURRICULUM_COURSES.find((item) => item.code === code);

  if (!course) {
    return;
  }

  if (
    (status === "in-progress" || status === "approved") &&
    !getCourseRequirements(course, CURRICULUM_COURSES, current.progress).eligible
  ) {
    snapshot = {
      ...current,
      message: "Debes cumplir los prerrequisitos antes de aprobar o cursar este ramo.",
    };
    notify();
    return;
  }

  const progress = updateCourseProgress(current.progress, code, status);

  const invalidatedCourse = CURRICULUM_COURSES.find((item) => {
    const recorded = progress[item.code];

    if (item.code === code || (recorded !== "approved" && recorded !== "in-progress")) {
      return false;
    }

    const previouslyEligible = getCourseRequirements(
      item,
      CURRICULUM_COURSES,
      current.progress,
    ).eligible;

    const remainsEligible = getCourseRequirements(item, CURRICULUM_COURSES, progress).eligible;

    return previouslyEligible && !remainsEligible;
  });

  if (invalidatedCourse) {
    snapshot = {
      ...current,
      message:
        `Primero cambia el estado de ${invalidatedCourse.name}. ` +
        "Este cambio dejaría sus requisitos sin cumplir.",
    };
    notify();
    return;
  }

  let message: string | null = null;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, progress }));
  } catch {
    message = "El cambio está disponible en esta sesión, pero no se pudo guardar en el navegador.";
  }

  snapshot = { progress, message };
  notify();
}

function markScheduleCoursesInProgress(codes: readonly string[]): void {
  const current = getSnapshot();
  let progress = current.progress;

  for (const code of new Set(codes)) {
    const course = CURRICULUM_COURSES.find((item) => item.code === code);

    // La oferta puede incluir ramos que no pertenecen a este plan.
    if (!course || current.progress[code] === "approved") {
      continue;
    }

    if (!getCourseRequirements(course, CURRICULUM_COURSES, current.progress).eligible) {
      throw new Error(
        `No se pudo aplicar el horario: revisa los prerrequisitos de ${course.name} en Mi malla.`,
      );
    }

    if (progress[code] !== "in-progress") {
      progress = updateCourseProgress(progress, code, "in-progress");
    }
  }

  if (progress === current.progress) {
    return;
  }

  let message: string | null = null;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, progress }));
  } catch {
    message =
      "Los ramos están marcados como cursando en esta sesión, pero no se pudo guardar el avance en el navegador.";
  }

  snapshot = { progress, message };
  notify();
}

export function useCurriculumProgress() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    ...current,
    setCourseStatus,
    markScheduleCoursesInProgress,
  };
}

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
    status === "in-progress" &&
    !getCourseRequirements(course, CURRICULUM_COURSES, current.progress).eligible
  ) {
    snapshot = {
      ...current,
      message: "Debes cumplir los prerrequisitos para marcar este ramo como cursando.",
    };
    notify();
    return;
  }

  const progress = updateCourseProgress(current.progress, code, status);
  let message: string | null = null;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, progress }));
  } catch {
    message = "El cambio está disponible en esta sesión, pero no se pudo guardar en el navegador.";
  }

  snapshot = { progress, message };
  notify();
}

export function useCurriculumProgress() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    ...current,
    setCourseStatus,
  };
}

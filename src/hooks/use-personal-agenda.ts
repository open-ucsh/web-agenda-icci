import { useSyncExternalStore } from "react";

import {
  emptyPersonalAgenda,
  parsePersonalAgenda,
  type PersonalAgendaData,
  type PersonalSchedule,
} from "@/lib/personal-agenda";
import type { ActivityType } from "@/types/activity";

const STORAGE_KEY = "open-ucsh:personal-agenda:v1";
const listeners = new Set<() => void>();

interface Snapshot {
  data: PersonalAgendaData;
  message: string | null;
}

const EMPTY: Snapshot = { data: emptyPersonalAgenda(), message: null };
let snapshot = EMPTY;
let initialized = false;

function read(): Snapshot {
  try {
    return { data: parsePersonalAgenda(window.localStorage.getItem(STORAGE_KEY)), message: null };
  } catch {
    return {
      data: emptyPersonalAgenda(),
      message:
        "No se pudo recuperar el horario guardado. Los datos originales no se sobrescribieron.",
    };
  }
}

function getSnapshot(): Snapshot {
  if (!initialized) {
    snapshot = read();
    initialized = true;
  }
  return snapshot;
}

function notify(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  function handleStorage(event: StorageEvent): void {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    try {
      if (event.storageArea !== window.localStorage) return;
    } catch {
      return;
    }
    snapshot = read();
    initialized = true;
    notify();
  }

  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function write(data: PersonalAgendaData): void {
  let message: string | null = null;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...data }));
  } catch {
    message =
      "El horario y los filtros están disponibles en esta sesión, pero no pudieron guardarse en el navegador.";
  }
  snapshot = { data, message };
  initialized = true;
  notify();
}

function saveSchedule(schedule: PersonalSchedule): void {
  const current = getSnapshot().data;
  write({
    ...current,
    schedules: [
      ...current.schedules.filter((item) => item.periodId !== schedule.periodId),
      schedule,
    ],
    selectedTypes: ["class"],
    onlyFree: true,
  });
}

function setSelectedTypes(selectedTypes: readonly ActivityType[]): void {
  write({ ...getSnapshot().data, selectedTypes: [...new Set(selectedTypes)] });
}

function setOnlyFree(onlyFree: boolean): void {
  write({ ...getSnapshot().data, onlyFree });
}

export function usePersonalAgenda() {
  const current = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  return { ...current, saveSchedule, setSelectedTypes, setOnlyFree };
}

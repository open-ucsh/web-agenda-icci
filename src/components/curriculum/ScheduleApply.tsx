import { ArrowRight } from "lucide-react";
import { useId, useState } from "react";

import { ACADEMIC_DATES, PERIODS } from "@/data/activities";
import type { CourseSection } from "@/lib/course-sections";
import { createPersonalSchedule, type PersonalSchedule } from "@/lib/personal-agenda";

import styles from "./SemesterPlanner.module.css";

interface ScheduleApplyProps {
  sections: readonly CourseSection[];
  reportPeriod: string;
  onUse: (schedule: PersonalSchedule) => void;
}

function detectPeriod(value: string): string {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const year = normalized.match(/(20\d{2})(?!\d)/)?.[1];
  const semester = normalized.includes("segundo")
    ? "2"
    : normalized.includes("primer")
      ? "1"
      : null;

  return year && semester ? `${year}-${semester}` : "";
}

export function ScheduleApply({ sections, reportPeriod, onUse }: ScheduleApplyProps) {
  const errorId = useId();
  const [error, setError] = useState("");

  function applySchedule(): void {
    setError("");

    try {
      const periodId = detectPeriod(reportPeriod);
      const period = PERIODS.find((item) => item.id === periodId);

      if (!period) {
        throw new Error("No se encontró el período académico de esta oferta.");
      }

      const startDate = ACADEMIC_DATES.find(
        (item) => item.periodId === period.id && item.id === `semester-start-${period.id}`,
      )?.startsOn;

      if (!startDate || startDate > period.semesterEnd) {
        throw new Error("El período todavía no tiene fechas de clases válidas.");
      }

      const schedule = createPersonalSchedule(sections, period.id, startDate, period.semesterEnd);

      onUse(schedule);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar el horario.");
    }
  }

  return (
    <>
      <button
        aria-describedby={error ? errorId : undefined}
        className={styles.primary}
        disabled={sections.length === 0}
        onClick={applySchedule}
        type="button"
      >
        Usar en mi agenda
        <ArrowRight aria-hidden="true" className="size-4" />
      </button>

      {error && (
        <p className="text-xs leading-5 text-rose-800" id={errorId} role="alert">
          {error}
        </p>
      )}
    </>
  );
}

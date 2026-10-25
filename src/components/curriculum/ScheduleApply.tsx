import { useId, useState } from "react";

import { PERIODS } from "@/data/activities";
import type { CourseSection } from "@/lib/course-sections";
import { createPersonalSchedule, type PersonalSchedule } from "@/lib/personal-agenda";

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
  const year = normalized.match(/\b(20\d{2})\b/)?.[1];
  const semester = normalized.includes("segundo")
    ? "2"
    : normalized.includes("primer")
      ? "1"
      : null;
  return year && semester ? `${year}-${semester}` : "";
}

export function ScheduleApply({ sections, reportPeriod, onUse }: ScheduleApplyProps) {
  const id = useId();
  const detectedPeriod = detectPeriod(reportPeriod);
  const [periodId, setPeriodId] = useState<string>(
    PERIODS.some((period) => period.id === detectedPeriod) ? detectedPeriod : "",
  );
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [error, setError] = useState("");
  const period = PERIODS.find((item) => item.id === periodId);
  const endDate = validUntil || period?.semesterEnd || "";
  const mismatch = Boolean(detectedPeriod && periodId && detectedPeriod !== periodId);
  const control =
    "mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-xs focus-visible:outline-2 focus-visible:outline-brand";

  return (
    <details className="w-full text-xs">
      <summary className="cursor-pointer font-medium text-brand">
        Usar este horario en mi agenda
      </summary>
      <form
        className="mt-3 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          setError("");
          try {
            if (mismatch || !period)
              throw new Error("El período elegido debe corresponder al reporte importado.");
            if (endDate > period.semesterEnd)
              throw new Error("La vigencia supera el término del período académico.");
            const schedule = createPersonalSchedule(sections, periodId, validFrom, endDate);
            onUse(schedule);
          } catch (cause) {
            setError(cause instanceof Error ? cause.message : "No se pudo aplicar el horario.");
          }
        }}
      >
        <p className="leading-5 text-muted">
          Confirma la vigencia de tus clases. El reporte no indica su fecha de inicio. Este horario
          reemplazará el guardado para el período elegido.
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          <label htmlFor={`${id}-period`}>
            Período
            <select
              className={control}
              id={`${id}-period`}
              onChange={(event) => {
                setPeriodId(event.currentTarget.value);
                setValidUntil("");
              }}
              required
              value={periodId}
            >
              <option value="">Seleccionar período</option>
              {PERIODS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor={`${id}-from`}>
            Inicio de clases
            <input
              className={control}
              id={`${id}-from`}
              max={endDate || undefined}
              onChange={(event) => setValidFrom(event.currentTarget.value)}
              required
              type="date"
              value={validFrom}
            />
          </label>
          <label htmlFor={`${id}-until`}>
            Término de clases
            <input
              className={control}
              id={`${id}-until`}
              max={period?.semesterEnd}
              min={validFrom || undefined}
              onChange={(event) => setValidUntil(event.currentTarget.value)}
              required
              type="date"
              value={endDate}
            />
          </label>
        </div>

        {mismatch && (
          <p className="text-rose-800">El período no coincide con el reporte importado.</p>
        )}
        {error && (
          <p className="text-rose-800" role="alert">
            {error}
          </p>
        )}

        <button
          className="h-10 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          disabled={sections.length === 0 || mismatch}
          type="submit"
        >
          Usar este horario
        </button>
      </form>
    </details>
  );
}

import { ArrowRight, X } from "lucide-react";
import { useId, useRef, useState } from "react";

import { Dialog } from "@/components/ui/Dialog";
import { PERIODS } from "@/data/activities";
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
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
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
    "mt-1.5 h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-brand";

  return (
    <>
      <button
        aria-haspopup="dialog"
        className={styles.primary}
        disabled={sections.length === 0}
        onClick={() => {
          setError("");
          dialogRef.current?.showModal();
        }}
        ref={triggerRef}
        type="button"
      >
        Usar en mi agenda
        <ArrowRight aria-hidden="true" className="size-4" />
      </button>

      <Dialog
        aria-labelledby={`${id}-title`}
        dialogRef={dialogRef}
        restoreFocusRef={triggerRef}
        size="medium"
      >
        <header className="flex items-center justify-between gap-3 border-b border-border p-5">
          <h2 className="text-lg font-semibold text-brand" id={`${id}-title`}>
            Usar este horario
          </h2>
          <button
            aria-label="Cerrar confirmación"
            className={styles.iconButton}
            onClick={() => dialogRef.current?.close()}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </header>

        <form
          className="min-h-0 space-y-5 overflow-y-auto p-5"
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            try {
              if (!period || mismatch) {
                throw new Error("El período debe corresponder al reporte importado.");
              }
              if (endDate > period.semesterEnd) {
                throw new Error("La vigencia supera el término del período académico.");
              }

              const schedule = createPersonalSchedule(sections, periodId, validFrom, endDate);
              dialogRef.current?.close();
              onUse(schedule);
            } catch (cause) {
              setError(cause instanceof Error ? cause.message : "No se pudo aplicar el horario.");
            }
          }}
        >
          <p className="text-sm leading-6 text-muted">
            Confirma cuándo tendrás clases. El horario reemplazará el guardado para este período.
          </p>

          <label className="block text-xs font-medium" htmlFor={`${id}-period`}>
            Período académico
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

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-medium" htmlFor={`${id}-from`}>
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
            <label className="block text-xs font-medium" htmlFor={`${id}-until`}>
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

          <p className="text-xs leading-5 text-muted">
            Tu avance académico no cambia. Podrás mostrar talleres, PACE y otros apoyos desde la
            agenda.
          </p>

          {mismatch && (
            <p className="text-xs text-rose-800">El período no coincide con el reporte.</p>
          )}
          {error && (
            <p className="text-xs text-rose-800" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button
              className={styles.secondary}
              onClick={() => dialogRef.current?.close()}
              type="button"
            >
              Cancelar
            </button>
            <button
              className={styles.primary}
              disabled={mismatch || sections.length === 0}
              type="submit"
            >
              Confirmar y abrir agenda
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

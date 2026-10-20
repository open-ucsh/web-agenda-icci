import { ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useId, useRef, useState } from "react";

interface MonthPickerProps {
  date: Date;
  label: string;
  onChange: (date: Date) => void;
}

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function MonthPicker({ date, label, onChange }: MonthPickerProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [year, setYear] = useState(date.getFullYear());

  function openPicker(): void {
    setYear(date.getFullYear());
    dialogRef.current?.showModal();
  }

  function selectMonth(month: number): void {
    dialogRef.current?.close();
    onChange(new Date(year, month, 1, 12));
  }

  const iconButton =
    "grid size-8 place-items-center rounded-md text-muted transition-colors hover:bg-surface hover:text-brand focus-visible:outline-2 focus-visible:outline-brand";

  return (
    <>
      <button
        aria-haspopup="dialog"
        aria-label={`Cambiar mes y año. ${label}`}
        className="flex min-w-0 items-center gap-2 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        onClick={openPicker}
        ref={triggerRef}
        type="button"
      >
        <span className="truncate text-base font-semibold capitalize tracking-tight sm:text-xl">
          {label}
        </span>
        <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-muted" />
      </button>

      <dialog
        aria-labelledby={titleId}
        className="fixed inset-0 m-auto w-88 max-w-full rounded-2xl border border-border bg-background p-5 text-text shadow-xl backdrop:bg-slate-950/30"
        onClose={() => triggerRef.current?.focus()}
        ref={dialogRef}
      >
        <header className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold" id={titleId}>
            Ir a un mes
          </h2>
          <button
            aria-label="Cerrar selector de mes"
            className={iconButton}
            onClick={() => dialogRef.current?.close()}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </header>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-surface p-1">
          <button
            aria-label="Año anterior"
            className={iconButton}
            onClick={() => setYear((current) => current - 1)}
            type="button"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </button>

          <span aria-live="polite" className="text-sm font-semibold tabular-nums">
            {year}
          </span>

          <button
            aria-label="Año siguiente"
            className={iconButton}
            onClick={() => setYear((current) => current + 1)}
            type="button"
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {MONTHS.map((month, index) => {
            const selected = year === date.getFullYear() && index === date.getMonth();

            return (
              <button
                aria-pressed={selected}
                className={[
                  "h-10 rounded-lg text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                  selected ? "bg-brand text-white" : "bg-surface text-text hover:bg-border/60",
                ].join(" ")}
                key={month}
                onClick={() => selectMonth(index)}
                type="button"
              >
                {month}
              </button>
            );
          })}
        </div>
      </dialog>
    </>
  );
}

import { getFirstAvailableDate } from "@/config/agenda";

import { ChevronDown, ChevronLeft, ChevronRight, LockKeyhole, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

interface MonthPickerProps {
  date: Date;
  label: string;
  onChange: (date: Date) => void;
}

const firstAvailableDate = getFirstAvailableDate();
const MIN_YEAR = firstAvailableDate.getFullYear();
const MIN_MONTH = firstAvailableDate.getMonth();

const availabilityLabel = new Intl.DateTimeFormat("es-CL", {
  month: "long",
  year: "numeric",
}).format(firstAvailableDate);

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const FULL_MONTHS = [
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
  const panelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(() => Math.max(MIN_YEAR, date.getFullYear()));

  useEffect(() => {
    if (!open) {
      return;
    }

    const selectedButton = panelRef.current?.querySelector<HTMLButtonElement>(
      'button[aria-pressed="true"]:not(:disabled)',
    );

    selectedButton?.focus();

    function handlePointerDown(event: PointerEvent): void {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function closePicker(): void {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function togglePicker(): void {
    if (!open) {
      setYear(Math.max(MIN_YEAR, date.getFullYear()));
    }

    setOpen((current) => !current);
  }

  function selectMonth(month: number): void {
    if (year < MIN_YEAR || (year === MIN_YEAR && month < MIN_MONTH)) {
      return;
    }

    onChange(new Date(year, month, 1, 12));
    closePicker();
  }

  const iconButton =
    "grid size-10 shrink-0 place-items-center rounded-md text-muted transition-colors enabled:hover:bg-surface enabled:hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:text-muted/30";

  return (
    <div
      className="relative min-w-0"
      onBlur={(event) => {
        if (
          event.relatedTarget instanceof Node &&
          !event.currentTarget.contains(event.relatedTarget)
        ) {
          setOpen(false);
        }
      }}
      ref={containerRef}
    >
      <button
        aria-controls={open ? panelId : undefined}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Cambiar mes y año. ${label}`}
        className="flex min-w-0 items-center gap-2 rounded-md text-left transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        onClick={togglePicker}
        ref={triggerRef}
        type="button"
      >
        <span className="truncate text-base font-semibold tracking-tight sm:text-xl">{label}</span>

        <ChevronDown
          aria-hidden="true"
          className={[
            "size-4 shrink-0 text-muted transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
          strokeWidth={1.75}
        />
      </button>

      {open && (
        <div
          aria-labelledby={titleId}
          className="month-picker-panel fixed inset-x-4 top-1/2 z-50 mx-auto w-auto max-w-80 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-background p-4 text-text shadow-lg md:absolute md:inset-x-auto md:top-full md:left-0 md:mt-3 md:w-72 md:max-w-none md:translate-y-0"
          id={panelId}
          ref={panelRef}
          role="dialog"
        >
          <header className="mb-3 flex items-center justify-between gap-3">
            <h3
              aria-live="polite"
              className="text-sm font-semibold tabular-nums text-brand"
              id={titleId}
            >
              {year}
            </h3>

            <div className="flex items-center">
              <button
                aria-label="Año anterior"
                className={iconButton}
                disabled={year <= MIN_YEAR}
                onClick={() => setYear((current) => Math.max(MIN_YEAR, current - 1))}
                type="button"
              >
                <ChevronLeft aria-hidden="true" className="size-4" />
              </button>

              <button
                aria-label="Año siguiente"
                className={iconButton}
                onClick={() => setYear((current) => current + 1)}
                type="button"
              >
                <ChevronRight aria-hidden="true" className="size-4" />
              </button>

              <button
                aria-label="Cerrar selector de mes"
                className={iconButton}
                onClick={closePicker}
                type="button"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
          </header>

          <div aria-label={`Meses de ${year}`} className="grid grid-cols-3 gap-1" role="group">
            {MONTHS.map((month, index) => {
              const disabled = year === MIN_YEAR && index < MIN_MONTH;
              const selected = year === date.getFullYear() && index === date.getMonth();

              return (
                <button
                  aria-label={`${FULL_MONTHS[index]} de ${year}`}
                  aria-pressed={selected}
                  className={[
                    "h-11 rounded-md text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:text-muted/35",
                    selected
                      ? "bg-brand text-white enabled:hover:bg-brand-hover"
                      : "text-text enabled:hover:bg-surface",
                  ].join(" ")}
                  disabled={disabled}
                  key={month}
                  onClick={() => selectMonth(index)}
                  type="button"
                >
                  {month}
                </button>
              );
            })}
          </div>

          <footer className="mt-3 flex items-start gap-2 border-t border-border pt-3 text-xs leading-5 text-muted">
            <LockKeyhole
              aria-hidden="true"
              className="mt-0.5 size-3.5 shrink-0"
              strokeWidth={1.75}
            />

            <span>Disponible desde {availabilityLabel}</span>
          </footer>
        </div>
      )}
    </div>
  );
}

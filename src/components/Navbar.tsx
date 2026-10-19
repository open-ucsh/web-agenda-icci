import { CalendarDays, ChevronDown, CircleHelp, X } from "lucide-react";
import { useEffect, useId, useRef } from "react";

export interface AcademicPeriod {
  id: string;
  label: string;
}

interface NavbarProps {
  periods: readonly AcademicPeriod[];
  selectedPeriod: string;
  onPeriodChange: (periodId: string) => void;
}

export function Navbar({ periods, selectedPeriod, onPeriodChange }: NavbarProps) {
  const periodId = useId();
  const helpTitleId = useId();
  const helpRef = useRef<HTMLDialogElement>(null);
  const helpButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClose(): void {
      helpButtonRef.current?.focus();
    }

    const dialog = helpRef.current;
    dialog?.addEventListener("close", handleClose);

    return () => {
      dialog?.removeEventListener("close", handleClose);
    };
  }, []);

  return (
    <header className="shrink-0 border-b border-border bg-background">
      <nav
        aria-label="Navegación principal"
        className="mx-auto flex h-16 max-w-screen-2xl items-center gap-3 px-4 sm:h-20 sm:gap-5 sm:px-6 lg:px-8"
      >
        <a
          aria-label="Open UCSH"
          className="shrink-0 rounded-md p-1 transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
          href="https://github.com/open-ucsh"
          rel="noreferrer"
          target="_blank"
        >
          <img
            alt=""
            className="size-9 object-contain sm:size-12"
            height={48}
            src={`${import.meta.env.BASE_URL}logo.png`}
            width={48}
          />
        </a>

        <span aria-hidden="true" className="h-9 w-px shrink-0 bg-border sm:h-11" />

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <CalendarDays
            aria-hidden="true"
            className="hidden size-6 shrink-0 text-brand sm:block"
            strokeWidth={1.75}
          />

          <div className="min-w-0">
            <span className="block truncate text-base font-semibold tracking-tight text-brand sm:text-xl">
              Agenda ICCI
            </span>

            <span className="hidden truncate text-sm text-muted sm:block">
              Mentorías y apoyo académico
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <div className="relative">
            <label className="sr-only" htmlFor={periodId}>
              Período académico
            </label>

            <CalendarDays
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 hidden size-4 -translate-y-1/2 text-brand sm:block"
            />

            <select
              className="h-9 max-w-36 appearance-none rounded-lg border border-border bg-background py-0 pr-8 pl-3 text-xs font-medium text-brand transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:h-10 sm:max-w-none sm:pr-9 sm:pl-10 sm:text-sm"
              id={periodId}
              onChange={(event) => onPeriodChange(event.currentTarget.value)}
              value={selectedPeriod}
            >
              {periods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.label}
                </option>
              ))}
            </select>

            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted"
            />
          </div>

          <span aria-hidden="true" className="hidden h-7 w-px bg-border sm:block" />

          <button
            aria-haspopup="dialog"
            aria-label="Ayuda de Agenda ICCI"
            className="grid size-9 shrink-0 place-items-center rounded-lg border border-border text-brand transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:size-10"
            onClick={() => helpRef.current?.showModal()}
            ref={helpButtonRef}
            title="Ayuda"
            type="button"
          >
            <CircleHelp aria-hidden="true" className="size-4.5" strokeWidth={1.75} />
          </button>
        </div>
      </nav>

      <dialog
        aria-labelledby={helpTitleId}
        className="fixed inset-0 m-auto w-80 max-w-full rounded-xl border border-border bg-background p-5 text-text shadow-xl backdrop:bg-slate-950/25"
        ref={helpRef}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-brand" id={helpTitleId}>
            Agenda ICCI
          </h2>

          <button
            aria-label="Cerrar ayuda"
            className="grid size-8 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-surface hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            onClick={() => helpRef.current?.close()}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>

        <p className="mt-3 text-sm leading-6 text-muted">
          Consulta mentorías PACE, mentorías y ayudantías de Ingeniería Civil en Computación e
          Informática.
        </p>

        <p className="mt-3 text-sm leading-6 text-muted">
          El período académico permite organizar las actividades de cada semestre.
        </p>

        <div className="mt-4 border-t border-border pt-3">
          <a
            className="inline-flex rounded-md text-sm font-medium text-brand transition-colors hover:text-brand-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            href="https://github.com/open-ucsh"
            rel="noreferrer"
            target="_blank"
          >
            Un proyecto de Open UCSH
          </a>
        </div>
      </dialog>
    </header>
  );
}

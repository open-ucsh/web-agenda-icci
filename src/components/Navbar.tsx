import { CalendarDays, ChevronDown, CircleHelp, X } from "lucide-react";
import { useId, useRef } from "react";

import { AcademicDates } from "@/components/calendar/AcademicDates";

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

  return (
    <header className="shrink-0 border-b border-border bg-background">
      <nav
        aria-label="Navegación principal"
        className="mx-auto flex max-w-screen-2xl flex-wrap items-center gap-x-4 px-4 sm:gap-x-6 sm:px-6 lg:px-8"
      >
        <div className="flex h-16 min-w-0 items-center gap-3 sm:gap-5">
          <a
            aria-label="Open UCSH en GitHub"
            className="shrink-0 rounded-md transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            href="https://github.com/open-ucsh"
            rel="noreferrer"
            target="_blank"
          >
            <img
              alt=""
              className="size-10 object-contain"
              height={40}
              src={`${import.meta.env.BASE_URL}logo.png`}
              width={40}
            />
          </a>

          <span aria-hidden="true" className="h-8 w-px bg-border" />

          <h1 className="truncate text-base font-semibold tracking-tight text-brand sm:text-lg">
            Agenda ICCI
          </h1>
        </div>

        <div
          aria-label="Secciones de la agenda"
          className="order-last flex h-11 w-full items-center gap-5 border-t border-border sm:order-0 sm:h-16 sm:w-auto sm:border-0"
          role="group"
        >
          <span
            aria-current="page"
            className="flex h-full items-center border-b-2 border-brand text-xs font-semibold text-brand sm:text-sm"
          >
            Calendario
          </span>

          <AcademicDates periodId={selectedPeriod} />
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <label className="sr-only" htmlFor={periodId}>
              Período académico
            </label>

            <CalendarDays
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 hidden size-4 -translate-y-1/2 text-brand lg:block"
              strokeWidth={1.75}
            />

            <select
              className="h-9 w-32 appearance-none rounded-md border border-border bg-background pr-8 pl-3 text-xs font-medium text-brand transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:w-48 lg:w-60 lg:pl-9 lg:text-sm"
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
              className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-muted"
            />
          </div>

          <span aria-hidden="true" className="hidden h-6 w-px bg-border sm:block" />

          <button
            aria-haspopup="dialog"
            aria-label="Ayuda de Agenda ICCI"
            className="grid size-9 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-surface hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            onClick={() => helpRef.current?.showModal()}
            ref={helpButtonRef}
            title="Ayuda"
            type="button"
          >
            <CircleHelp aria-hidden="true" className="size-5" strokeWidth={1.75} />
          </button>
        </div>
      </nav>

      <dialog
        aria-labelledby={helpTitleId}
        className="fixed inset-0 m-auto w-80 max-w-full rounded-xl border border-border bg-background p-5 text-text shadow-xl backdrop:bg-slate-950/25"
        onClose={() => helpButtonRef.current?.focus()}
        ref={helpRef}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-brand" id={helpTitleId}>
            Agenda ICCI
          </h2>

          <button
            aria-label="Cerrar ayuda"
            className="grid size-8 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-surface hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
            onClick={() => helpRef.current?.close()}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>

        <p className="mt-3 text-sm leading-6 text-muted">
          Consulta las actividades PACE, mentorías y ayudantías de Ingeniería Civil en Computación e
          Informática.
        </p>

        <p className="mt-3 text-sm leading-6 text-muted">
          Usa las flechas para cambiar de semana o selecciona el mes para ir a otra fecha. El botón
          Hoy vuelve a la semana actual.
        </p>

        <p className="mt-3 text-sm leading-6 text-muted">
          Los filtros permiten mostrar u ocultar cada tipo de apoyo. Selecciona una actividad para
          consultar sus detalles.
        </p>

        <div className="mt-4 border-t border-border pt-3">
          <a
            className="rounded text-sm font-medium text-brand transition-colors hover:text-brand-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
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

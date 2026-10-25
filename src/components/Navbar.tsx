import type { AppView } from "@/hooks/use-app-view";

import { Dialog } from "@/components/ui/Dialog";

import { CalendarDays, ChevronDown, CircleHelp, X } from "lucide-react";
import { useId, useRef } from "react";

import { AcademicDates } from "@/components/calendar/AcademicDates";

export interface AcademicPeriod {
  id: string;
  label: string;
}

interface NavbarProps {
  view: AppView;
  periods: readonly AcademicPeriod[];
  selectedPeriod: string;
  onPeriodChange: (periodId: string) => void;
}

export function Navbar({ periods, selectedPeriod, onPeriodChange, view }: NavbarProps) {
  const periodId = useId();
  const helpTitleId = useId();
  const helpRef = useRef<HTMLDialogElement>(null);
  const helpButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <header className="shrink-0 border-b border-border bg-background">
      <nav
        aria-label="Navegación principal"
        className="mx-auto grid max-w-screen-2xl grid-cols-1 px-4 sm:px-6 lg:flex lg:items-center lg:gap-6 lg:px-8"
      >
        <div className="flex h-14 min-w-0 items-center gap-3 lg:h-16">
          <a
            aria-label="Open UCSH en GitHub"
            className="shrink-0 rounded-md transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            href="https://github.com/open-ucsh"
            rel="noreferrer"
            target="_blank"
          >
            <img
              alt=""
              className="size-8 object-contain lg:size-10"
              height={40}
              src={`${import.meta.env.BASE_URL}logo.png`}
              width={40}
            />
          </a>

          <span aria-hidden="true" className="h-6 w-px bg-border" />

          <h1 className="min-w-0 truncate text-base font-semibold tracking-tight text-brand lg:text-lg">
            Agenda ICCI
          </h1>

          <div className="ml-auto lg:hidden">
            <AcademicDates periodId={selectedPeriod} />
          </div>
        </div>

        <div
          aria-label="Secciones de la agenda"
          className="order-last flex h-11 items-center gap-4 border-t border-border lg:order-none lg:h-16 lg:border-0"
          role="group"
        >
          {[
            { id: "agenda", href: "#agenda", label: "Mi agenda" },
            { id: "curriculum", href: "#malla", label: "Mi malla" },
            { id: "planner", href: "#semestre", label: "Armar semestre" },
          ].map((item) => (
            <a
              aria-current={view === item.id ? "page" : undefined}
              className={[
                "flex h-full items-center border-b-2 px-1 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                view === item.id
                  ? "border-brand font-semibold text-brand"
                  : "border-transparent text-muted hover:text-brand",
              ].join(" ")}
              href={item.href}
              key={item.id}
            >
              {item.label}
            </a>
          ))}

          <div className="hidden lg:block">
            <AcademicDates periodId={selectedPeriod} />
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2 border-t border-border py-2 lg:ml-auto lg:border-0 lg:py-0">
          <div className="relative min-w-0 flex-1 lg:flex-none">
            <label className="sr-only" htmlFor={periodId}>
              Período académico
            </label>

            <CalendarDays
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-brand"
              strokeWidth={1.75}
            />

            <select
              className="h-10 w-full appearance-none rounded-md border border-border bg-background pr-9 pl-9 text-sm font-medium text-brand transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:w-60"
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

          <button
            aria-haspopup="dialog"
            aria-label="Ayuda de Agenda ICCI"
            className="grid size-10 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-surface hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            onClick={() => helpRef.current?.showModal()}
            ref={helpButtonRef}
            type="button"
          >
            <CircleHelp aria-hidden="true" className="size-5" strokeWidth={1.75} />
          </button>
        </div>
      </nav>

      <Dialog
        aria-labelledby={helpTitleId}
        dialogRef={helpRef}
        restoreFocusRef={helpButtonRef}
        size="small"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-3">
          <h2 className="text-base font-semibold text-brand" id={helpTitleId}>
            Agenda ICCI
          </h2>

          <button
            aria-label="Cerrar ayuda"
            className="grid size-10 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-surface hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
            onClick={() => helpRef.current?.close()}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </header>

        <div className="min-h-0 space-y-3 overflow-y-auto overscroll-contain p-5 text-sm leading-6 text-muted">
          <p>
            Consulta las actividades PACE, mentorías y ayudantías de Ingeniería Civil en Computación
            e Informática.
          </p>

          <p>
            Usa las flechas para cambiar de semana o selecciona el mes para ir a otra fecha. Hoy
            vuelve a la semana actual.
          </p>

          <p>
            En móvil, selecciona un día para consultar su horario. Los números bajo cada fecha
            indican las actividades visibles.
          </p>

          <p>
            Activa o desactiva los filtros para elegir el tipo de apoyo. Selecciona una actividad
            para consultar sus detalles.
          </p>

          <a
            className="inline-block rounded font-medium text-brand hover:text-brand-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            href="https://github.com/open-ucsh"
            rel="noreferrer"
            target="_blank"
          >
            Un proyecto de Open UCSH
          </a>
        </div>
      </Dialog>
    </header>
  );
}

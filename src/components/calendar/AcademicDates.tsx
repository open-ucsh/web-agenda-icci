import { CalendarDays, X } from "lucide-react";
import { useId, useRef } from "react";

import { ACADEMIC_DATES, PERIODS } from "@/data/activities";

interface AcademicDatesProps {
  periodId: string;
}

const formatter = new Intl.DateTimeFormat("es-CL", {
  day: "numeric",
  month: "long",
});

function formatDate(value: string): string {
  return formatter.format(new Date(`${value}T12:00:00`));
}

export function AcademicDates({ periodId }: AcademicDatesProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const period = PERIODS.find((item) => item.id === periodId);
  const dates = ACADEMIC_DATES.filter((item) => item.periodId === periodId).toSorted(
    (first, second) =>
      first.startsOn.localeCompare(second.startsOn) || first.id.localeCompare(second.id),
  );

  return (
    <>
      <button
        aria-haspopup="dialog"
        className="inline-flex h-9 items-center justify-center gap-2 rounded-md px-2 text-xs font-medium text-muted transition-colors hover:bg-surface hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:px-3 sm:text-sm"
        onClick={() => dialogRef.current?.showModal()}
        ref={buttonRef}
        type="button"
      >
        <CalendarDays aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />

        <span>Fechas importantes</span>
      </button>

      <dialog
        aria-labelledby={titleId}
        className="fixed inset-0 m-auto max-h-5/6 w-lg max-w-full overflow-y-auto rounded-xl border border-border bg-background p-5 text-text shadow-xl backdrop:bg-slate-950/25 sm:p-6"
        onClose={() => buttonRef.current?.focus()}
        ref={dialogRef}
      >
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-brand" id={titleId}>
              Fechas importantes
            </h2>

            <p className="mt-1 text-sm text-muted">{period?.label ?? "Calendario académico"}</p>
          </div>

          <button
            aria-label="Cerrar fechas importantes"
            className="grid size-8 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-surface hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            onClick={() => dialogRef.current?.close()}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </header>

        {dates.length > 0 ? (
          <ol className="mt-5 divide-y divide-border">
            {dates.map((item) => (
              <li className="py-4 first:pt-0" key={item.id}>
                <p className="text-xs font-medium text-muted">
                  <time dateTime={item.startsOn}>{formatDate(item.startsOn)}</time>

                  {item.endsOn !== item.startsOn && (
                    <>
                      {" – "}
                      <time dateTime={item.endsOn}>{formatDate(item.endsOn)}</time>
                    </>
                  )}
                </p>

                <h3 className="mt-1 text-sm leading-6 text-text">{item.title}</h3>
              </li>
            ))}
          </ol>
        ) : (
          <p className="py-8 text-center text-sm text-muted">
            No hay fechas registradas para este período.
          </p>
        )}

        <footer className="mt-2 border-t border-border pt-4 text-xs leading-5 text-muted">
          Fuente: calendario académico UCSH 2026 proporcionado para esta agenda. Los períodos de
          evaluación no corresponden a fechas de pruebas específicas de cada ramo.
        </footer>
      </dialog>
    </>
  );
}

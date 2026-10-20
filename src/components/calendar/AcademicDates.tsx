import { Dialog } from "@/components/ui/Dialog";

import { dateKey, parseDateKey as parseDate } from "@/lib/dates";

import { CalendarDays, X } from "lucide-react";
import { useId, useRef, useState } from "react";

import { ACADEMIC_DATES, getSantiagoDate, PERIODS } from "@/data/activities";

interface AcademicDatesProps {
  periodId: string;
}

type AcademicDate = (typeof ACADEMIC_DATES)[number];

interface DateGroup {
  key: string;
  label: string;
  dates: AcademicDate[];
}

const shortFormatter = new Intl.DateTimeFormat("es-CL", {
  day: "numeric",
  month: "short",
});

const monthFormatter = new Intl.DateTimeFormat("es-CL", {
  month: "long",
  year: "numeric",
});

function formatShortDate(value: string): string {
  return shortFormatter.format(parseDate(value)).replace(/\./g, "");
}

function formatRange(item: AcademicDate): string {
  if (item.startsOn === item.endsOn) {
    return formatShortDate(item.startsOn);
  }

  if (item.startsOn.slice(0, 7) === item.endsOn.slice(0, 7)) {
    return `${parseDate(item.startsOn).getDate()}–${formatShortDate(item.endsOn)}`;
  }

  return `${formatShortDate(item.startsOn)} – ${formatShortDate(item.endsOn)}`;
}

function groupDates(dates: readonly AcademicDate[]): DateGroup[] {
  const groups = new Map<string, DateGroup>();

  for (const item of dates) {
    const key = item.startsOn.slice(0, 7);
    const existing = groups.get(key);

    if (existing) {
      existing.dates.push(item);
    } else {
      groups.set(key, {
        key,
        label: monthFormatter.format(parseDate(item.startsOn)),
        dates: [item],
      });
    }
  }

  return [...groups.values()];
}

export function AcademicDates({ periodId }: AcademicDatesProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [today, setToday] = useState(() => dateKey(getSantiagoDate()));

  const period = PERIODS.find((item) => item.id === periodId);

  const dates = ACADEMIC_DATES.filter((item) => item.periodId === periodId).toSorted(
    (first, second) =>
      first.startsOn.localeCompare(second.startsOn) || first.id.localeCompare(second.id),
  );

  const groups = groupDates(dates);

  const upcoming = dates.find((item) => item.startsOn >= today);
  const ongoing = dates.find((item) => item.startsOn < today && item.endsOn >= today);

  const highlighted = upcoming ?? ongoing;
  const highlightLabel = upcoming ? "Próxima fecha" : "En curso";

  function openDialog(): void {
    setToday(dateKey(getSantiagoDate()));
    dialogRef.current?.showModal();
  }

  return (
    <>
      <button
        aria-haspopup="dialog"
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md px-2 text-xs font-medium text-muted transition-colors hover:bg-surface hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:px-3 sm:text-sm"
        onClick={openDialog}
        ref={buttonRef}
        type="button"
      >
        <CalendarDays aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />

        <span>Fechas importantes</span>
      </button>

      <Dialog
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        dialogRef={dialogRef}
        restoreFocusRef={buttonRef}
        size="large"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 px-5 pt-4 pb-3 sm:px-6 sm:pt-5">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-brand sm:text-xl" id={titleId}>
              Fechas importantes
            </h2>

            <p className="mt-1 text-sm leading-5 text-muted" id={descriptionId}>
              {period?.label ?? "Calendario académico"}
            </p>
          </div>

          <button
            aria-label="Cerrar fechas importantes"
            className="grid size-10 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-surface hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            onClick={() => dialogRef.current?.close()}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </header>

        <div className="min-h-0 overflow-y-auto overscroll-contain px-5 sm:px-6">
          {highlighted && (
            <div className="mb-5 flex items-start gap-3 rounded-lg bg-brand/5 px-3 py-3 sm:px-4">
              <CalendarDays
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-brand"
                strokeWidth={1.75}
              />

              <div className="min-w-0">
                <p className="text-xs font-semibold text-brand">{highlightLabel}</p>

                <p className="mt-1 text-sm leading-6 wrap-break-word">
                  <span className="font-medium">{formatRange(highlighted)}</span>
                  <span className="text-muted"> · </span>
                  {highlighted.title}
                </p>
              </div>
            </div>
          )}

          {groups.length > 0 ? (
            <div className="space-y-5 pb-4">
              {groups.map((group) => (
                <section aria-labelledby={`${titleId}-${group.key}`} key={group.key}>
                  <h3
                    className="border-b border-border pb-2 text-xs font-medium uppercase tracking-wide text-muted"
                    id={`${titleId}-${group.key}`}
                  >
                    {group.label}
                  </h3>

                  <ol className="divide-y divide-border/70">
                    {group.dates.map((item) => {
                      const isPast = item.endsOn < today;

                      return (
                        <li
                          className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-4 sm:gap-4"
                          key={item.id}
                        >
                          <p
                            className={[
                              "text-xs font-medium leading-5 tabular-nums",
                              isPast ? "text-muted" : "text-brand",
                            ].join(" ")}
                          >
                            <time dateTime={item.startsOn}>{formatShortDate(item.startsOn)}</time>

                            {item.endsOn !== item.startsOn && (
                              <>
                                {" – "}
                                <time dateTime={item.endsOn}>{formatShortDate(item.endsOn)}</time>
                              </>
                            )}
                          </p>

                          <p
                            className={[
                              "min-w-0 text-sm leading-6 wrap-break-word sm:col-span-3",
                              isPast ? "text-muted" : "text-text",
                            ].join(" ")}
                          >
                            {item.title}
                          </p>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted">
              No hay fechas registradas para este período.
            </p>
          )}
        </div>

        <footer className="shrink-0 border-t border-border px-5 py-3 text-xs leading-5 text-muted sm:px-6">
          <p>Fuente: calendario académico UCSH 2026.</p>
          <p>Las evaluaciones de cada ramo se informan por separado.</p>
        </footer>
      </Dialog>
    </>
  );
}

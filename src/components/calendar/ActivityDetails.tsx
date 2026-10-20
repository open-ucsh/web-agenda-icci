import { CalendarDays, Clock3, MapPin, UserRound, X } from "lucide-react";
import { type RefObject, useId } from "react";

import { COURSES, type Activity } from "@/data/activities";

interface ActivityDetailsProps {
  activity: Activity | null;
  dialogRef: RefObject<HTMLDialogElement | null>;
  onClose: () => void;
}

const CATEGORIES = {
  pace: {
    label: "PACE",
    className: "bg-pace-surface text-pace",
  },
  mentoring: {
    label: "Mentoría",
    className: "bg-mentoring-surface text-mentoring",
  },
  tutoring: {
    label: "Ayudantía",
    className: "bg-tutoring-surface text-tutoring",
  },
} as const;

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function ActivityDetails({ activity, dialogRef, onClose }: ActivityDetailsProps) {
  const titleId = useId();
  const category = activity ? CATEGORIES[activity.type] : null;
  const course = activity ? COURSES.find((item) => item.id === activity.courseId) : null;

  return (
    <dialog
      aria-labelledby={titleId}
      className="agenda-dialog fixed inset-0 m-auto w-md overflow-hidden rounded-xl border border-border bg-background p-0 text-text shadow-xl backdrop:bg-slate-950/25"
      onClose={onClose}
      ref={dialogRef}
    >
      <div className="agenda-dialog-content flex flex-col">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-3">
          {category ? (
            <span
              className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-medium ${category.className}`}
            >
              <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
              {category.label}
            </span>
          ) : (
            <span />
          )}

          <button
            aria-label="Cerrar detalle"
            className="grid size-10 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-surface hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
            onClick={() => dialogRef.current?.close()}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </header>

        <div className="min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6">
          <h2
            className="text-xl font-semibold tracking-tight wrap-break-word text-brand sm:text-2xl"
            id={titleId}
          >
            {course?.name ?? activity?.title ?? "Detalle de actividad"}
          </h2>

          {activity && (
            <>
              <p className="mt-2 text-sm leading-6 text-muted">
                {activity.type === "pace"
                  ? "Apoyo académico general"
                  : `${category?.label ?? "Actividad"} de apoyo académico`}
              </p>

              <div className="mt-5 flex items-start gap-3 rounded-lg bg-surface p-4">
                <CalendarDays
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-brand"
                  strokeWidth={1.75}
                />

                <div className="min-w-0">
                  <p className="text-sm leading-6 font-medium capitalize">
                    <time dateTime={activity.date}>
                      {dateFormatter.format(new Date(`${activity.date}T12:00:00`))}
                    </time>
                  </p>

                  <p className="mt-2 flex flex-wrap items-center gap-2 text-sm tabular-nums text-muted">
                    <Clock3 aria-hidden="true" className="size-4 shrink-0" />
                    <span>
                      {activity.startTime} – {activity.endTime}
                    </span>
                  </p>
                </div>
              </div>

              <dl className="mt-5 divide-y divide-border">
                <div className="flex items-start gap-3 py-4">
                  <UserRound
                    aria-hidden="true"
                    className="mt-1 size-5 shrink-0 text-muted"
                    strokeWidth={1.75}
                  />

                  <div className="min-w-0">
                    <dt className="text-xs text-muted">Responsable</dt>
                    <dd className="mt-1 text-sm leading-6 font-medium wrap-break-word">
                      {activity.mentor}
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3 py-4">
                  <MapPin
                    aria-hidden="true"
                    className="mt-1 size-5 shrink-0 text-muted"
                    strokeWidth={1.75}
                  />

                  <div className="min-w-0">
                    <dt className="text-xs text-muted">Lugar</dt>
                    <dd className="mt-1 text-sm leading-6 font-medium wrap-break-word">
                      {activity.location}
                    </dd>
                  </div>
                </div>
              </dl>
            </>
          )}
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-border px-5 py-3">
          <span className="text-xs text-muted">Hora de Santiago</span>

          <button
            className="h-10 rounded-md bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            onClick={() => dialogRef.current?.close()}
            type="button"
          >
            Entendido
          </button>
        </footer>
      </div>
    </dialog>
  );
}

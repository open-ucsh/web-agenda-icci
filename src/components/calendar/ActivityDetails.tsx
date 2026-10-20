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
      className="fixed inset-0 m-auto max-h-5/6 w-112 max-w-full overflow-y-auto rounded-2xl border border-border bg-background p-6 text-text shadow-2xl backdrop:bg-slate-950/35"
      onClose={onClose}
      ref={dialogRef}
    >
      <header className="flex items-center justify-between gap-3">
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
          className="grid size-8 place-items-center rounded-md text-muted transition-colors hover:bg-surface hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
          onClick={() => dialogRef.current?.close()}
          type="button"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </header>

      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-brand" id={titleId}>
        {course?.name ?? activity?.title ?? "Detalle de actividad"}
      </h2>

      {activity && (
        <>
          <p className="mt-2 text-sm text-muted">
            {activity.type === "pace"
              ? "Apoyo académico general"
              : `${category?.label ?? "Actividad"} de apoyo académico`}
          </p>

          <div className="mt-5 flex items-start gap-3 rounded-xl bg-surface p-4">
            <CalendarDays
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-brand"
              strokeWidth={1.75}
            />

            <div>
              <p className="text-sm font-medium capitalize">
                <time dateTime={activity.date}>
                  {dateFormatter.format(new Date(`${activity.date}T12:00:00`))}
                </time>
              </p>

              <p className="mt-2 flex items-center gap-2 text-sm tabular-nums text-muted">
                <Clock3 aria-hidden="true" className="size-4" />
                <time dateTime={`${activity.date}T${activity.startTime}`}>
                  {activity.startTime}
                </time>
                <span>–</span>
                <time dateTime={`${activity.date}T${activity.endTime}`}>{activity.endTime}</time>
              </p>
            </div>
          </div>

          <dl className="mt-5 divide-y divide-border border-y border-border">
            <div className="flex items-start gap-3 py-4">
              <UserRound
                aria-hidden="true"
                className="mt-1 size-5 shrink-0 text-muted"
                strokeWidth={1.75}
              />
              <div>
                <dt className="text-xs text-muted">Responsable</dt>
                <dd className="mt-1 text-sm font-medium">{activity.mentor}</dd>
              </div>
            </div>

            <div className="flex items-start gap-3 py-4">
              <MapPin
                aria-hidden="true"
                className="mt-1 size-5 shrink-0 text-muted"
                strokeWidth={1.75}
              />
              <div>
                <dt className="text-xs text-muted">Lugar</dt>
                <dd className="mt-1 text-sm font-medium">{activity.location}</dd>
              </div>
            </div>
          </dl>

          <footer className="mt-5 flex items-center justify-between gap-3">
            <span className="text-xs text-muted">Hora de Santiago</span>
            <button
              className="h-9 rounded-lg bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              onClick={() => dialogRef.current?.close()}
              type="button"
            >
              Entendido
            </button>
          </footer>
        </>
      )}
    </dialog>
  );
}

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useId, useRef, useState } from "react";

import { ActivityDetails } from "@/components/calendar/ActivityDetails";
import { AgendaFilters } from "@/components/calendar/AgendaFilters";
import { MonthPicker } from "@/components/calendar/MonthPicker";
import {
  ACADEMIC_DATES,
  COURSES,
  getSantiagoDate,
  type Activity,
  type ActivityType,
} from "@/data/activities";

interface WeekCalendarProps {
  activities: readonly Activity[];
  periodId: string;
  selectedTypes: readonly ActivityType[];
  weekStart: Date;
  onTypeToggle: (type: ActivityType) => void;
  onWeekChange: (date: Date) => void;
}

const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const HOUR_HEIGHT = 88;
const MINUTES_PER_ROW = 5;

const ACTIVITY_STYLES = {
  pace: {
    label: "PACE",
    card: "border-pace/20 border-l-pace bg-pace-surface text-pace",
  },
  mentoring: {
    label: "Mentoría",
    card: "border-mentoring/20 border-l-mentoring bg-mentoring-surface text-mentoring",
  },
  tutoring: {
    label: "Ayudantía",
    card: "border-tutoring/20 border-l-tutoring bg-tutoring-surface text-tutoring",
  },
} satisfies Record<ActivityType, { label: string; card: string }>;

const monthFormatter = new Intl.DateTimeFormat("es-CL", {
  month: "long",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("es-CL", {
  day: "numeric",
  month: "short",
});

const fullDateFormatter = new Intl.DateTimeFormat("es-CL", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount, 12);
}

export function startOfWeek(date: Date): Date {
  return addDays(date, -((date.getDay() + 6) % 7));
}

const FIRST_WEEK = startOfWeek(new Date(2026, 9, 1, 12));

function dateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function timeToMinutes(time: string): number {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

function getCourseName(activity: Activity): string {
  return COURSES.find((course) => course.id === activity.courseId)?.name ?? activity.title;
}

export function WeekCalendar({
  activities,
  periodId,
  selectedTypes,
  weekStart,
  onTypeToggle,
  onWeekChange,
}: WeekCalendarProps) {
  const headingId = useId();
  const mobilePanelId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const [selectedDay, setSelectedDay] = useState(() => (getSantiagoDate().getDay() + 6) % 7);

  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  const lastDay = addDays(weekStart, 6);
  const firstKey = dateKey(weekStart);
  const lastKey = dateKey(lastDay);
  const todayKey = dateKey(getSantiagoDate());
  const selectedDate = addDays(weekStart, selectedDay);
  const selectedKey = dateKey(selectedDate);

  const weekActivities = activities
    .filter((activity) => activity.date >= firstKey && activity.date <= lastKey)
    .toSorted(
      (first, second) =>
        first.startTime.localeCompare(second.startTime) || first.id.localeCompare(second.id),
    );

  const selectedActivities = weekActivities.filter((activity) => activity.date === selectedKey);

  const visibleAcademicDates = ACADEMIC_DATES.filter(
    (item) => item.periodId === periodId && item.startsOn <= lastKey && item.endsOn >= firstKey,
  ).toSorted(
    (first, second) =>
      first.startsOn.localeCompare(second.startsOn) || first.id.localeCompare(second.id),
  );

  const startHour = Math.min(
    9,
    ...weekActivities.map((activity) => Math.floor(timeToMinutes(activity.startTime) / 60)),
  );

  const endHour = Math.max(
    18,
    ...weekActivities.map((activity) => Math.ceil(timeToMinutes(activity.endTime) / 60)),
  );

  const hourCount = endHour - startHour;
  const hours = Array.from({ length: hourCount }, (_, index) => startHour + index);
  const rowCount = (hourCount * 60) / MINUTES_PER_ROW;

  const rawMonthLabel = monthFormatter.format(addDays(weekStart, 3));
  const monthLabel = rawMonthLabel.charAt(0).toLocaleUpperCase("es") + rawMonthLabel.slice(1);

  function changeWeek(date: Date): void {
    const requestedWeek = startOfWeek(date);

    onWeekChange(requestedWeek < FIRST_WEEK ? new Date(FIRST_WEEK) : requestedWeek);
  }

  function goToToday(): void {
    const today = getSantiagoDate();

    setSelectedDay((today.getDay() + 6) % 7);
    changeWeek(today);
  }

  function goToMonth(date: Date): void {
    const firstAvailableDate = date < new Date(2026, 9, 1, 12) ? new Date(2026, 9, 1, 12) : date;

    setSelectedDay((firstAvailableDate.getDay() + 6) % 7);
    changeWeek(firstAvailableDate);
  }

  function openActivity(activity: Activity, trigger: HTMLButtonElement): void {
    triggerRef.current = trigger;
    setSelectedActivity(activity);
    dialogRef.current?.showModal();
  }

  const navigationClass =
    "grid size-10 shrink-0 place-items-center rounded-md border border-border text-muted transition-colors enabled:hover:bg-surface enabled:hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-30";

  return (
    <section aria-labelledby={headingId} className="flex min-h-0 flex-1 flex-col">
      <header className="relative z-30 flex shrink-0 flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:py-4">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 sm:justify-start sm:gap-6">
          <div className="min-w-0">
            <h2 id={headingId}>
              <MonthPicker date={addDays(weekStart, 3)} label={monthLabel} onChange={goToMonth} />
            </h2>

            <p className="mt-1 text-xs text-muted">
              {shortDateFormatter.format(weekStart)}
              {" – "}
              {shortDateFormatter.format(lastDay)}
            </p>
          </div>

          <div
            aria-label="Navegación semanal"
            className="flex shrink-0 items-center gap-1.5"
            role="group"
          >
            <button
              aria-label="Semana anterior"
              className={navigationClass}
              disabled={weekStart <= FIRST_WEEK}
              onClick={() => changeWeek(addDays(weekStart, -7))}
              type="button"
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
            </button>

            <button
              aria-label="Semana siguiente"
              className={navigationClass}
              onClick={() => changeWeek(addDays(weekStart, 7))}
              type="button"
            >
              <ChevronRight aria-hidden="true" className="size-4" />
            </button>

            <button
              className="h-10 shrink-0 rounded-md border border-border px-3 text-xs font-medium transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              onClick={goToToday}
              type="button"
            >
              Hoy
            </button>
          </div>
        </div>

        <AgendaFilters onTypeToggle={onTypeToggle} selectedTypes={selectedTypes} />
      </header>

      <div
        aria-label="Seleccionar día de la semana"
        className="mb-3 grid shrink-0 grid-cols-7 gap-1 md:hidden"
        role="group"
      >
        {days.map((day, index) => {
          const key = dateKey(day);
          const selected = index === selectedDay;
          const isToday = key === todayKey;
          const count = weekActivities.filter((activity) => activity.date === key).length;

          return (
            <button
              aria-controls={mobilePanelId}
              aria-label={`${fullDateFormatter.format(day)}. ${count} actividades${isToday ? ". Hoy" : ""}`}
              aria-pressed={selected}
              className={[
                "flex min-w-0 flex-col items-center gap-1 rounded-lg border py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                selected
                  ? "border-brand bg-brand text-white"
                  : isToday
                    ? "border-brand/25 bg-brand/5 text-brand"
                    : "border-transparent text-muted hover:bg-surface",
              ].join(" ")}
              key={key}
              onClick={() => setSelectedDay(index)}
              type="button"
            >
              <span className="text-xs">{DAY_NAMES[index]}</span>

              <time
                aria-current={isToday ? "date" : undefined}
                className="text-base font-semibold tabular-nums"
                dateTime={key}
              >
                {day.getDate()}
              </time>

              <span
                aria-hidden="true"
                className={[
                  "text-xs leading-4 tabular-nums",
                  selected ? "text-white/75" : "text-muted",
                ].join(" ")}
              >
                {count || "–"}
              </span>
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="sr-only">
        Semana del {fullDateFormatter.format(weekStart)} al {fullDateFormatter.format(lastDay)}.{" "}
        {weekActivities.length} actividades.
      </p>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-surface/50 px-3 py-2 md:hidden">
          <p
            aria-live="polite"
            className="min-w-0 text-xs font-medium capitalize"
            id={mobilePanelId}
          >
            {fullDateFormatter.format(selectedDate)}
          </p>

          <span className="shrink-0 text-xs tabular-nums text-muted">
            {selectedActivities.length} act.
          </span>
        </div>

        <div
          aria-label="Horario de actividades. Desplázate para consultar las horas."
          className="min-h-0 flex-1 overflow-auto overscroll-contain focus-visible:outline-2 focus-visible:outline-brand"
          role="region"
          tabIndex={0}
        >
          <div className="min-w-0 md:min-w-240">
            <div className="sticky top-0 z-20 border-b border-border bg-background">
              <div className="hidden md:flex">
                <div
                  aria-hidden="true"
                  className="sticky left-0 z-30 w-16 shrink-0 bg-background"
                />

                {days.map((day, index) => {
                  const key = dateKey(day);
                  const isToday = key === todayKey;

                  return (
                    <div
                      className={[
                        "flex min-w-0 flex-1 flex-col items-center gap-1 border-l border-border py-3",
                        index >= 5 ? "bg-surface" : "bg-background",
                      ].join(" ")}
                      key={key}
                    >
                      <span className="text-xs font-medium uppercase text-muted">
                        {DAY_NAMES[index]}
                      </span>

                      <time
                        aria-current={isToday ? "date" : undefined}
                        className={[
                          "grid size-8 place-items-center rounded-full text-base font-semibold tabular-nums",
                          isToday ? "bg-brand text-white" : "text-text",
                        ].join(" ")}
                        dateTime={key}
                      >
                        {day.getDate()}
                      </time>
                    </div>
                  );
                })}
              </div>

              {visibleAcademicDates.length > 0 && (
                <div className="flex md:border-t md:border-border">
                  <div className="sticky left-0 z-30 flex w-12 shrink-0 items-center justify-center bg-background px-1 py-2 md:w-16 md:px-2">
                    <span className="text-center text-xs leading-4 text-muted">Fechas clave</span>
                  </div>

                  {days.map((day, index) => {
                    const key = dateKey(day);
                    const dates = visibleAcademicDates.filter(
                      (item) => item.startsOn <= key && item.endsOn >= key,
                    );

                    return (
                      <div
                        className={[
                          "min-w-0 flex-1 space-y-1 border-l border-border p-1.5",
                          index === selectedDay ? "block" : "hidden md:block",
                          index >= 5 ? "bg-surface" : "bg-background",
                        ].join(" ")}
                        key={key}
                      >
                        {dates.map((item) => (
                          <p
                            className="rounded border border-tutoring/15 bg-tutoring-surface px-2 py-1 text-xs leading-5 text-tutoring md:truncate"
                            key={item.id}
                            title={item.title}
                          >
                            {item.title}
                          </p>
                        ))}

                        {dates.length === 0 && (
                          <span className="px-2 text-xs text-muted md:hidden">
                            Sin fechas clave este día
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex" style={{ height: hourCount * HOUR_HEIGHT }}>
              <div
                aria-hidden="true"
                className="sticky left-0 z-10 w-12 shrink-0 bg-background md:w-16"
              >
                {hours.map((hour) => (
                  <div
                    className="pr-2 pt-2 text-right text-xs tabular-nums text-muted md:pr-3"
                    key={hour}
                    style={{ height: HOUR_HEIGHT }}
                  >
                    {formatHour(hour)}
                  </div>
                ))}
              </div>

              {days.map((day, index) => {
                const key = dateKey(day);
                const dayActivities = weekActivities.filter((activity) => activity.date === key);

                return (
                  <section
                    aria-label={fullDateFormatter.format(day)}
                    className={[
                      "relative min-w-0 flex-1 border-l border-border",
                      index === selectedDay ? "block" : "hidden md:block",
                      index >= 5 ? "bg-surface/70" : "bg-background",
                    ].join(" ")}
                    key={key}
                  >
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                      {hours.map((hour) => (
                        <div
                          className="relative border-b border-border/65 last:border-b-0"
                          key={hour}
                          style={{ height: HOUR_HEIGHT }}
                        >
                          <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-border/45" />
                        </div>
                      ))}
                    </div>

                    <div
                      className="relative grid h-full grid-flow-col auto-cols-fr gap-x-1 px-1"
                      style={{
                        gridTemplateRows: `repeat(${rowCount}, minmax(0, 1fr))`,
                      }}
                    >
                      {dayActivities.map((activity) => {
                        const activityStyle = ACTIVITY_STYLES[activity.type];

                        const firstRow =
                          Math.floor(
                            (timeToMinutes(activity.startTime) - startHour * 60) / MINUTES_PER_ROW,
                          ) + 1;

                        const lastRow =
                          Math.ceil(
                            (timeToMinutes(activity.endTime) - startHour * 60) / MINUTES_PER_ROW,
                          ) + 1;

                        return (
                          <button
                            aria-haspopup="dialog"
                            aria-label={`${getCourseName(activity)}, ${activityStyle.label}, ${activity.startTime} a ${activity.endTime}, ${activity.mentor}. Ver detalles.`}
                            className={[
                              "my-1 flex min-h-0 min-w-0 flex-col overflow-hidden rounded-md border border-l-3 px-3 py-2 text-left transition-[filter] hover:brightness-95 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand md:px-2.5",
                              activityStyle.card,
                            ].join(" ")}
                            key={activity.id}
                            onClick={(event) => openActivity(activity, event.currentTarget)}
                            style={{ gridRow: `${firstRow} / ${lastRow}` }}
                            title={`${getCourseName(activity)} · ${activity.startTime}–${activity.endTime} · ${activity.mentor}`}
                            type="button"
                          >
                            <span className="block w-full shrink-0 truncate text-sm font-semibold md:text-xs">
                              {getCourseName(activity)}
                            </span>

                            <span className="mt-1 block w-full shrink-0 truncate text-xs tabular-nums opacity-90">
                              {activity.startTime} – {activity.endTime}
                            </span>

                            <span className="mt-1 block w-full shrink-0 truncate text-xs opacity-80">
                              {activity.mentor}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <p
        aria-live="polite"
        className="mt-2 shrink-0 text-center text-xs leading-5 text-muted md:hidden"
      >
        {selectedActivities.length === 0
          ? "Sin actividades este día con los filtros seleccionados."
          : "Selecciona una actividad para ver sus detalles."}
      </p>

      {weekActivities.length === 0 && (
        <p className="mt-2 hidden shrink-0 text-center text-xs text-muted md:block" role="status">
          No hay actividades esta semana con los filtros seleccionados.
        </p>
      )}

      <ActivityDetails
        activity={selectedActivity}
        dialogRef={dialogRef}
        onClose={() => {
          setSelectedActivity(null);

          if (triggerRef.current?.isConnected) {
            triggerRef.current.focus();
          }
        }}
      />
    </section>
  );
}

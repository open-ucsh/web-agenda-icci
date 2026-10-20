import { ActivityCard } from "@/components/calendar/ActivityCard";
import {
  DAY_NAMES,
  HOUR_HEIGHT,
  dayColumnClass,
  formatHour,
  fullDateFormatter,
} from "@/components/calendar/calendar-display";
import { getHoliday, type Activity, type Holiday } from "@/data/activities";
import { positionActivities } from "@/lib/calendar-layout";
import { dateKey } from "@/lib/dates";
import { timeToMinutes } from "@/lib/time";

interface CalendarAcademicDate {
  id: string;
  title: string;
  startsOn: string;
  endsOn: string;
}

interface CalendarGridProps {
  days: readonly Date[];
  selectedDay: number;
  selectedDate: Date;
  selectedHoliday: Holiday | undefined;
  selectedActivityCount: number;
  todayKey: string;
  mobilePanelId: string;
  weekActivities: readonly Activity[];
  visibleAcademicDates: readonly CalendarAcademicDate[];
  hasHolidays: boolean;
  startHour: number;
  endHour: number;
  hours: readonly number[];
  calendarHeight: number;
  onOpenActivity: (activity: Activity, trigger: HTMLButtonElement) => void;
}

export function CalendarGrid({
  days,
  selectedDay,
  selectedDate,
  selectedHoliday,
  selectedActivityCount,
  todayKey,
  mobilePanelId,
  weekActivities,
  visibleAcademicDates,
  hasHolidays,
  startHour,
  endHour,
  hours,
  calendarHeight,
  onOpenActivity,
}: CalendarGridProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-3 py-2 md:hidden">
        <p aria-live="polite" className="min-w-0 text-xs font-medium capitalize" id={mobilePanelId}>
          {fullDateFormatter.format(selectedDate)}
        </p>

        <span className="shrink-0 text-xs tabular-nums text-muted">
          {selectedHoliday ? "Feriado" : `${selectedActivityCount} act.`}
        </span>
      </div>

      <div
        aria-label="Horario de actividades. Desplázate para consultar las horas."
        className="min-h-0 flex-1 overflow-auto overscroll-contain focus-visible:outline-2 focus-visible:outline-brand"
        role="region"
        tabIndex={0}
      >
        <div className="min-w-0 md:min-w-240">
          <div className="sticky top-0 z-20 bg-background">
            <div className="hidden border-b border-border md:flex">
              <div aria-hidden="true" className="sticky left-0 z-30 w-16 shrink-0 bg-background" />

              {days.map((day, index) => {
                const key = dateKey(day);
                const isToday = key === todayKey;
                const holiday = getHoliday(key);

                return (
                  <div
                    className={[
                      dayColumnClass(index, selectedDay),
                      "border-l border-border py-3",
                      holiday || index >= 5 ? "bg-surface" : "bg-background",
                    ].join(" ")}
                    key={key}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span
                        className={[
                          "text-xs font-medium",
                          index >= 5 ? "text-muted" : "text-text",
                        ].join(" ")}
                      >
                        {DAY_NAMES[index]}
                      </span>

                      <time
                        aria-current={isToday ? "date" : undefined}
                        className={[
                          "grid size-7 place-items-center rounded-full text-sm font-semibold tabular-nums",
                          isToday ? "bg-brand text-white" : index >= 5 ? "text-muted" : "text-text",
                        ].join(" ")}
                        dateTime={key}
                      >
                        {day.getDate()}
                      </time>
                    </div>
                  </div>
                );
              })}
            </div>

            {(visibleAcademicDates.length > 0 || hasHolidays) && (
              <div className="flex border-b border-border">
                <div className="sticky left-0 z-30 flex w-12 shrink-0 items-center justify-center bg-background px-1 py-2 md:w-16">
                  <span className="text-center text-xs leading-4 text-muted">Fechas clave</span>
                </div>

                {days.map((day, index) => {
                  const key = dateKey(day);
                  const holiday = getHoliday(key);
                  const dates = visibleAcademicDates.filter(
                    (item) => item.startsOn <= key && item.endsOn >= key,
                  );

                  return (
                    <div
                      className={[
                        dayColumnClass(index, selectedDay),
                        "space-y-1 border-l border-border p-1.5",
                        holiday || index >= 5 ? "bg-surface" : "bg-background",
                      ].join(" ")}
                      key={key}
                    >
                      {holiday && (
                        <div
                          className="rounded border border-brand/10 bg-brand/5 px-2 py-1 text-xs leading-5 text-brand"
                          title={`Feriado nacional: ${holiday.name}. Sin actividades.`}
                        >
                          <p className="font-medium">Feriado nacional</p>
                          <p className="md:truncate">{holiday.name}</p>
                        </div>
                      )}

                      {dates.map((item) => (
                        <p
                          className="rounded border border-border bg-surface px-2 py-1 text-xs leading-5 text-muted md:truncate"
                          key={item.id}
                          title={item.title}
                        >
                          {item.title}
                        </p>
                      ))}

                      {!holiday && dates.length === 0 && (
                        <p className="px-2 text-xs leading-5 text-muted md:hidden">
                          Sin fechas clave este día
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex" style={{ height: calendarHeight }}>
            <div
              aria-hidden="true"
              className="sticky left-0 z-10 w-12 shrink-0 bg-background md:w-16"
            >
              {hours.map((hour) => (
                <div
                  className="pr-2 pt-1 text-right text-xs tabular-nums text-muted md:pr-3"
                  key={hour}
                  style={{ height: HOUR_HEIGHT }}
                >
                  {formatHour(hour)}
                </div>
              ))}
            </div>

            {days.map((day, index) => {
              const key = dateKey(day);
              const holiday = getHoliday(key);
              const dayActivities = weekActivities.filter((activity) => activity.date === key);
              const positioned = positionActivities(dayActivities);

              return (
                <section
                  aria-label={`${fullDateFormatter.format(day)}${
                    holiday ? `. Feriado: ${holiday.name}` : ""
                  }`}
                  className={[
                    dayColumnClass(index, selectedDay),
                    "relative border-l border-border",
                    holiday || index >= 5 ? "bg-surface/70" : "bg-background",
                  ].join(" ")}
                  key={key}
                >
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                    {hours.map((hour) => (
                      <div
                        className="relative border-b border-border/70"
                        key={hour}
                        style={{ height: HOUR_HEIGHT }}
                      >
                        <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-border/40" />
                      </div>
                    ))}
                  </div>

                  {positioned.map(({ activity, column, columns }) => {
                    const start = timeToMinutes(activity.startTime);
                    const end = timeToMinutes(activity.endTime);
                    const top = ((start - startHour * 60) / 60) * HOUR_HEIGHT;
                    const height = ((end - start) / 60) * HOUR_HEIGHT;

                    return (
                      <div
                        className="absolute px-0.5 py-0.5"
                        key={activity.id}
                        style={{
                          top,
                          height,
                          left: `${(column / columns) * 100}%`,
                          width: `${100 / columns}%`,
                        }}
                      >
                        <ActivityCard activity={activity} onOpen={onOpenActivity} />
                      </div>
                    );
                  })}
                </section>
              );
            })}
          </div>

          <div
            aria-hidden="true"
            className="h-6 pl-1 text-xs leading-6 tabular-nums text-muted md:pl-3"
          >
            {formatHour(endHour)}
          </div>
        </div>
      </div>
    </div>
  );
}

import { DAY_NAMES, fullDateFormatter } from "@/components/calendar/calendar-display";
import { getHoliday, type Activity } from "@/data/activities";
import { dateKey } from "@/lib/dates";

interface CalendarDaySelectorProps {
  days: readonly Date[];
  selectedDay: number;
  todayKey: string;
  mobilePanelId: string;
  weekActivities: readonly Activity[];
  onDayChange: (day: number) => void;
}

export function CalendarDaySelector({
  days,
  selectedDay,
  todayKey,
  mobilePanelId,
  weekActivities,
  onDayChange,
}: CalendarDaySelectorProps) {
  return (
    <div
      aria-label="Seleccionar día de la semana"
      className="mb-3 grid shrink-0 grid-cols-7 gap-1 md:hidden"
      role="group"
    >
      {days.map((day, index) => {
        const key = dateKey(day);
        const selected = index === selectedDay;
        const isToday = key === todayKey;
        const holiday = getHoliday(key);
        const count = weekActivities.filter((activity) => activity.date === key).length;

        return (
          <button
            aria-controls={mobilePanelId}
            aria-label={`${fullDateFormatter.format(day)}. ${
              holiday ? `Feriado: ${holiday.name}` : `${count} actividades`
            }${isToday ? ". Hoy" : ""}`}
            aria-pressed={selected}
            className={[
              "flex min-w-0 flex-col items-center gap-1 rounded-md border py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              selected
                ? "border-brand bg-brand text-white"
                : isToday
                  ? "border-brand/20 bg-brand/5 text-brand"
                  : "border-transparent text-muted hover:bg-surface",
            ].join(" ")}
            key={key}
            onClick={() => onDayChange(index)}
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
              {holiday ? "Fest." : count || "–"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

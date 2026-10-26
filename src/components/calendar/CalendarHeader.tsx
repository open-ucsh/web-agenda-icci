import { ChevronLeft, ChevronRight } from "lucide-react";

import { AgendaFilters } from "@/components/calendar/AgendaFilters";
import { CalendarExportActions } from "@/components/calendar/CalendarExportActions";
import { MonthPicker } from "@/components/calendar/MonthPicker";
import type { Activity, ActivityType } from "@/data/activities";
import { addDays, dateKey } from "@/lib/dates";

import styles from "./CalendarToolbar.module.css";

interface CalendarHeaderProps {
  headingId: string;
  weekStart: Date;
  lastDay: Date;
  firstWeek: Date;
  monthLabel: string;
  selectedTypes: readonly ActivityType[];
  weekActivities: readonly Activity[];
  onTypeToggle: (type: ActivityType) => void;
  changeWeek: (date: Date) => void;
  goToToday: () => void;
  goToMonth: (date: Date) => void;
}

const monthFormatter = new Intl.DateTimeFormat("es-CL", { month: "long" });
const shortFormatter = new Intl.DateTimeFormat("es-CL", {
  day: "numeric",
  month: "short",
});

function formatWeek(start: Date, end: Date): string {
  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${end.getDate()} ${monthFormatter.format(end)}`;
  }

  return `${shortFormatter.format(start)} – ${shortFormatter.format(end)}`;
}

export function CalendarHeader({
  headingId,
  weekStart,
  lastDay,
  firstWeek,
  selectedTypes,
  weekActivities,
  onTypeToggle,
  changeWeek,
  goToToday,
  goToMonth,
}: CalendarHeaderProps) {
  const yearLabel =
    weekStart.getFullYear() === lastDay.getFullYear()
      ? String(weekStart.getFullYear())
      : `${weekStart.getFullYear()}–${lastDay.getFullYear()}`;

  return (
    <header className={styles.toolbar}>
      <div aria-label="Navegación semanal" className={styles.arrows} role="group">
        <button
          aria-label="Semana anterior"
          className={styles.arrow}
          disabled={weekStart <= firstWeek}
          onClick={() => changeWeek(addDays(weekStart, -7))}
          type="button"
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <button
          aria-label="Semana siguiente"
          className={styles.arrow}
          onClick={() => changeWeek(addDays(weekStart, 7))}
          type="button"
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </div>

      <div className={styles.date}>
        <h2 id={headingId}>
          <MonthPicker
            date={addDays(weekStart, 3)}
            label={formatWeek(weekStart, lastDay)}
            onChange={goToMonth}
          />
        </h2>
        <p>{yearLabel}</p>
      </div>

      <button className={styles.today} onClick={goToToday} type="button">
        Hoy
      </button>

      <div className={styles.filters}>
        <AgendaFilters onTypeToggle={onTypeToggle} selectedTypes={selectedTypes} />
      </div>

      <div className={styles.export}>
        <CalendarExportActions
          activities={weekActivities}
          compact
          filename={`agenda-icci-semana-${dateKey(weekStart)}.ics`}
          label="Exportar actividades visibles de la semana (.ics)"
        />
      </div>
    </header>
  );
}

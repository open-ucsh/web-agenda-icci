import { ChevronLeft, ChevronRight } from "lucide-react";

import { AgendaFilters } from "@/components/calendar/AgendaFilters";
import { CalendarExportActions } from "@/components/calendar/CalendarExportActions";
import { MonthPicker } from "@/components/calendar/MonthPicker";
import type { Activity, ActivityType } from "@/data/activities";
import { addDays, dateKey } from "@/lib/dates";

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

const shortDateFormatter = new Intl.DateTimeFormat("es-CL", {
  day: "numeric",
  month: "short",
});

export function CalendarHeader({
  headingId,
  weekStart,
  lastDay,
  firstWeek,
  monthLabel,
  selectedTypes,
  weekActivities,
  onTypeToggle,
  changeWeek,
  goToToday,
  goToMonth,
}: CalendarHeaderProps) {
  const navigationClass =
    "grid size-9 shrink-0 place-items-center rounded-md border border-border text-muted transition-colors enabled:hover:bg-surface enabled:hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-30";

  return (
    <header className="relative z-30 flex shrink-0 flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
      <div className="flex min-w-0 items-center justify-between gap-2 sm:justify-start sm:gap-6">
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
            disabled={weekStart <= firstWeek}
            onClick={() => changeWeek(addDays(weekStart, -7))}
            type="button"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </button>

          <button
            className="h-9 rounded-md border border-border px-3 text-xs font-medium transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            onClick={goToToday}
            type="button"
          >
            Hoy
          </button>

          <button
            aria-label="Semana siguiente"
            className={navigationClass}
            onClick={() => changeWeek(addDays(weekStart, 7))}
            type="button"
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </button>

          <span aria-hidden="true" className="mx-1 h-4 w-px shrink-0 bg-border" />

          <CalendarExportActions
            activities={weekActivities}
            compact
            filename={`agenda-icci-semana-${dateKey(weekStart)}.ics`}
            label="Exportar actividades visibles de la semana (.ics)"
          />
        </div>
      </div>

      <AgendaFilters onTypeToggle={onTypeToggle} selectedTypes={selectedTypes} />
    </header>
  );
}

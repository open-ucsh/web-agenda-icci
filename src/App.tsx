import { useState } from "react";

import { Navbar } from "@/components/Navbar";
import { startOfWeek, WeekCalendar } from "@/components/calendar/WeekCalendar";
import {
  ACADEMIC_DATES,
  getSantiagoDate,
  getWeekActivities,
  PERIODS,
  type ActivityType,
} from "@/data/activities";

const milestoneFormatter = new Intl.DateTimeFormat("es-CL", {
  day: "numeric",
  month: "short",
});

function dateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatDate(value: string): string {
  return milestoneFormatter.format(new Date(`${value}T12:00:00`));
}

export default function App() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>(PERIODS[0]?.id ?? "");
  const [selectedTypes, setSelectedTypes] = useState<ActivityType[]>([
    "pace",
    "mentoring",
    "tutoring",
  ]);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(getSantiagoDate()));

  function toggleActivityType(type: ActivityType): void {
    setSelectedTypes((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type],
    );
  }

  const filteredActivities = getWeekActivities(weekStart, selectedPeriod).filter((activity) =>
    selectedTypes.includes(activity.type),
  );

  const weekEnd = new Date(
    weekStart.getFullYear(),
    weekStart.getMonth(),
    weekStart.getDate() + 6,
    12,
  );
  const weekStartKey = dateKey(weekStart);
  const weekEndKey = dateKey(weekEnd);

  const featuredDates = ACADEMIC_DATES.filter(
    (item) => item.periodId === selectedPeriod && item.featured === 1,
  ).toSorted((first, second) => first.startsOn.localeCompare(second.startsOn));

  const milestone =
    featuredDates.find((item) => item.endsOn >= weekStartKey && item.startsOn <= weekEndKey) ??
    featuredDates.find((item) => item.startsOn > weekEndKey);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-text">
      <Navbar
        onPeriodChange={setSelectedPeriod}
        periods={PERIODS}
        selectedPeriod={selectedPeriod}
      />

      <main
        aria-label="Agenda de apoyo académico"
        className="mx-auto flex min-h-0 w-full max-w-screen-2xl flex-1 flex-col px-4 pb-3 sm:px-6 lg:px-8"
      >
        <WeekCalendar
          activities={filteredActivities}
          onTypeToggle={toggleActivityType}
          onWeekChange={setWeekStart}
          periodId={selectedPeriod}
          selectedTypes={selectedTypes}
          weekStart={weekStart}
        />

        <footer className="flex shrink-0 items-center justify-between gap-4 pt-3 text-xs leading-5 text-muted">
          <p className="min-w-0 truncate">
            {milestone ? (
              <>
                <span className="font-medium text-text">{milestone.title}</span>
                {" · "}
                {formatDate(milestone.startsOn)}
                {milestone.endsOn !== milestone.startsOn && ` – ${formatDate(milestone.endsOn)}`}
              </>
            ) : (
              "Sin próximos hitos destacados"
            )}
          </p>

          <a
            className="shrink-0 rounded transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            href="https://github.com/open-ucsh"
            rel="noreferrer"
            target="_blank"
          >
            Open UCSH
          </a>
        </footer>
      </main>
    </div>
  );
}

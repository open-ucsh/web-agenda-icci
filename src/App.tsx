import { SemesterPlannerPage } from "@/components/curriculum/SemesterPlannerPage";
import { CurriculumView } from "@/components/curriculum/CurriculumView";
import { useAppView } from "@/hooks/use-app-view";

import { ACTIVITY_TYPES } from "@/config/activity-types";

import { useState } from "react";

import { Navbar } from "@/components/Navbar";
import { WeekCalendar } from "@/components/calendar/WeekCalendar";
import { clampWeek, getSantiagoDate } from "@/config/agenda";
import { addDays, dateKey, parseDateKey } from "@/lib/dates";
import { ACADEMIC_DATES, getWeekActivities, PERIODS, type ActivityType } from "@/data/activities";

const milestoneFormatter = new Intl.DateTimeFormat("es-CL", {
  day: "numeric",
  month: "short",
});

function formatDate(value: string): string {
  return milestoneFormatter.format(parseDateKey(value));
}

export default function App() {
  const view = useAppView();
  const [selectedPeriod, setSelectedPeriod] = useState<string>(PERIODS[0]?.id ?? "");

  const [selectedTypes, setSelectedTypes] = useState<ActivityType[]>(() => [...ACTIVITY_TYPES]);

  const [weekStart, setWeekStart] = useState(() => clampWeek(getSantiagoDate()));

  function toggleActivityType(type: ActivityType): void {
    setSelectedTypes((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type],
    );
  }

  function changeWeek(date: Date): void {
    setWeekStart(clampWeek(date));
  }

  const filteredActivities = getWeekActivities(weekStart, selectedPeriod).filter((activity) =>
    selectedTypes.includes(activity.type),
  );

  const weekEnd = addDays(weekStart, 6);

  const weekStartKey = dateKey(weekStart);
  const weekEndKey = dateKey(weekEnd);

  const featuredDates = ACADEMIC_DATES.filter(
    (item) => item.periodId === selectedPeriod && item.featured === 1,
  ).toSorted(
    (first, second) =>
      first.startsOn.localeCompare(second.startsOn) || first.id.localeCompare(second.id),
  );

  const milestone =
    featuredDates.find((item) => item.endsOn >= weekStartKey && item.startsOn <= weekEndKey) ??
    featuredDates.find((item) => item.startsOn > weekEndKey);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-text">
      <Navbar
        view={view}
        onPeriodChange={setSelectedPeriod}
        periods={PERIODS}
        selectedPeriod={selectedPeriod}
      />

      <main
        aria-label={
          view === "curriculum"
            ? "Malla curricular"
            : view === "planner"
              ? "Planificación del semestre"
              : "Agenda de apoyo académico"
        }
        className="mx-auto flex min-h-0 w-full max-w-screen-2xl flex-1 flex-col px-4 pb-3 sm:px-6 lg:px-8"
      >
        <div className={view === "agenda" ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
          <WeekCalendar
            activities={filteredActivities}
            onTypeToggle={toggleActivityType}
            onWeekChange={changeWeek}
            periodId={selectedPeriod}
            selectedTypes={selectedTypes}
            weekStart={weekStart}
          />
        </div>

        <div className={view === "curriculum" ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
          <CurriculumView />
        </div>

        <div className={view === "planner" ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
          <SemesterPlannerPage />
        </div>

        {view === "agenda" && (
          <footer className="hidden shrink-0 items-center justify-between gap-4 pt-3 text-xs leading-5 text-muted md:flex">
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
        )}
      </main>
    </div>
  );
}

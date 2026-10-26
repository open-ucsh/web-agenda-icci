import { usePersonalAgenda } from "@/hooks/use-personal-agenda";
import { useCurriculumProgress } from "@/hooks/use-curriculum-progress";
import { composeWeekAgenda, getPersonalWeekActivities } from "@/lib/personal-agenda";
import { HOLIDAYS } from "@/data/activities";
import { SemesterPlannerPage } from "@/components/curriculum/SemesterPlannerPage";
import { CurriculumView } from "@/components/curriculum/CurriculumView";
import { useAppView } from "@/hooks/use-app-view";

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
  const { markScheduleCoursesInProgress } = useCurriculumProgress();
  const {
    data: personalAgenda,
    message: agendaMessage,
    saveSchedule,
    setSelectedTypes,
  } = usePersonalAgenda();
  const selectedTypes = personalAgenda.selectedTypes;
  const [selectedPeriod, setSelectedPeriod] = useState<string>(PERIODS[0]?.id ?? "");

  const [weekStart, setWeekStart] = useState(() => clampWeek(getSantiagoDate()));

  function toggleActivityType(type: ActivityType): void {
    setSelectedTypes(
      selectedTypes.includes(type)
        ? selectedTypes.filter((item) => item !== type)
        : [...selectedTypes, type],
    );
  }

  function changeWeek(date: Date): void {
    setWeekStart(clampWeek(date));
  }

  const personalSchedule = personalAgenda.schedules.find(
    (schedule) => schedule.periodId === selectedPeriod,
  );
  const personalClasses = getPersonalWeekActivities(personalSchedule, weekStart, HOLIDAYS);
  const filteredActivities = composeWeekAgenda(
    getWeekActivities(weekStart, selectedPeriod),
    personalClasses,
    selectedTypes,
    true,
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
          {agendaMessage && (
            <p className="shrink-0 pt-3 text-xs text-amber-800" role="status">
              {agendaMessage}
            </p>
          )}

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
          <SemesterPlannerPage
            onUseSchedule={(schedule) => {
              markScheduleCoursesInProgress(schedule.entries.map((entry) => entry.courseCode));
              saveSchedule(schedule);
              setSelectedPeriod(schedule.periodId);
              const today = dateKey(getSantiagoDate());
              const target =
                today < schedule.validFrom
                  ? schedule.validFrom
                  : today > schedule.validUntil
                    ? schedule.validUntil
                    : today;
              setWeekStart(clampWeek(parseDateKey(target)));
              window.location.hash = "#agenda";
            }}
          />
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

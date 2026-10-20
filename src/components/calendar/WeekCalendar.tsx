import { getWeekCalendarModel } from "@/lib/week-calendar-model";
import { CalendarExportActions } from "@/components/calendar/CalendarExportActions";
import { dateKey } from "@/lib/dates";
import { CalendarDaySelector } from "@/components/calendar/CalendarDaySelector";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { fullDateFormatter } from "@/components/calendar/calendar-display";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { OnlineClassNotice } from "@/components/calendar/OnlineClassNotice";

import { clampWeek, getFirstAvailableDate, getSantiagoDate } from "@/config/agenda";

import { useId, useRef, useState } from "react";

import { ActivityDetails } from "@/components/calendar/ActivityDetails";
import type { Activity, ActivityType } from "@/data/activities";

interface WeekCalendarProps {
  activities: readonly Activity[];
  periodId: string;
  selectedTypes: readonly ActivityType[];
  weekStart: Date;
  onTypeToggle: (type: ActivityType) => void;
  onWeekChange: (date: Date) => void;
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

  const {
    firstWeek,
    days,
    lastDay,
    todayKey,
    selectedDate,
    selectedKey,
    selectedHoliday,
    showOnlineNotice,
    weekActivities,
    selectedActivities,
    visibleAcademicDates,
    hasHolidays,
    startHour,
    endHour,
    calendarHeight,
    hours,
    monthLabel,
  } = getWeekCalendarModel({
    activities,
    periodId,
    selectedTypes,
    weekStart,
    selectedDay,
  });

  function changeWeek(date: Date): void {
    onWeekChange(clampWeek(date));
  }

  function goToToday(): void {
    const today = getSantiagoDate();

    setSelectedDay((today.getDay() + 6) % 7);
    changeWeek(today);
  }

  function goToMonth(date: Date): void {
    const minimum = getFirstAvailableDate();
    const availableDate = date < minimum ? minimum : date;

    setSelectedDay((availableDate.getDay() + 6) % 7);
    changeWeek(availableDate);
  }

  function openActivity(activity: Activity, trigger: HTMLButtonElement): void {
    triggerRef.current = trigger;
    setSelectedActivity(activity);
    dialogRef.current?.showModal();
  }

  return (
    <section aria-labelledby={headingId} className="flex min-h-0 flex-1 flex-col">
      <CalendarHeader
        headingId={headingId}
        weekStart={weekStart}
        lastDay={lastDay}
        firstWeek={firstWeek}
        monthLabel={monthLabel}
        selectedTypes={selectedTypes}
        onTypeToggle={onTypeToggle}
        changeWeek={changeWeek}
        goToToday={goToToday}
        goToMonth={goToMonth}
      />

      <div className="mb-3 flex shrink-0 justify-end">
        <CalendarExportActions
          activities={weekActivities}
          filename={`agenda-icci-semana-${dateKey(weekStart)}.ics`}
          label="Exportar semana (.ics)"
        />
      </div>

      {showOnlineNotice && <OnlineClassNotice selectedKey={selectedKey} />}

      <CalendarDaySelector
        days={days}
        selectedDay={selectedDay}
        todayKey={todayKey}
        mobilePanelId={mobilePanelId}
        weekActivities={weekActivities}
        onDayChange={setSelectedDay}
      />

      <p aria-live="polite" className="sr-only">
        Semana del {fullDateFormatter.format(weekStart)} al {fullDateFormatter.format(lastDay)}.{" "}
        {weekActivities.length} actividades.
      </p>

      <CalendarGrid
        days={days}
        selectedDay={selectedDay}
        selectedDate={selectedDate}
        selectedHoliday={selectedHoliday}
        selectedActivityCount={selectedActivities.length}
        todayKey={todayKey}
        mobilePanelId={mobilePanelId}
        weekActivities={weekActivities}
        visibleAcademicDates={visibleAcademicDates}
        hasHolidays={hasHolidays}
        startHour={startHour}
        endHour={endHour}
        hours={hours}
        calendarHeight={calendarHeight}
        onOpenActivity={openActivity}
      />

      <p
        aria-live="polite"
        className="mt-2 shrink-0 text-center text-xs leading-5 text-muted md:hidden"
      >
        {selectedHoliday
          ? "Feriado nacional · Sin actividades."
          : selectedActivities.length === 0
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
        restoreFocusRef={triggerRef}
        onClose={() => setSelectedActivity(null)}
      />
    </section>
  );
}

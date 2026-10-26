import { getAcademicTimeRows } from "@/lib/academic-time-axis";
import { HOUR_HEIGHT } from "@/components/calendar/calendar-display";
import { AGENDA_CONFIG, getFirstAvailableWeek, getSantiagoDate } from "@/config/agenda";
import {
  ACADEMIC_DATES,
  ONLINE_CLASS_NOTICE,
  getHoliday,
  type Activity,
  type ActivityType,
} from "@/data/activities";
import { addDays, dateKey } from "@/lib/dates";
import { timeToMinutes } from "@/lib/time";

interface WeekCalendarModelInput {
  activities: readonly Activity[];
  periodId: string;
  selectedTypes: readonly ActivityType[];
  weekStart: Date;
  selectedDay: number;
  today?: Date;
}

const monthFormatter = new Intl.DateTimeFormat("es-CL", {
  month: "long",
  year: "numeric",
});

export function getWeekCalendarModel({
  activities,
  periodId,
  selectedTypes,
  weekStart,
  selectedDay,
  today = getSantiagoDate(),
}: WeekCalendarModelInput) {
  const firstWeek = getFirstAvailableWeek();

  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  const lastDay = addDays(weekStart, 6);
  const firstKey = dateKey(weekStart);
  const lastKey = dateKey(lastDay);
  const todayKey = dateKey(today);
  const selectedDate = addDays(weekStart, selectedDay);
  const selectedKey = dateKey(selectedDate);
  const selectedHoliday = getHoliday(selectedKey);

  const showOnlineNotice =
    ONLINE_CLASS_NOTICE.date >= firstKey && ONLINE_CLASS_NOTICE.date <= lastKey;

  const weekActivities = activities
    .filter(
      (activity) =>
        activity.periodId === periodId &&
        activity.date >= firstKey &&
        activity.date <= lastKey &&
        selectedTypes.includes(activity.type) &&
        !getHoliday(activity.date),
    )
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

  const hasHolidays = days.some((day) => getHoliday(dateKey(day)));

  const startHour = Math.min(
    AGENDA_CONFIG.defaultStartHour,
    ...weekActivities.map((activity) => timeToMinutes(activity.startTime) / 60),
  );

  const endHour = Math.max(
    AGENDA_CONFIG.defaultEndHour,
    ...weekActivities.map((activity) => timeToMinutes(activity.endTime) / 60),
  );

  const hourCount = endHour - startHour;
  const calendarHeight = hourCount * HOUR_HEIGHT;
  const hours = getAcademicTimeRows(startHour * 60, endHour * 60)
    .filter((row) => row.kind !== "gap")
    .map((row) => row.startMinutes / 60);

  const rawMonthLabel = monthFormatter.format(addDays(weekStart, 3));
  const monthLabel = rawMonthLabel.charAt(0).toLocaleUpperCase("es") + rawMonthLabel.slice(1);

  return {
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
  };
}

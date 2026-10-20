import { describe, expect, it } from "vite-plus/test";

import { AGENDA_CONFIG } from "@/config/agenda";
import type { Activity } from "@/data/activities";
import { dateKey, parseDateKey } from "@/lib/dates";
import { getWeekCalendarModel } from "@/lib/week-calendar-model";

function activity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: "activity",
    periodId: "test-period",
    courseId: "course",
    title: "Actividad",
    type: "tutoring",
    date: "2026-10-20",
    startTime: "10:00",
    endTime: "11:00",
    location: "Sala",
    mentor: "Profesor",
    ...overrides,
  };
}

function model(activities: readonly Activity[] = []) {
  return getWeekCalendarModel({
    activities,
    periodId: "test-period",
    selectedTypes: ["tutoring"],
    weekStart: parseDateKey("2026-10-19"),
    selectedDay: 1,
    today: parseDateKey("2026-10-20"),
  });
}

describe("getWeekCalendarModel", () => {
  it("prepara los siete días y el día seleccionado", () => {
    const result = model();

    expect(result.days.map(dateKey)).toEqual([
      "2026-10-19",
      "2026-10-20",
      "2026-10-21",
      "2026-10-22",
      "2026-10-23",
      "2026-10-24",
      "2026-10-25",
    ]);
    expect(result.selectedKey).toBe("2026-10-20");
    expect(result.todayKey).toBe("2026-10-20");
  });

  it("filtra por período, tipo y semana", () => {
    const accepted = activity();
    const result = model([
      accepted,
      activity({ id: "other-period", periodId: "other" }),
      activity({ id: "other-type", type: "pace" }),
      activity({ id: "previous-week", date: "2026-10-18" }),
      activity({ id: "next-week", date: "2026-10-26" }),
    ]);

    expect(result.weekActivities).toEqual([accepted]);
    expect(result.selectedActivities).toEqual([accepted]);
  });

  it("separa las actividades del día seleccionado", () => {
    const selected = activity();
    const anotherDay = activity({
      id: "another-day",
      date: "2026-10-21",
    });

    const result = model([selected, anotherDay]);

    expect(result.weekActivities).toHaveLength(2);
    expect(result.selectedActivities).toEqual([selected]);
  });

  it("ordena por hora e id", () => {
    const result = model([
      activity({ id: "z", startTime: "12:00", endTime: "13:00" }),
      activity({ id: "b" }),
      activity({ id: "a" }),
    ]);

    expect(result.weekActivities.map((item) => item.id)).toEqual(["a", "b", "z"]);
  });

  it("conserva el horario predeterminado sin actividades", () => {
    const result = model();

    expect(result.startHour).toBe(AGENDA_CONFIG.defaultStartHour);
    expect(result.endHour).toBe(AGENDA_CONFIG.defaultEndHour);
    expect(result.weekActivities).toEqual([]);
  });

  it("amplía el horario para incluir actividades tempranas y tardías", () => {
    const result = model([
      activity({ id: "early", startTime: "08:30", endTime: "09:30" }),
      activity({ id: "late", startTime: "19:30", endTime: "20:15" }),
    ]);

    expect(result.startHour).toBe(8);
    expect(result.endHour).toBe(21);
    expect(result.hours).toHaveLength(13);
    expect(result.hours[0]).toBe(8);
    expect(result.hours.at(-1)).toBe(20);
  });
});

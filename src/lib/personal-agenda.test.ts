import { describe, expect, it } from "vite-plus/test";

import {
  composeWeekAgenda,
  getPersonalWeekActivities,
  parsePersonalAgenda,
  type PersonalSchedule,
} from "./personal-agenda";
import { parseDateKey } from "./dates";
import type { Activity } from "@/types/activity";

const schedule: PersonalSchedule = {
  periodId: "2026-2",
  validFrom: "2026-10-01",
  validUntil: "2026-12-19",
  entries: [
    {
      id: "a",
      courseCode: "ICC201",
      title: "Cálculo I",
      weekday: 1,
      startTime: "10:00",
      endTime: "11:20",
      location: "Sala 1",
      mentor: "Docente",
    },
  ],
};

function activity(startTime: string, endTime: string): Activity {
  return {
    id: `${startTime}-${endTime}`,
    periodId: "2026-2",
    courseId: "support",
    title: "Taller",
    type: "workshop",
    date: "2026-10-05",
    startTime,
    endTime,
    location: "",
    mentor: "",
  };
}

describe("personal agenda", () => {
  it("generates classes within their validity range", () => {
    const classes = getPersonalWeekActivities(schedule, parseDateKey("2026-10-05"), []);
    expect(classes).toHaveLength(1);
    expect(classes[0]?.date).toBe("2026-10-05");
    expect(classes[0]?.type).toBe("class");
    expect(getPersonalWeekActivities(schedule, parseDateKey("2026-09-21"), [])).toEqual([]);
    expect(getPersonalWeekActivities(schedule, parseDateKey("2026-12-21"), [])).toEqual([]);
  });

  it("excludes holidays", () => {
    expect(
      getPersonalWeekActivities(schedule, parseDateKey("2026-10-05"), [
        { date: "2026-10-05", name: "Feriado", source: "test" },
      ]),
    ).toEqual([]);
  });

  it("checks conflicts even when classes are hidden", () => {
    const classes = getPersonalWeekActivities(schedule, parseDateKey("2026-10-05"), []);
    const overlapping = activity("10:30", "12:00");
    const consecutive = activity("11:20", "12:40");

    expect(composeWeekAgenda([overlapping, consecutive], classes, ["workshop"], true)).toEqual([
      consecutive,
    ]);

    expect(composeWeekAgenda([overlapping], classes, ["workshop"], false)).toEqual([overlapping]);
  });

  it("restores schedules and filter preferences", () => {
    const data = parsePersonalAgenda(
      JSON.stringify({
        version: 1,
        schedules: [schedule],
        selectedTypes: ["class", "workshop"],
        onlyFree: true,
      }),
    );
    expect(data.schedules).toEqual([schedule]);
    expect(data.selectedTypes).toEqual(["class", "workshop"]);
  });

  it("rejects malformed stored data", () => {
    expect(() => parsePersonalAgenda("{")).toThrow();
    expect(() =>
      parsePersonalAgenda(
        JSON.stringify({
          version: 1,
          schedules: [schedule, schedule],
          selectedTypes: [],
          onlyFree: false,
        }),
      ),
    ).toThrow();
    expect(() =>
      parsePersonalAgenda(
        JSON.stringify({
          version: 1,
          schedules: [],
          selectedTypes: ["unknown"],
          onlyFree: false,
        }),
      ),
    ).toThrow();
  });
});

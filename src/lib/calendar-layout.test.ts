import { describe, expect, it } from "vite-plus/test";

import type { Activity } from "@/data/activities";
import { positionActivities } from "@/lib/calendar-layout";
import { timeToMinutes } from "@/lib/time";

function activity(id: string, startTime: string, endTime: string): Activity {
  return {
    id,
    periodId: "semester",
    courseId: id,
    title: id,
    type: "tutoring",
    date: "2026-10-20",
    startTime,
    endTime,
    location: "Sala",
    mentor: "Profesor",
  };
}

function layout(activities: readonly Activity[]) {
  return positionActivities(activities).map(({ activity: item, column, columns }) => ({
    id: item.id,
    column,
    columns,
  }));
}

describe("timeToMinutes", () => {
  it.each([
    ["00:00", 0],
    ["09:30", 570],
    ["19:45", 1185],
  ])("convierte %s a minutos", (time, expected) => {
    expect(timeToMinutes(time)).toBe(expected);
  });
});

describe("positionActivities", () => {
  it("acepta un día sin actividades", () => {
    expect(positionActivities([])).toEqual([]);
  });

  it("asigna todo el ancho a actividades separadas", () => {
    expect(layout([activity("a", "09:00", "10:00"), activity("b", "11:00", "12:00")])).toEqual([
      { id: "a", column: 0, columns: 1 },
      { id: "b", column: 0, columns: 1 },
    ]);
  });

  it("considera consecutivas las actividades que se tocan", () => {
    expect(layout([activity("a", "09:00", "10:00"), activity("b", "10:00", "11:00")])).toEqual([
      { id: "a", column: 0, columns: 1 },
      { id: "b", column: 0, columns: 1 },
    ]);
  });

  it("separa actividades que comienzan a la misma hora", () => {
    expect(layout([activity("a", "09:00", "10:00"), activity("b", "09:00", "11:00")])).toEqual([
      { id: "a", column: 0, columns: 2 },
      { id: "b", column: 1, columns: 2 },
    ]);
  });

  it("separa actividades parcialmente solapadas", () => {
    expect(layout([activity("a", "09:00", "10:30"), activity("b", "10:00", "11:00")])).toEqual([
      { id: "a", column: 0, columns: 2 },
      { id: "b", column: 1, columns: 2 },
    ]);
  });

  it("separa una actividad contenida dentro de otra", () => {
    expect(layout([activity("a", "09:00", "12:00"), activity("b", "10:00", "11:00")])).toEqual([
      { id: "a", column: 0, columns: 2 },
      { id: "b", column: 1, columns: 2 },
    ]);
  });

  it("utiliza tres columnas cuando las tres actividades coinciden", () => {
    expect(
      layout([
        activity("a", "09:00", "12:00"),
        activity("b", "09:30", "11:30"),
        activity("c", "10:00", "11:00"),
      ]),
    ).toEqual([
      { id: "a", column: 0, columns: 3 },
      { id: "b", column: 1, columns: 3 },
      { id: "c", column: 2, columns: 3 },
    ]);
  });

  it("reutiliza columnas dentro de un grupo conectado", () => {
    expect(
      layout([
        activity("a", "09:00", "10:00"),
        activity("b", "09:30", "11:00"),
        activity("c", "10:00", "10:30"),
      ]),
    ).toEqual([
      { id: "a", column: 0, columns: 2 },
      { id: "b", column: 1, columns: 2 },
      { id: "c", column: 0, columns: 2 },
    ]);
  });

  it("recupera el ancho completo después de un grupo", () => {
    expect(
      layout([
        activity("a", "09:00", "10:00"),
        activity("b", "09:30", "10:30"),
        activity("c", "10:30", "11:00"),
      ]),
    ).toEqual([
      { id: "a", column: 0, columns: 2 },
      { id: "b", column: 1, columns: 2 },
      { id: "c", column: 0, columns: 1 },
    ]);
  });

  it("ordena empates por id independientemente del orden de entrada", () => {
    const first = activity("a", "09:00", "10:00");
    const second = activity("b", "09:00", "10:00");

    expect(layout([second, first])).toEqual([
      { id: "a", column: 0, columns: 2 },
      { id: "b", column: 1, columns: 2 },
    ]);
    expect(layout([second, first])).toEqual(layout([first, second]));
  });

  it("no modifica el orden ni los objetos de entrada", () => {
    const first = Object.freeze(activity("a", "09:00", "10:00"));
    const second = Object.freeze(activity("b", "10:00", "11:00"));
    const input = Object.freeze([second, first]);

    const result = positionActivities(input);

    expect(input).toEqual([second, first]);
    expect(result.map((item) => item.activity)).toEqual([first, second]);
    expect(result[0]?.activity).toBe(first);
    expect(result[1]?.activity).toBe(second);
  });

  it("mantiene las columnas dentro de sus límites y evita colisiones", () => {
    const result = positionActivities([
      activity("a", "09:00", "12:00"),
      activity("b", "09:30", "10:30"),
      activity("c", "10:00", "11:00"),
      activity("d", "10:30", "11:30"),
      activity("e", "12:00", "13:00"),
    ]);

    for (const item of result) {
      expect(item.columns).toBeGreaterThan(0);
      expect(item.column).toBeGreaterThanOrEqual(0);
      expect(item.column).toBeLessThan(item.columns);

      for (const other of result) {
        if (item.activity.id === other.activity.id) {
          continue;
        }

        const overlaps =
          timeToMinutes(item.activity.startTime) < timeToMinutes(other.activity.endTime) &&
          timeToMinutes(other.activity.startTime) < timeToMinutes(item.activity.endTime);

        if (overlaps) {
          expect(item.column).not.toBe(other.column);
          expect(item.columns).toBe(other.columns);
        }
      }
    }
  });
});

import { describe, expect, it } from "vite-plus/test";

import { buildWeekActivities } from "@/lib/activity-selectors";
import { parseDateKey } from "@/lib/dates";
import type { Holiday, WeeklyActivitySchedule } from "@/types/activity";

function schedule(overrides: Partial<WeeklyActivitySchedule> = {}): WeeklyActivitySchedule {
  return {
    id: "calculus",
    periodId: "semester",
    name: "Cálculo",
    type: "tutoring",
    weekday: 2,
    startTime: "10:00",
    endTime: "11:00",
    responsibleName: "Alejandro",
    responsibleRole: "student",
    location: "Sala 1",
    validFrom: "2026-10-01",
    validUntil: "2026-12-31",
    ...overrides,
  };
}

function build(schedules: readonly WeeklyActivitySchedule[], holidays: readonly Holiday[] = []) {
  return buildWeekActivities(schedules, holidays, parseDateKey("2026-10-19"), "semester");
}

describe("buildWeekActivities", () => {
  it("genera la fecha y un id determinista desde el horario", () => {
    const schedules = [schedule()];

    expect(build(schedules)).toEqual(build(schedules));
    expect(build(schedules)[0]).toEqual({
      id: "calculus:2026-10-20",
      periodId: "semester",
      courseId: "calculus",
      title: "Cálculo",
      type: "tutoring",
      date: "2026-10-20",
      startTime: "10:00",
      endTime: "11:00",
      location: "Sala 1",
      mentor: "Estudiante Alejandro",
    });
  });

  it("excluye horarios de otros períodos", () => {
    expect(build([schedule({ periodId: "other" })])).toEqual([]);
  });

  it("excluye actividades anteriores al inicio de vigencia", () => {
    expect(build([schedule({ validFrom: "2026-10-21" })])).toEqual([]);
  });

  it("excluye actividades posteriores al fin de vigencia", () => {
    expect(build([schedule({ validUntil: "2026-10-19" })])).toEqual([]);
  });

  it("incluye los límites de vigencia", () => {
    expect(
      build([
        schedule({
          validFrom: "2026-10-20",
          validUntil: "2026-10-20",
        }),
      ]),
    ).toHaveLength(1);
  });

  it("excluye los feriados sin excluir otros días", () => {
    const result = build(
      [schedule(), schedule({ id: "wednesday", weekday: 3 })],
      [
        {
          date: "2026-10-20",
          name: "Feriado de prueba",
          source: "test",
        },
      ],
    );

    expect(result.map((item) => item.date)).toEqual(["2026-10-21"]);
  });

  it("utiliza una ubicación predeterminada cuando es null", () => {
    expect(build([schedule({ location: null })])[0]?.location).toBe("Ubicación por confirmar");
  });

  it.each([
    ["student", "Estudiante"],
    ["professor", "Profesor"],
    ["facilitator", "Tallerista"],
  ] as const)("presenta correctamente el rol %s", (role, label) => {
    expect(build([schedule({ responsibleRole: role })])[0]?.mentor).toBe(`${label} Alejandro`);
  });

  it("permite generar actividades del domingo", () => {
    expect(build([schedule({ weekday: 7 })])[0]?.date).toBe("2026-10-25");
  });
});

import { describe, expect, it } from "vite-plus/test";

import { clampWeek, getFirstAvailableWeek, getSantiagoDate } from "@/config/agenda";
import { addDays, dateKey, parseDateKey, startOfWeek } from "@/lib/dates";

describe("fechas del calendario", () => {
  it("conserva una fecha al convertirla y formatearla", () => {
    expect(dateKey(parseDateKey("2026-10-20"))).toBe("2026-10-20");
  });

  it.each(["2026-02-30", "2026-13-01", "2026-00-01", "2026-10-00", "2026-1-01", "texto"])(
    "rechaza la fecha inválida %s",
    (value) => {
      expect(() => parseDateKey(value)).toThrow();
    },
  );

  it("acepta fechas de años bisiestos", () => {
    expect(dateKey(parseDateKey("2028-02-29"))).toBe("2028-02-29");
  });

  it.each([
    ["2026-10-19", "2026-10-19"],
    ["2026-10-20", "2026-10-19"],
    ["2026-10-25", "2026-10-19"],
    ["2027-01-01", "2026-12-28"],
  ])("obtiene el lunes de la semana de %s", (value, expected) => {
    expect(dateKey(startOfWeek(parseDateKey(value)))).toBe(expected);
  });

  it("suma días entre años sin modificar la fecha original", () => {
    const original = parseDateKey("2026-12-31");

    expect(dateKey(addDays(original, 1))).toBe("2027-01-01");
    expect(dateKey(original)).toBe("2026-12-31");
  });

  it("resta días entre meses", () => {
    expect(dateKey(addDays(parseDateKey("2026-11-01"), -1))).toBe("2026-10-31");
  });

  it("obtiene el día de Santiago durante el horario de verano", () => {
    expect(dateKey(getSantiagoDate(new Date("2026-10-20T01:00:00Z")))).toBe("2026-10-19");
  });

  it("obtiene el día de Santiago durante el horario de invierno", () => {
    expect(dateKey(getSantiagoDate(new Date("2026-07-20T03:30:00Z")))).toBe("2026-07-19");
  });

  it("calcula la primera semana disponible", () => {
    expect(dateKey(getFirstAvailableWeek())).toBe("2026-09-28");
  });

  it("limita la navegación anterior a la primera semana", () => {
    expect(dateKey(clampWeek(parseDateKey("2026-09-01")))).toBe("2026-09-28");
  });

  it("permite navegar a semanas posteriores", () => {
    expect(dateKey(clampWeek(parseDateKey("2026-10-22")))).toBe("2026-10-19");
  });
});

import { describe, expect, it } from "vite-plus/test";

import {
  formatAcademicTime,
  getAcademicTimeRange,
  getAcademicTimeRows,
} from "./academic-time-axis";

describe("academic time axis", () => {
  it("uses the six intervals from the offering report", () => {
    const rows = getAcademicTimeRows(510, 1090);
    expect(
      rows.filter((row) => row.kind === "class").map((row) => [row.startMinutes, row.endMinutes]),
    ).toEqual([
      [510, 590],
      [600, 680],
      [690, 770],
      [780, 860],
      [920, 1000],
      [1010, 1090],
    ]);
  });

  it("preserves all minutes including the midday interval", () => {
    const rows = getAcademicTimeRows(510, 1090);
    expect(rows.reduce((total, row) => total + row.endMinutes - row.startMinutes, 0)).toBe(580);
    expect(rows).toContainEqual({
      startMinutes: 860,
      endMinutes: 920,
      kind: "gap",
    });
    expect(
      rows.every((row, index) => index === 0 || rows[index - 1]?.endMinutes === row.startMinutes),
    ).toBe(true);
  });

  it("extends the axis for activities outside the academic blocks", () => {
    const range = getAcademicTimeRange([480, 690], [770, 1140]);
    expect(range).toEqual({ startMinutes: 480, endMinutes: 1140 });
    const rows = getAcademicTimeRows(range.startMinutes, range.endMinutes);
    expect(rows[0]).toEqual({ startMinutes: 480, endMinutes: 510, kind: "extra" });
    expect(rows.at(-1)).toEqual({ startMinutes: 1090, endMinutes: 1140, kind: "extra" });
  });

  it("formats half hours and non-hourly endings", () => {
    expect(formatAcademicTime(510)).toBe("08:30");
    expect(formatAcademicTime(590)).toBe("09:50");
    expect(formatAcademicTime(1090)).toBe("18:10");
  });

  it("rejects invalid ranges", () => {
    expect(() => getAcademicTimeRows(600, 510)).toThrow();
  });
});

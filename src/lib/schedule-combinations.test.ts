import { describe, expect, it } from "vite-plus/test";

import type { CourseSection } from "@/lib/course-sections";
import { generateScheduleCombinations } from "./schedule-combinations";

function section(code: string, number: string, start: number, end: number): CourseSection {
  return {
    id: `${code}-${number}`,
    code,
    section: number,
    group: "0",
    shift: "DIURNA",
    rows: [
      {
        sourceRow: 1,
        code,
        name: code,
        activity: "CÁTEDRA",
        section: number,
        group: "0",
        capacity: "10",
        rawSchedule: "",
        shift: "DIURNA",
        teachers: "",
        plan: "",
        axis: "",
        line: "",
        descriptor: "",
        blocks: [{ day: 1, startMinutes: start, endMinutes: end, room: "" }],
        scheduleIssues: [],
      },
    ],
  };
}

describe("generateScheduleCombinations", () => {
  it("returns compatible choices and permits consecutive classes", () => {
    const result = generateScheduleCombinations(
      [section("A", "1", 510, 590), section("A", "2", 600, 680), section("B", "1", 590, 670)],
      ["A", "B"],
    );

    expect(result.combinations).toHaveLength(1);
    expect(result.combinations[0]?.map((item) => item.id).toSorted()).toEqual(["A-1", "B-1"]);
  });

  it("checks assistant sessions as part of the section", () => {
    const first = section("A", "1", 510, 590);
    const row = first.rows[0];
    if (!row) throw new Error("Missing fixture row");

    const withAssistant = {
      ...first,
      rows: [
        row,
        {
          ...row,
          sourceRow: 2,
          activity: "AYUDANTÍA",
          blocks: [{ day: 2, startMinutes: 600, endMinutes: 680, room: "" }],
        },
      ],
    };
    const second = section("B", "1", 600, 680);
    const otherRow = second.rows[0];
    if (!otherRow) throw new Error("Missing fixture row");

    const result = generateScheduleCombinations(
      [
        withAssistant,
        {
          ...second,
          rows: [
            { ...otherRow, blocks: [{ day: 2, startMinutes: 650, endMinutes: 730, room: "" }] },
          ],
        },
      ],
      ["A", "B"],
    );

    expect(result.combinations).toEqual([]);
    expect(result.limited).toBe(false);
  });

  it("reports courses without usable schedules", () => {
    const first = section("A", "1", 510, 590);
    const result = generateScheduleCombinations(
      [{ ...first, rows: first.rows.map((row) => ({ ...row, scheduleIssues: ["Pendiente"] })) }],
      ["A", "B"],
    );

    expect(result.unresolvedCodes.toSorted()).toEqual(["A", "B"]);
    expect(result.excludedSections).toHaveLength(1);
    expect(result.combinations).toEqual([]);
  });

  it("bounds the number of results", () => {
    const result = generateScheduleCombinations(
      [section("A", "1", 510, 590), section("A", "2", 600, 680)],
      ["A"],
      { maximumResults: 1 },
    );

    expect(result.combinations).toHaveLength(1);
    expect(result.limited).toBe(true);
  });

  it("bounds search attempts even when no combination exists", () => {
    const result = generateScheduleCombinations(
      [section("A", "1", 510, 590), section("B", "1", 510, 590)],
      ["A", "B"],
      { maximumAttempts: 1 },
    );

    expect(result.combinations).toEqual([]);
    expect(result.limited).toBe(true);
  });

  it("does not repeat courses selected more than once", () => {
    const result = generateScheduleCombinations([section("A", "1", 510, 590)], ["A", "A"]);
    expect(result.combinations[0]).toHaveLength(1);
  });
});

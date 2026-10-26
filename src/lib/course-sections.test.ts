import { describe, expect, it } from "vite-plus/test";

import { blocksOverlap, findSectionConflicts, groupCourseSections } from "./course-sections";
import type { OfferingRow } from "@/types/course-offering";

function row(overrides: Partial<OfferingRow> = {}): OfferingRow {
  return {
    sourceRow: 1,
    code: "ICC202",
    name: "Programación",
    activity: "CÁTEDRA",
    group: "0",
    section: "1",
    capacity: "15",
    rawSchedule: "",
    shift: "DIURNA",
    teachers: "",
    plan: "",
    axis: "",
    line: "",
    descriptor: "",
    blocks: [{ day: 1, startMinutes: 510, endMinutes: 590, room: "Sala 1" }],
    scheduleIssues: [],
    ...overrides,
  };
}

describe("groupCourseSections", () => {
  it("keeps lectures and assistant sessions in the same section", () => {
    const sections = groupCourseSections([
      row(),
      row({ sourceRow: 2, activity: "AYUDANTÍA" }),
      row({ sourceRow: 3, section: "2" }),
    ]);
    expect(sections).toHaveLength(2);
    expect(sections[0]?.rows).toHaveLength(2);
  });

  it("keeps different groups and shifts separate", () => {
    expect(
      groupCourseSections([row(), row({ group: "1" }), row({ shift: "VESPERTINA" })]),
    ).toHaveLength(3);
  });
});

describe("schedule conflicts", () => {
  it("allows consecutive classes and different days", () => {
    const first = { day: 1, startMinutes: 510, endMinutes: 590, room: "" };
    expect(blocksOverlap(first, { ...first, startMinutes: 590, endMinutes: 670 })).toBe(false);
    expect(blocksOverlap(first, { ...first, day: 2 })).toBe(false);
  });

  it("detects overlaps in assistant sessions too", () => {
    const sections = groupCourseSections([
      row(),
      row({
        sourceRow: 2,
        activity: "AYUDANTÍA",
        blocks: [{ day: 2, startMinutes: 600, endMinutes: 680, room: "" }],
      }),
      row({
        sourceRow: 3,
        code: "ICC203",
        blocks: [{ day: 2, startMinutes: 650, endMinutes: 730, room: "" }],
      }),
    ]);
    const conflicts = findSectionConflicts(sections);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]?.startMinutes).toBe(650);
    expect(conflicts[0]?.endMinutes).toBe(680);
  });
});

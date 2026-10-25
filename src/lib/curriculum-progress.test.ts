import { describe, expect, it } from "vite-plus/test";

import {
  getApprovedCredits,
  getCourseDisplayStatus,
  getCourseRequirements,
  getDependentCourses,
  parseCurriculumProgress,
  updateCourseProgress,
} from "@/lib/curriculum-progress";
import type { CurriculumCourse } from "@/types/curriculum";
import type { CurriculumProgress } from "@/types/curriculum-progress";

function course(code: string, overrides: Partial<CurriculumCourse> = {}): CurriculumCourse {
  return {
    code,
    name: code,
    credits: 6,
    semester: 1,
    kind: "required",
    prerequisites: [],
    minimumCredits: 0,
    ...overrides,
  };
}

const algebra = course("A");
const calculus = course("B", { semester: 2, prerequisites: ["A"] });
const advanced = course("C", { semester: 3, prerequisites: ["B"] });
const independent = course("D");
const courses = [algebra, calculus, advanced, independent];

describe("avance curricular", () => {
  it("solo suma los créditos aprobados", () => {
    expect(
      getApprovedCredits(courses, {
        A: "approved",
        B: "failed",
        C: "in-progress",
      }),
    ).toBe(6);
  });

  it("calcula disponibilidad desde prerrequisitos aprobados", () => {
    expect(getCourseDisplayStatus(algebra, courses, {})).toBe("available");
    expect(getCourseDisplayStatus(calculus, courses, {})).toBe("blocked");

    expect(getCourseDisplayStatus(calculus, courses, { A: "in-progress" })).toBe("blocked");

    expect(getCourseDisplayStatus(calculus, courses, { A: "approved" })).toBe("available");
  });

  it("bloquea la continuidad sin afectar ramos independientes", () => {
    const progress = { A: "failed" } satisfies CurriculumProgress;

    expect(getCourseDisplayStatus(calculus, courses, progress)).toBe("blocked");
    expect(getCourseDisplayStatus(advanced, courses, progress)).toBe("blocked");
    expect(getCourseDisplayStatus(independent, courses, progress)).toBe("available");
  });

  it("conserva aprobaciones históricas al cambiar un prerrequisito", () => {
    const progress = updateCourseProgress({ A: "approved", B: "approved" }, "A", "failed");

    expect(progress.B).toBe("approved");
    expect(getCourseDisplayStatus(calculus, courses, progress)).toBe("approved");
  });

  it("actualiza estados sin modificar el objeto original", () => {
    const original = { A: "failed" } satisfies CurriculumProgress;
    const approved = updateCourseProgress(original, "A", "approved");
    const pending = updateCourseProgress(approved, "A", null);

    expect(original.A).toBe("failed");
    expect(approved.A).toBe("approved");
    expect(pending.A).toBeUndefined();
  });

  it("excluye los créditos del propio ramo de sus requisitos", () => {
    const practice = course("P", { minimumCredits: 12 });
    const plan = [...courses, practice];

    expect(
      getCourseRequirements(practice, plan, { A: "approved", P: "approved" }).missingCredits,
    ).toBe(6);

    expect(getCourseRequirements(practice, plan, { A: "approved", B: "approved" }).eligible).toBe(
      true,
    );
  });

  it("exige todos los prerrequisitos", () => {
    const target = course("T", { prerequisites: ["A", "D"] });

    expect(
      getCourseRequirements(target, [...courses, target], { A: "approved" }).missingPrerequisites,
    ).toEqual(["D"]);
  });

  it("encuentra dependencias transitivas sin repetirse en ciclos", () => {
    expect(getDependentCourses(courses, "A").map((item) => item.code)).toEqual(["B", "C"]);

    const cyclic = [course("X", { prerequisites: ["Y"] }), course("Y", { prerequisites: ["X"] })];

    expect(getDependentCourses(cyclic, "X").map((item) => item.code)).toEqual(["Y"]);
  });
});

describe("persistencia del avance", () => {
  it("acepta la ausencia de datos", () => {
    expect(parseCurriculumProgress(null, courses)).toEqual({});
  });

  it("recupera estados válidos e ignora datos desconocidos", () => {
    const serialized = JSON.stringify({
      version: 1,
      progress: {
        A: "approved",
        B: "failed",
        C: "in-progress",
        D: "invalid",
        unknown: "approved",
      },
    });

    expect(parseCurriculumProgress(serialized, courses)).toEqual({
      A: "approved",
      B: "failed",
      C: "in-progress",
    });
  });

  it.each([
    "invalid json",
    "null",
    "[]",
    '{"version":2,"progress":{}}',
    '{"version":1,"progress":[]}',
  ])("rechaza datos incompatibles: %s", (serialized) => {
    expect(() => parseCurriculumProgress(serialized, courses)).toThrow();
  });
});

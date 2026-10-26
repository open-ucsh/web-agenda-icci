import { describe, expect, it } from "vite-plus/test";

import { CURRICULUM_COURSES } from "@/data/curriculum";
import { filterCurriculumCourses, getCurriculumCredits } from "@/lib/curriculum";

describe("malla ICCI 2023", () => {
  it("contiene 67 códigos únicos y 360 SCT", () => {
    expect(CURRICULUM_COURSES).toHaveLength(67);
    expect(new Set(CURRICULUM_COURSES.map((course) => course.code)).size).toBe(67);
    expect(getCurriculumCredits(CURRICULUM_COURSES)).toBe(360);
  });

  it.each(Array.from({ length: 12 }, (_, index) => index + 1))(
    "el semestre %i suma 30 SCT",
    (semester) => {
      const courses = CURRICULUM_COURSES.filter((course) => course.semester === semester);

      expect(getCurriculumCredits(courses)).toBe(30);
    },
  );

  it("los prerrequisitos existen en niveles anteriores", () => {
    const coursesByCode = new Map(CURRICULUM_COURSES.map((course) => [course.code, course]));

    for (const course of CURRICULUM_COURSES) {
      for (const code of course.prerequisites) {
        const prerequisite = coursesByCode.get(code);

        expect(prerequisite).toBeDefined();
        expect(prerequisite?.semester).toBeLessThan(course.semester);
      }
    }
  });

  it("busca sin distinguir tildes o mayúsculas", () => {
    const result = filterCurriculumCourses(CURRICULUM_COURSES, {
      query: "CALCULO",
      year: null,
      kind: "all",
    });

    expect(result.map((course) => course.code)).toEqual(["ICC201", "ICC301"]);
  });

  it("combina código y nombre", () => {
    const result = filterCurriculumCourses(CURRICULUM_COURSES, {
      query: "ICC201 calculo",
      year: null,
      kind: "all",
    });

    expect(result.map((course) => course.code)).toEqual(["ICC201"]);
  });

  it("combina filtros de año y tipo", () => {
    const result = filterCurriculumCourses(CURRICULUM_COURSES, {
      query: "",
      year: 4,
      kind: "elective",
    });

    expect(result.map((course) => course.code)).toEqual(["ICC801"]);
  });

  it("conserva los requisitos de créditos", () => {
    expect(
      CURRICULUM_COURSES.filter((course) => course.minimumCredits > 0).map((course) => [
        course.code,
        course.minimumCredits,
      ]),
    ).toEqual([
      ["ICC604", 120],
      ["ICC013", 330],
      ["ICC014", 330],
    ]);
  });
});

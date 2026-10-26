import { describe, expect, it } from "vite-plus/test";

import { evaluateSemesterPlan } from "@/lib/semester-plan";
import type { CurriculumCourse } from "@/types/curriculum";

function course(
  code: string,
  semester: number,
  credits: number,
  prerequisites: readonly string[] = [],
): CurriculumCourse {
  return {
    code,
    name: code,
    semester,
    credits,
    prerequisites,
    minimumCredits: 0,
    kind: "required",
  };
}

const courses = [course("A", 1, 6), course("B", 2, 6), course("C", 3, 20), course("D", 4, 20)];

const base = {
  courses,
  progress: {},
  selectedCodes: [],
  offerings: {},
  minimumException: "none",
} as const;

describe("planificación según artículos 12 y 13", () => {
  it("no infiere un máximo antes de aprobar todo el primer año", () => {
    const result = evaluateSemesterPlan({
      ...base,
      progress: { A: "approved" },
    });

    expect(result.maximumCredits).toBeNull();
    expect(result.notices.some((message) => message.includes("máximo"))).toBe(true);
  });

  it("aplica 36 SCT tras aprobar el primer año", () => {
    const result = evaluateSemesterPlan({
      ...base,
      progress: { A: "approved", B: "approved" },
      selectedCodes: ["C", "D"],
    });

    expect(result.maximumCredits).toBe(36);
    expect(result.errors.some((message) => message.includes("36 SCT"))).toBe(true);
  });

  it("comprueba el mínimo y permite declarar una excepción", () => {
    expect(evaluateSemesterPlan({ ...base, selectedCodes: ["A"] }).errors).toContain(
      "Artículo 12: la carga es inferior al mínimo de 12 SCT.",
    );

    const result = evaluateSemesterPlan({
      ...base,
      selectedCodes: ["A"],
      minimumException: "last-semester",
    });

    expect(result.errors).not.toContain("Artículo 12: la carga es inferior al mínimo de 12 SCT.");
    expect(result.notices.some((message) => message.includes("excepción"))).toBe(true);
  });

  it("no cuenta aprobaciones ni repite créditos del mismo código", () => {
    const result = evaluateSemesterPlan({
      ...base,
      progress: { A: "approved", B: "approved" },
      selectedCodes: ["C", "C"],
    });

    expect(result.credits).toBe(20);
  });

  it("no usa los ramos seleccionados para satisfacer prerrequisitos", () => {
    const result = evaluateSemesterPlan({
      ...base,
      courses: [...courses, course("E", 3, 6, ["A"])],
      selectedCodes: ["A", "E"],
    });

    expect(result.errors.some((message) => message.startsWith("E:"))).toBe(true);
  });

  it("prioriza reprobados de niveles inferiores y distingue su oferta", () => {
    const result = evaluateSemesterPlan({
      ...base,
      progress: { D: "failed", A: "failed" },
      selectedCodes: ["C"],
      offerings: { A: "offered", D: "unavailable" },
    });

    expect(result.overdue.map((item) => item.code)).toEqual(["A", "D"]);
    expect(result.notices.some((message) => message.includes("A."))).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("no trata la oferta desconocida como confirmada", () => {
    const result = evaluateSemesterPlan({
      ...base,
      selectedCodes: ["C"],
    });

    expect(result.notices).toContain("Falta confirmar la oferta de 1 ramos seleccionados.");
  });

  it("detecta ramos aprobados y oferta no disponible en el borrador", () => {
    const result = evaluateSemesterPlan({
      ...base,
      progress: { A: "approved" },
      selectedCodes: ["A", "C"],
      offerings: { C: "unavailable" },
    });

    expect(result.errors).toContain("A: ya está aprobado.");
    expect(result.errors).toContain("C: lo marcaste como no ofertado.");
  });
});

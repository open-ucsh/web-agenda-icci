import { describe, expect, it } from "vite-plus/test";

import { formatResponsibleNames } from "./responsible-names";

describe("formatResponsibleNames", () => {
  it("normalizes mixed capitalization and preserves accents", () => {
    expect(formatResponsibleNames("Correa Pimentel CÉSar Enrique;")).toBe(
      "Correa Pimentel César Enrique",
    );
    expect(formatResponsibleNames("Rosales Saenz JosÉ Alberto;")).toBe(
      "Rosales Saenz José Alberto",
    );
  });

  it("separates multiple teachers and removes duplicates", () => {
    expect(formatResponsibleNames("ANA PÉREZ; JUAN MUÑOZ;; ana pérez;")).toBe(
      "Ana Pérez, Juan Muñoz",
    );
  });

  it("respects surname particles and compound names", () => {
    expect(formatResponsibleNames("MARÍA-JOSÉ DE LA CRUZ;")).toBe("María-José de la Cruz");
  });

  it("normalizes whitespace without guessing missing accents", () => {
    expect(formatResponsibleNames("  CESAR   ENRIQUE  ;")).toBe("Cesar Enrique");
    expect(formatResponsibleNames(" ; ; ")).toBe("");
  });
});

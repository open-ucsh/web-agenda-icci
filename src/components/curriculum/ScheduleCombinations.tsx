import { useState } from "react";

import type { CourseSection } from "@/lib/course-sections";
import { generateScheduleCombinations } from "@/lib/schedule-combinations";

interface ScheduleCombinationsProps {
  sections: readonly CourseSection[];
  selectedCodes: readonly string[];
  onApply: (sections: readonly CourseSection[]) => void;
}

type SearchResult = ReturnType<typeof generateScheduleCombinations>;

export function ScheduleCombinations({
  sections,
  selectedCodes,
  onApply,
}: ScheduleCombinationsProps) {
  const [result, setResult] = useState<SearchResult | null>(null);
  const [appliedIndex, setAppliedIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3 border-t border-border pt-4">
      <button
        className="rounded-md bg-brand px-3 py-2 text-xs font-medium text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        disabled={selectedCodes.length === 0}
        onClick={() => {
          setAppliedIndex(null);
          setResult(generateScheduleCombinations(sections, selectedCodes));
        }}
        type="button"
      >
        Generar combinaciones sin topes
      </button>

      <p className="text-xs leading-5 text-muted">
        Explora las secciones del reporte para todos los ramos del borrador. La búsqueda considera
        cátedras y ayudantías y genera hasta 100 opciones.
      </p>

      {result && (
        <>
          <div aria-live="polite" className="space-y-2 text-xs leading-5">
            {result.unresolvedCodes.length > 0 && (
              <p className="text-amber-900">
                No se puede completar el horario: faltan secciones con horarios completos y
                compatibles internamente para {result.unresolvedCodes.join(", ")}.
              </p>
            )}

            {result.excludedSections.length > 0 && (
              <p className="text-amber-900">
                Se excluyeron {result.excludedSections.length} secciones por información pendiente o
                cruces dentro de su propio horario.
              </p>
            )}

            {result.limited && (
              <p className="text-amber-900">
                La búsqueda alcanzó su límite de resultados o intentos. Los resultados son parciales
                y no representan todas las combinaciones posibles.
              </p>
            )}

            {result.unresolvedCodes.length === 0 && (
              <p className="text-muted">
                {result.combinations.length > 0
                  ? `${result.combinations.length} combinaciones encontradas.`
                  : result.limited
                    ? "No se encontró una combinación dentro del límite de búsqueda."
                    : "No existen combinaciones sin topes entre las secciones evaluadas."}
              </p>
            )}
          </div>

          {result.combinations.length > 0 && (
            <ol className="max-h-72 divide-y divide-border overflow-auto rounded-md border border-border">
              {result.combinations.map((combination, index) => (
                <li
                  className="flex items-center justify-between gap-3 p-3"
                  key={JSON.stringify(combination.map((section) => section.id))}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium">Opción {index + 1}</p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      {combination
                        .map(
                          (section) =>
                            `${section.code}: sección ${section.section}, grupo ${section.group || "pendiente"}, ${section.shift || "jornada pendiente"}`,
                        )
                        .join(" · ")}
                    </p>
                  </div>

                  <button
                    aria-label={`Aplicar opción ${index + 1}`}
                    className="shrink-0 rounded-md border border-border px-3 py-2 text-xs font-medium text-brand hover:bg-surface focus-visible:outline-2 focus-visible:outline-brand"
                    onClick={() => {
                      onApply(combination);
                      setAppliedIndex(index);
                    }}
                    type="button"
                  >
                    Aplicar
                  </button>
                </li>
              ))}
            </ol>
          )}

          <p aria-live="polite" className="text-xs text-muted">
            {appliedIndex !== null &&
              `Opción ${appliedIndex + 1} aplicada al selector de secciones.`}
          </p>
        </>
      )}
    </div>
  );
}

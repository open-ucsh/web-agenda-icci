import { useId, useState } from "react";

import { ScheduleCombinations } from "@/components/curriculum/ScheduleCombinations";
import { CURRICULUM_COURSES } from "@/data/curriculum";
import { findSectionConflicts, groupCourseSections } from "@/lib/course-sections";
import type { CourseOfferingReport } from "@/types/course-offering";

interface CourseSectionPickerProps {
  report: CourseOfferingReport;
  selectedCodes: readonly string[];
}

const DAYS = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function formatTime(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

export function CourseSectionPicker({ report, selectedCodes }: CourseSectionPickerProps) {
  const id = useId();
  const [choices, setChoices] = useState<Readonly<Record<string, string>>>({});
  const sections = groupCourseSections(report.rows);
  const codes = [...new Set(selectedCodes)];
  const selected = sections.filter(
    (section) => codes.includes(section.code) && choices[section.code] === section.id,
  );
  const conflicts = findSectionConflicts(selected);
  const incomplete = selected.filter((section) =>
    section.rows.some((row) => row.scheduleIssues.length > 0),
  );

  return (
    <section aria-labelledby={`${id}-title`} className="space-y-4 border-t border-border pt-4">
      <div>
        <h4 className="text-sm font-semibold text-brand" id={`${id}-title`}>
          Secciones de tu borrador
        </h4>
        <p className="mt-1 text-xs leading-5 text-muted">
          Cada opción reúne las filas con el mismo código, sección, grupo y jornada, incluyendo sus
          cátedras y ayudantías.
        </p>
      </div>

      {codes.length === 0 && (
        <p className="text-xs text-muted">
          Marca ramos en el borrador para elegir sus secciones aquí.
        </p>
      )}

      {codes.map((code) => {
        const options = sections.filter((section) => section.code === code);
        const name = CURRICULUM_COURSES.find((course) => course.code === code)?.name ?? code;

        return (
          <fieldset className="space-y-2" key={code}>
            <legend className="mb-2 text-sm font-medium">
              {name} <span className="text-xs font-normal text-muted">{code}</span>
            </legend>

            {options.length === 0 ? (
              <p className="text-xs leading-5 text-amber-900">
                Este código no aparece en el reporte. Confirma su oferta con la carrera.
              </p>
            ) : (
              <select
                aria-label={`Sección de ${name}`}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-brand"
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  setChoices((current) => ({ ...current, [code]: value }));
                }}
                value={choices[code] ?? ""}
              >
                <option value="">Elegir sección</option>
                {options.map((section) => (
                  <option key={section.id} value={section.id}>
                    Sección {section.section || "pendiente"} · Grupo {section.group || "pendiente"}{" "}
                    · {section.shift || "Jornada pendiente"}
                  </option>
                ))}
              </select>
            )}

            {options
              .filter((section) => section.id === choices[code])
              .map((section) => (
                <ul className="space-y-2 border-l-2 border-brand/20 pl-3 text-xs" key={section.id}>
                  {section.rows.map((row) => (
                    <li className="space-y-1" key={row.sourceRow}>
                      <p className="font-medium">{row.activity || "Actividad por confirmar"}</p>
                      <p className="leading-5 text-muted">{row.rawSchedule || "Sin horario"}</p>
                      <p className="text-muted">
                        {row.teachers || "Docente por confirmar"} · Cupos:{" "}
                        {row.capacity || "por confirmar"}
                      </p>
                      {row.scheduleIssues.map((issue) => (
                        <p className="text-amber-900" key={issue}>
                          {issue}
                        </p>
                      ))}
                    </li>
                  ))}
                </ul>
              ))}
          </fieldset>
        );
      })}

      <ScheduleCombinations
        key={JSON.stringify([...codes].sort())}
        sections={sections}
        selectedCodes={codes}
        onApply={(combination) => {
          setChoices((current) => ({
            ...current,
            ...Object.fromEntries(combination.map((section) => [section.code, section.id])),
          }));
        }}
      />

      {codes.length > 0 && (
        <div aria-live="polite" className="space-y-2 border-t border-border pt-3 text-xs leading-5">
          <p className="text-muted">
            {selected.length} de {codes.length} ramos con sección elegida.
          </p>

          {conflicts.map((conflict) => (
            <p
              className="text-rose-800"
              key={JSON.stringify([
                conflict.first.id,
                conflict.second.id,
                conflict.day,
                conflict.startMinutes,
                conflict.endMinutes,
              ])}
            >
              Tope entre {conflict.first.code} (sección {conflict.first.section}) y{" "}
              {conflict.second.code} (sección {conflict.second.section}): {DAYS[conflict.day]}{" "}
              {formatTime(conflict.startMinutes)}–{formatTime(conflict.endMinutes)}.
            </p>
          ))}

          {incomplete.length > 0 && (
            <p className="text-amber-900">
              Hay secciones con información pendiente. La revisión de topes está incompleta.
            </p>
          )}

          {selected.length === codes.length &&
            conflicts.length === 0 &&
            incomplete.length === 0 && (
              <p className="text-emerald-800">
                No se detectaron topes entre las secciones elegidas.
              </p>
            )}
        </div>
      )}
    </section>
  );
}

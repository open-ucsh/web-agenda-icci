import { useId, useRef, useState } from "react";

import { decodeOfferingFile, parseCourseOfferingReport } from "@/lib/course-offering-import";
import type { CourseOfferingReport } from "@/types/course-offering";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export function CourseOfferingImport() {
  const id = useId();
  const requestRef = useRef(0);
  const [report, setReport] = useState<CourseOfferingReport | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function importFile(file: File): Promise<void> {
    const request = ++requestRef.current;
    setError("");
    setLoading(true);

    try {
      if (file.size > MAX_FILE_BYTES) {
        throw new Error("El archivo supera el máximo de 5 MB.");
      }

      const buffer = await file.arrayBuffer();
      const nextReport = parseCourseOfferingReport(decodeOfferingFile(buffer));

      if (request !== requestRef.current) return;

      setReport(nextReport);
      setFileName(file.name);
    } catch (cause) {
      if (request !== requestRef.current) return;

      setError(cause instanceof Error ? cause.message : "No se pudo leer el archivo.");
    } finally {
      if (request === requestRef.current) setLoading(false);
    }
  }

  const courseCount = new Set(report?.rows.map((row) => row.code)).size;
  const sectionCount = new Set(
    report?.rows.filter((row) => row.section).map((row) => `${row.code}:${row.section}`),
  ).size;
  const pendingCount = report?.rows.filter((row) => row.scheduleIssues.length > 0).length ?? 0;

  return (
    <section aria-labelledby={`${id}-title`} className="space-y-3 border-b border-border pb-5">
      <div>
        <h3 className="text-sm font-semibold text-brand" id={`${id}-title`}>
          Oferta académica
        </h3>
        <p className="mt-1 text-xs leading-5 text-muted" id={`${id}-help`}>
          Importa el reporte .xls de la universidad para revisar sus secciones y horarios. El
          archivo se procesa en tu navegador.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium" htmlFor={`${id}-file`}>
          Reporte de asignaturas
        </label>
        <input
          accept=".xls,.html,.htm"
          aria-describedby={`${id}-help`}
          className="block w-full text-xs text-muted file:mr-3 file:cursor-pointer file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-2 file:text-xs file:font-medium file:text-brand hover:file:bg-surface focus-visible:outline-2 focus-visible:outline-brand"
          id={`${id}-file`}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = "";
            if (file) void importFile(file);
          }}
          type="file"
        />
      </div>

      <p aria-live="polite" className="text-xs text-muted">
        {loading
          ? "Leyendo reporte…"
          : report
            ? `${fileName}: ${courseCount} ramos, ${sectionCount} secciones y ${report.rows.length} filas.`
            : "Todavía no has importado una oferta."}
      </p>

      {error && (
        <p className="text-xs leading-5 text-rose-800" role="alert">
          {error}
          {report && " Se conserva la oferta importada anteriormente."}
        </p>
      )}

      {report && (
        <>
          <div className="space-y-1 text-xs text-muted">
            {report.program && <p>{report.program}</p>}
            {report.period && <p>{report.period}</p>}
          </div>

          {pendingCount > 0 && (
            <p className="text-xs leading-5 text-amber-900">
              {pendingCount} filas necesitan revisión de sección u horario. No se considerarán
              automáticamente como tiempo libre al generar combinaciones.
            </p>
          )}

          {report.issues.length > 0 && (
            <details className="text-xs text-amber-900">
              <summary className="cursor-pointer">
                Revisar {report.issues.length} filas omitidas
              </summary>
              <ul className="mt-2 space-y-1">
                {report.issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </details>
          )}

          <details className="text-xs">
            <summary className="cursor-pointer font-medium text-brand">
              Ver oferta importada
            </summary>
            <div className="mt-3 max-h-80 overflow-auto rounded-md border border-border">
              <table className="w-full min-w-180 text-left text-xs">
                <caption className="sr-only">Filas del reporte académico importado</caption>
                <thead className="sticky top-0 bg-surface text-muted">
                  <tr>
                    {[
                      "Ramo",
                      "Sección / grupo",
                      "Función",
                      "Horario y sala",
                      "Docente",
                      "Cupos",
                    ].map((label) => (
                      <th className="px-3 py-2 font-medium" key={label} scope="col">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {report.rows.map((row) => (
                    <tr key={row.sourceRow}>
                      <td className="px-3 py-3 align-top">
                        <span className="block font-medium">{row.name}</span>
                        <span className="text-muted">{row.code}</span>
                      </td>
                      <td className="px-3 py-3 align-top">
                        {row.section || "Sin sección"} / {row.group || "Sin grupo"}
                      </td>
                      <td className="px-3 py-3 align-top">{row.activity || "Por confirmar"}</td>
                      <td className="min-w-56 px-3 py-3 align-top">
                        <p>{row.rawSchedule || "Sin horario"}</p>
                        {row.scheduleIssues.map((issue) => (
                          <p className="mt-1 text-amber-900" key={issue}>
                            {issue}
                          </p>
                        ))}
                      </td>
                      <td className="px-3 py-3 align-top">{row.teachers || "Por confirmar"}</td>
                      <td className="px-3 py-3 align-top">{row.capacity || "Por confirmar"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>

          <p className="text-xs leading-5 text-muted">
            La oferta importada no modifica tu selección ni confirma la habilitación de inscripción.
            Los cupos corresponden al momento en que se descargó el reporte.
          </p>
        </>
      )}
    </section>
  );
}

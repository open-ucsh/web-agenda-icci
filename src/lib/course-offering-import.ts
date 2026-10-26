import type { CourseOfferingReport, OfferingRow, OfferingTimeBlock } from "@/types/course-offering";

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const DAYS: Readonly<Record<string, number>> = {
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
  domingo: 7,
};

export function parseOfferingSchedule(value: string): {
  blocks: OfferingTimeBlock[];
  issues: string[];
} {
  const blocks: OfferingTimeBlock[] = [];
  const issues: string[] = [];

  if (!value.trim() || normalize(value).includes("sin horario")) {
    return { blocks, issues: ["Horario pendiente de publicación."] };
  }

  for (const part of value.split("|")) {
    const text = part.trim();
    if (!text) continue;

    const match = /^([^:]+):\s*(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})(?:\s*\((.*)\))?\s*$/.exec(
      text,
    );

    if (!match) {
      issues.push(`Bloque no reconocido: ${text}`);
      continue;
    }

    const day = DAYS[normalize(match[1] ?? "")];
    const startHour = Number(match[2]);
    const startMinute = Number(match[3]);
    const endHour = Number(match[4]);
    const endMinute = Number(match[5]);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (
      day === undefined ||
      startHour > 23 ||
      endHour > 23 ||
      startMinute > 59 ||
      endMinute > 59 ||
      endMinutes <= startMinutes
    ) {
      issues.push(`Día u horas inválidos: ${text}`);
      continue;
    }

    blocks.push({
      day,
      startMinutes,
      endMinutes,
      room: (match[6] ?? "").replace(/\s+/g, " ").trim(),
    });
  }

  if (blocks.length === 0 && issues.length === 0) {
    issues.push("Horario pendiente de publicación.");
  }

  return { blocks, issues };
}

export function decodeOfferingFile(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);

  if ((bytes[0] === 0x50 && bytes[1] === 0x4b) || (bytes[0] === 0xd0 && bytes[1] === 0xcf)) {
    throw new Error(
      "Este archivo es un Excel binario. Importa el reporte HTML .xls exportado por la universidad.",
    );
  }

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder("windows-1252").decode(buffer);
  }
}

export function parseCourseOfferingReport(html: string): CourseOfferingReport {
  const document = new DOMParser().parseFromString(html, "text/html");
  const requiredHeaders = [
    "codigo",
    "descripcion",
    "funcion",
    "grupo",
    "seccion",
    "cupos",
    "modulos horarios",
    "jornada",
    "academicos",
  ];

  for (const table of document.querySelectorAll("table")) {
    const tableRows = Array.from(table.rows);
    const headerIndex = tableRows.findIndex((row) => {
      const labels = Array.from(row.cells, (cell) => normalize(cell.textContent ?? ""));
      return requiredHeaders.every((header) => labels.includes(header));
    });

    if (headerIndex < 0) continue;

    const header = tableRows[headerIndex];
    if (!header) continue;

    const labels = Array.from(header.cells, (cell) => normalize(cell.textContent ?? ""));
    const rows: OfferingRow[] = [];
    const issues: string[] = [];

    for (const [index, row] of tableRows.entries()) {
      if (index <= headerIndex) continue;

      const cells = Array.from(row.cells, (cell) =>
        (cell.textContent ?? "").replace(/\s+/g, " ").trim(),
      );
      if (cells.every((cell) => !cell)) continue;

      if (cells.length !== labels.length) {
        issues.push(`Fila ${index + 1}: cantidad de columnas inesperada; no se importó.`);
        continue;
      }

      const get = (name: string): string => cells[labels.indexOf(name)] ?? "";
      const code = get("codigo").toUpperCase();
      const name = get("descripcion");
      if (normalize(code) === "codigo") continue;

      if (!code || !name) {
        issues.push(`Fila ${index + 1}: falta código o descripción; no se importó.`);
        continue;
      }

      const rawSchedule = get("modulos horarios");
      const schedule = parseOfferingSchedule(rawSchedule);
      const section = get("seccion");
      const scheduleIssues = [...schedule.issues];

      if (!section) scheduleIssues.push("Sección pendiente de publicación.");

      rows.push({
        sourceRow: index + 1,
        code,
        name,
        activity: get("funcion"),
        group: get("grupo"),
        section,
        capacity: get("cupos"),
        rawSchedule,
        shift: get("jornada"),
        teachers: get("academicos"),
        plan: get("tipo plan"),
        axis: get("eje (pfi)"),
        line: get("linea (pfi)"),
        descriptor: get("descriptor"),
        blocks: schedule.blocks,
        scheduleIssues,
      });
    }

    if (rows.length === 0) {
      throw new Error("El reporte no contiene filas de oferta válidas.");
    }

    const metadata = tableRows
      .slice(0, headerIndex)
      .map((row) => (row.textContent ?? "").replace(/\s+/g, " ").trim());

    return {
      program: metadata.find((text) => normalize(text).startsWith("programa:")) ?? "",
      period: metadata.find((text) => normalize(text).startsWith("semestre:")) ?? "",
      rows,
      issues,
    };
  }

  throw new Error(
    "No se encontró la tabla de oferta UCSH. Revisa que sea el reporte de asignaturas.",
  );
}

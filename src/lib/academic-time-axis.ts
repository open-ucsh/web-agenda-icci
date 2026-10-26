import { ACADEMIC_BLOCKS, ACADEMIC_DAY_END, ACADEMIC_DAY_START } from "@/config/academic-blocks";

export interface AcademicTimeRow {
  startMinutes: number;
  endMinutes: number;
  kind: "class" | "gap" | "extra";
}

export function formatAcademicTime(minutes: number): string {
  const value = Math.round(minutes);
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

export function getAcademicTimeRange(starts: readonly number[], ends: readonly number[]) {
  return {
    startMinutes: Math.min(ACADEMIC_DAY_START, ...starts),
    endMinutes: Math.max(ACADEMIC_DAY_END, ...ends),
  };
}

export function getAcademicTimeRows(startMinutes: number, endMinutes: number): AcademicTimeRow[] {
  if (
    !Number.isFinite(startMinutes) ||
    !Number.isFinite(endMinutes) ||
    endMinutes <= startMinutes
  ) {
    throw new Error("El rango del calendario debe tener inicio y término válidos.");
  }

  const boundaries = new Set([startMinutes, endMinutes]);

  for (const block of ACADEMIC_BLOCKS) {
    if (block.startMinutes > startMinutes && block.startMinutes < endMinutes) {
      boundaries.add(block.startMinutes);
    }
    if (block.endMinutes > startMinutes && block.endMinutes < endMinutes) {
      boundaries.add(block.endMinutes);
    }
  }

  const points = [...boundaries].sort((first, second) => first - second);

  return points.slice(0, -1).map((start, index) => {
    const end = points[index + 1];
    if (end === undefined) throw new Error("Falta el término del intervalo.");

    const isClass = ACADEMIC_BLOCKS.some(
      (block) => start >= block.startMinutes && end <= block.endMinutes,
    );

    return {
      startMinutes: start,
      endMinutes: end,
      kind: isClass
        ? "class"
        : end <= ACADEMIC_DAY_START || start >= ACADEMIC_DAY_END
          ? "extra"
          : "gap",
    };
  });
}

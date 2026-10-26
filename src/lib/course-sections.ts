import type { OfferingRow, OfferingTimeBlock } from "@/types/course-offering";

export interface CourseSection {
  id: string;
  code: string;
  section: string;
  group: string;
  shift: string;
  rows: readonly OfferingRow[];
}

export function groupCourseSections(rows: readonly OfferingRow[]): CourseSection[] {
  const sections = new Map<string, CourseSection>();

  for (const row of rows) {
    const id = JSON.stringify([row.code, row.section, row.group, row.shift]);
    const existing = sections.get(id);

    if (existing) {
      sections.set(id, { ...existing, rows: [...existing.rows, row] });
    } else {
      sections.set(id, {
        id,
        code: row.code,
        section: row.section,
        group: row.group,
        shift: row.shift,
        rows: [row],
      });
    }
  }

  return Array.from(sections.values());
}

export function blocksOverlap(first: OfferingTimeBlock, second: OfferingTimeBlock): boolean {
  return (
    first.day === second.day &&
    first.startMinutes < second.endMinutes &&
    second.startMinutes < first.endMinutes
  );
}

export function findSectionConflicts(sections: readonly CourseSection[]) {
  const conflicts: {
    first: CourseSection;
    second: CourseSection;
    day: number;
    startMinutes: number;
    endMinutes: number;
  }[] = [];
  const seen = new Set<string>();

  for (let firstIndex = 0; firstIndex < sections.length; firstIndex++) {
    const first = sections[firstIndex];
    if (!first) continue;

    for (let secondIndex = firstIndex + 1; secondIndex < sections.length; secondIndex++) {
      const second = sections[secondIndex];
      if (!second) continue;

      for (const firstRow of first.rows) {
        for (const secondRow of second.rows) {
          for (const firstBlock of firstRow.blocks) {
            for (const secondBlock of secondRow.blocks) {
              if (!blocksOverlap(firstBlock, secondBlock)) continue;

              const startMinutes = Math.max(firstBlock.startMinutes, secondBlock.startMinutes);
              const endMinutes = Math.min(firstBlock.endMinutes, secondBlock.endMinutes);
              const key = JSON.stringify([
                first.id,
                second.id,
                firstBlock.day,
                startMinutes,
                endMinutes,
              ]);
              if (seen.has(key)) continue;
              seen.add(key);

              conflicts.push({
                first,
                second,
                day: firstBlock.day,
                startMinutes,
                endMinutes,
              });
            }
          }
        }
      }
    }
  }

  return conflicts;
}

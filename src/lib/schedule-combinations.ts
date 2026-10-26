import { blocksOverlap, type CourseSection } from "@/lib/course-sections";

interface CombinationOptions {
  maximumResults?: number;
  maximumAttempts?: number;
}

function hasCompleteSchedule(section: CourseSection): boolean {
  return (
    Boolean(section.section) &&
    section.rows.length > 0 &&
    section.rows.every((row) => row.scheduleIssues.length === 0 && row.blocks.length > 0)
  );
}

function hasInternalConflict(section: CourseSection): boolean {
  const uniqueBlocks = new Map(
    section.rows.flatMap((row) =>
      row.blocks.map(
        (block) =>
          [JSON.stringify([block.day, block.startMinutes, block.endMinutes]), block] as const,
      ),
    ),
  );
  const blocks = Array.from(uniqueBlocks.values());

  return blocks.some((first, index) =>
    blocks.slice(index + 1).some((second) => blocksOverlap(first, second)),
  );
}

function sectionsOverlap(first: CourseSection, second: CourseSection): boolean {
  return first.rows.some((firstRow) =>
    second.rows.some((secondRow) =>
      firstRow.blocks.some((firstBlock) =>
        secondRow.blocks.some((secondBlock) => blocksOverlap(firstBlock, secondBlock)),
      ),
    ),
  );
}

export function generateScheduleCombinations(
  sections: readonly CourseSection[],
  selectedCodes: readonly string[],
  options: CombinationOptions = {},
) {
  const maximumResults = options.maximumResults ?? 100;
  const maximumAttempts = options.maximumAttempts ?? 100_000;

  if (
    !Number.isSafeInteger(maximumResults) ||
    maximumResults < 1 ||
    !Number.isSafeInteger(maximumAttempts) ||
    maximumAttempts < 1
  ) {
    throw new Error("Los límites de búsqueda deben ser enteros positivos.");
  }

  const codes = [...new Set(selectedCodes)];
  const candidates = sections.filter((section) => codes.includes(section.code));
  const excludedSections = candidates.filter(
    (section) => !hasCompleteSchedule(section) || hasInternalConflict(section),
  );
  const excludedIds = new Set(excludedSections.map((section) => section.id));

  const groups = codes
    .map((code) => ({
      code,
      sections: candidates.filter(
        (section) => section.code === code && !excludedIds.has(section.id),
      ),
    }))
    .toSorted((first, second) => first.sections.length - second.sections.length);

  const unresolvedCodes = groups
    .filter((group) => group.sections.length === 0)
    .map((group) => group.code);

  const combinations: CourseSection[][] = [];
  let attempts = 0;
  let limited = false;

  if (codes.length === 0 || unresolvedCodes.length > 0) {
    return { combinations, excludedSections, unresolvedCodes, attempts, limited };
  }

  const current: CourseSection[] = [];

  function visit(index: number): void {
    if (index === groups.length) {
      combinations.push([...current]);
      return;
    }

    const group = groups[index];
    if (!group) return;

    for (const section of group.sections) {
      if (attempts >= maximumAttempts || combinations.length >= maximumResults) {
        limited = true;
        return;
      }

      attempts++;
      if (current.some((selected) => sectionsOverlap(selected, section))) continue;

      current.push(section);
      visit(index + 1);
      current.pop();

      if (limited) return;
    }
  }

  visit(0);

  return { combinations, excludedSections, unresolvedCodes, attempts, limited };
}

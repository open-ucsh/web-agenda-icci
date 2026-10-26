import { useRef, useState } from "react";

import { CURRICULUM_COURSES } from "@/data/curriculum";
import { decodeOfferingFile, parseCourseOfferingReport } from "@/lib/course-offering-import";
import { groupCourseSections } from "@/lib/course-sections";
import { getCourseRequirements } from "@/lib/curriculum-progress";
import { generateScheduleCombinations } from "@/lib/schedule-combinations";
import {
  evaluateSemesterPlan,
  type CourseOffering,
  type MinimumLoadException,
} from "@/lib/semester-plan";
import type { CourseOfferingReport } from "@/types/course-offering";
import type { CurriculumProgress } from "@/types/curriculum-progress";

interface ImportedOffering {
  report: CourseOfferingReport;
  fileName: string;
  revision: number;
}

interface SearchSnapshot {
  signature: string;
  result: ReturnType<typeof generateScheduleCombinations>;
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function useSemesterPlanner(progress: CurriculumProgress) {
  const requestRef = useRef(0);
  const [imported, setImported] = useState<ImportedOffering | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [exception, setException] = useState<MinimumLoadException>("none");
  const [search, setSearch] = useState<SearchSnapshot | null>(null);
  const [option, setOption] = useState(0);

  const report = imported?.report;
  const sections = groupCourseSections(report?.rows ?? []);
  const offeredCodes = new Set(report?.rows.map((row) => row.code));
  const offeredCourses = CURRICULUM_COURSES.filter((course) => offeredCodes.has(course.code));
  const selectedCodes = selected.filter((code) => {
    const course = offeredCourses.find((item) => item.code === code);
    return (
      course !== undefined &&
      progress[code] !== "approved" &&
      getCourseRequirements(course, CURRICULUM_COURSES, progress).eligible
    );
  });

  const offerings: Partial<Record<string, CourseOffering>> = {};
  for (const code of offeredCodes) offerings[code] = "offered";

  const evaluation = evaluateSemesterPlan({
    courses: CURRICULUM_COURSES,
    progress,
    selectedCodes,
    offerings,
    minimumException: exception,
  });

  const signature = JSON.stringify([imported?.revision, [...selectedCodes].sort()]);
  const result = search?.signature === signature ? search.result : null;
  const combination = result?.combinations[option] ?? [];

  const candidates = offeredCourses
    .filter((course) => progress[course.code] !== "approved")
    .filter((course) => normalize(`${course.name} ${course.code}`).includes(normalize(query)))
    .toSorted(
      (first, second) =>
        Number(progress[second.code] === "failed") - Number(progress[first.code] === "failed") ||
        first.semester - second.semester ||
        first.code.localeCompare(second.code),
    );

  const available = candidates.filter(
    (course) => getCourseRequirements(course, CURRICULUM_COURSES, progress).eligible,
  );
  const blocked = candidates.filter(
    (course) => !getCourseRequirements(course, CURRICULUM_COURSES, progress).eligible,
  );
  const unknownCodes = [...offeredCodes].filter(
    (code) => !CURRICULUM_COURSES.some((course) => course.code === code),
  );

  async function importFile(file: File): Promise<void> {
    const request = ++requestRef.current;
    setLoading(true);
    setError("");

    try {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("El archivo supera el máximo de 5 MB.");
      }

      const buffer = await file.arrayBuffer();
      const nextReport = parseCourseOfferingReport(decodeOfferingFile(buffer));
      if (request !== requestRef.current) return;

      setImported({ report: nextReport, fileName: file.name, revision: request });
      setSelected([]);
      setSearch(null);
      setOption(0);
      setException("none");
      setQuery("");
    } catch (cause) {
      if (request !== requestRef.current) return;
      setError(cause instanceof Error ? cause.message : "No se pudo importar el reporte.");
    } finally {
      if (request === requestRef.current) setLoading(false);
    }
  }

  function toggleCourse(code: string, checked: boolean): void {
    setSelected((current) =>
      checked ? [...new Set([...current, code])] : current.filter((item) => item !== code),
    );
    setSearch(null);
    setOption(0);
  }

  function generate(): void {
    setOption(0);
    setSearch({
      signature,
      result: generateScheduleCombinations(sections, selectedCodes),
    });
  }

  function previous(): void {
    setOption((current) => Math.max(0, current - 1));
  }

  function next(): void {
    if (!result) return;
    setOption((current) => Math.min(result.combinations.length - 1, current + 1));
  }

  return {
    imported,
    report,
    loading,
    error,
    query,
    setQuery,
    selectedCodes,
    evaluation,
    exception,
    setException,
    available,
    blocked,
    offeredCourses,
    unknownCodes,
    result,
    combination,
    option,
    importFile,
    toggleCourse,
    generate,
    previous,
    next,
  };
}

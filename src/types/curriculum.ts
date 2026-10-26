export type CourseKind = "required" | "elective" | "general";

export interface CurriculumCourse {
  code: string;
  name: string;
  credits: number;
  semester: number;
  kind: CourseKind;
  prerequisites: readonly string[];
  minimumCredits: number;
}

export interface CurriculumFilters {
  query: string;
  year: number | null;
  kind: CourseKind | "all";
}

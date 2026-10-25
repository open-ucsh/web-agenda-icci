export type CourseProgressStatus = "in-progress" | "approved" | "failed";

export type CourseDisplayStatus = CourseProgressStatus | "available" | "blocked";

export type CurriculumProgress = Readonly<Partial<Record<string, CourseProgressStatus>>>;

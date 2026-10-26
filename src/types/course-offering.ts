export interface OfferingTimeBlock {
  day: number;
  startMinutes: number;
  endMinutes: number;
  room: string;
}

export interface OfferingRow {
  sourceRow: number;
  code: string;
  name: string;
  activity: string;
  group: string;
  section: string;
  capacity: string;
  rawSchedule: string;
  shift: string;
  teachers: string;
  plan: string;
  axis: string;
  line: string;
  descriptor: string;
  blocks: readonly OfferingTimeBlock[];
  scheduleIssues: readonly string[];
}

export interface CourseOfferingReport {
  program: string;
  period: string;
  rows: readonly OfferingRow[];
  issues: readonly string[];
}

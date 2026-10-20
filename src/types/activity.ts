export type ActivityType = "pace" | "mentoring" | "tutoring" | "workshop";

export interface Activity {
  id: string;
  periodId: string;
  courseId: string;
  title: string;
  type: ActivityType;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  mentor: string;
}

export interface Holiday {
  date: string;
  name: string;
  source: string;
}

export type ResponsibleRole = "student" | "professor" | "facilitator";

export interface WeeklyActivitySchedule {
  id: string;
  periodId: string;
  name: string;
  type: ActivityType;
  weekday: number;
  startTime: string;
  endTime: string;
  responsibleName: string;
  responsibleRole: ResponsibleRole;
  location: string | null;
  validFrom: string;
  validUntil: string;
}

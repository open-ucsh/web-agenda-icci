import type { Activity } from "@/data/activities";
import { timeToMinutes } from "@/lib/time";

export interface PositionedActivity {
  activity: Activity;
  column: number;
  columns: number;
}

// Recibe las actividades de un mismo día.
// Cada grupo conectado por solapamientos comparte el número de columnas.
export function positionActivities(activities: readonly Activity[]): PositionedActivity[] {
  const sorted = [...activities].sort(
    (first, second) =>
      first.startTime.localeCompare(second.startTime) ||
      first.endTime.localeCompare(second.endTime) ||
      first.id.localeCompare(second.id),
  );

  const result: PositionedActivity[] = [];
  let group: Activity[] = [];
  let groupEnd = -1;

  function flushGroup(): void {
    const columnEnds: number[] = [];
    const positioned: { activity: Activity; column: number }[] = [];

    for (const activity of group) {
      const start = timeToMinutes(activity.startTime);
      const end = timeToMinutes(activity.endTime);
      const available = columnEnds.findIndex((value) => value <= start);
      const column = available === -1 ? columnEnds.length : available;

      columnEnds[column] = end;
      positioned.push({ activity, column });
    }

    for (const item of positioned) {
      result.push({ ...item, columns: columnEnds.length });
    }

    group = [];
    groupEnd = -1;
  }

  for (const activity of sorted) {
    const start = timeToMinutes(activity.startTime);
    const end = timeToMinutes(activity.endTime);

    if (group.length > 0 && start >= groupEnd) {
      flushGroup();
    }

    group.push(activity);
    groupEnd = Math.max(groupEnd, end);
  }

  flushGroup();

  return result;
}

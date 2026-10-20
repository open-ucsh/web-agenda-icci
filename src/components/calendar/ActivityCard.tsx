import { ACTIVITY_TYPE_CONFIG } from "@/config/activity-types";
import { COURSES } from "@/data/activities";
import type { Activity } from "@/types/activity";

interface ActivityCardProps {
  activity: Activity;
  onOpen: (activity: Activity, trigger: HTMLButtonElement) => void;
}

export function ActivityCard({ activity, onOpen }: ActivityCardProps) {
  const category = ACTIVITY_TYPE_CONFIG[activity.type];

  const fullName =
    COURSES.find((course) => course.id === activity.courseId)?.name ?? activity.title;

  const title = activity.type === "workshop" ? (fullName.split(" · ")[0] ?? fullName) : fullName;

  const responsibleName = activity.mentor.replace(/^(Estudiante|Profesor|Tallerista)\s+/, "");

  return (
    <button
      aria-haspopup="dialog"
      aria-label={`${fullName}, ${category.label}, ${activity.startTime} a ${activity.endTime}, ${activity.mentor}. Ver detalles.`}
      className={[
        "flex h-full w-full min-w-0 flex-col gap-1 overflow-hidden rounded-sm border border-l-2 px-2.5 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand motion-reduce:transition-none",
        category.card,
      ].join(" ")}
      onClick={(event) => onOpen(activity, event.currentTarget)}
      title={`${fullName} · ${category.label} · ${activity.startTime}–${activity.endTime} · ${activity.mentor}`}
      type="button"
    >
      <span className="line-clamp-2 w-full shrink-0 text-xs font-semibold leading-4">{title}</span>

      <span className="block w-full shrink-0 truncate text-xs leading-4 opacity-80">
        {responsibleName}
      </span>
    </button>
  );
}

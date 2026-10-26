import { Link2 } from "lucide-react";

import { ACTIVITY_TYPE_CONFIG } from "@/config/activity-types";
import { getCourseAppearance } from "@/config/course-appearance";
import { COURSES } from "@/data/activities";
import { CURRICULUM_COURSES } from "@/data/curriculum";
import type { Activity, ActivityType } from "@/types/activity";

import styles from "./AgendaCalendar.module.css";

interface ActivityCardProps {
  activity: Activity;
  onOpen: (activity: Activity, trigger: HTMLButtonElement) => void;
}

const SUPPORT_COLORS = {
  pace: { accent: "#b54a72", background: "#fbeef3" },
  mentoring: { accent: "#087f8c", background: "#eaf6f5" },
  tutoring: { accent: "#a67516", background: "#fcf5e7" },
  workshop: { accent: "#2563eb", background: "#edf3ff" },
} satisfies Record<Exclude<ActivityType, "class">, { accent: string; background: string }>;

const CURRICULUM = new Map(CURRICULUM_COURSES.map((course) => [course.code, course]));

export function ActivityCard({ activity, onOpen }: ActivityCardProps) {
  const category = ACTIVITY_TYPE_CONFIG[activity.type];
  const isClass = activity.type === "class";
  const code = activity.courseId.startsWith("personal:")
    ? activity.courseId.slice("personal:".length)
    : activity.courseId;
  const course = isClass ? CURRICULUM.get(code) : undefined;

  const fullName = COURSES.find((item) => item.id === activity.courseId)?.name ?? activity.title;
  const title = isClass
    ? (course?.name ?? activity.title.split(" · ")[0] ?? activity.title)
    : activity.type === "workshop"
      ? (fullName.split(" · ")[0] ?? fullName)
      : fullName;

  const section = isClass ? /(?:^|·)\s*S([^·\s]+)/.exec(activity.title)?.[1] : undefined;
  const appearance =
    activity.type === "class" ? getCourseAppearance(code) : SUPPORT_COLORS[activity.type];
  const hasPrerequisites = (course?.prerequisites.length ?? 0) > 0;
  const metadata = isClass
    ? [section ? `S${section}` : "", activity.location].filter(Boolean).join(" · ")
    : activity.location;

  const description = [
    title,
    category.label,
    `${activity.startTime}–${activity.endTime}`,
    metadata,
    activity.mentor,
    hasPrerequisites ? "Ramo con prerrequisitos" : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <button
      aria-haspopup="dialog"
      aria-label={`${description}. Ver detalles.`}
      className={[styles.card, isClass ? "" : styles.support].join(" ")}
      onClick={(event) => onOpen(activity, event.currentTarget)}
      style={{
        backgroundColor: isClass ? appearance.background : "#ffffff",
        borderColor: appearance.accent,
      }}
      title={description}
      type="button"
    >
      {!isClass && (
        <span
          className={styles.category}
          style={{ backgroundColor: appearance.background, color: appearance.accent }}
        >
          {category.label}
        </span>
      )}

      <span className={styles.cardHeading}>
        <span className={styles.cardTitle}>{title}</span>
        {hasPrerequisites && (
          <Link2 aria-hidden="true" className={styles.chain} style={{ color: appearance.accent }} />
        )}
      </span>

      <span className={styles.cardTime}>
        {activity.startTime}–{activity.endTime}
      </span>

      <span className={styles.cardMeta}>{metadata}</span>
    </button>
  );
}

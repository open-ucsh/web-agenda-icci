import type { ActivityType } from "@/types/activity";

interface ActivityTypeConfig {
  label: string;
  filterLabel: string;
  description: string;
  card: string;
  className: string;
  dot: string;
  active: string;
}

export const ACTIVITY_TYPE_CONFIG = {
  pace: {
    label: "PACE",
    filterLabel: "PACE",
    description: "Apoyo académico general",
    card: "border-rose-200 border-l-rose-500 bg-rose-50 text-rose-950 hover:border-rose-300 hover:bg-rose-100",
    className: "bg-rose-100 text-rose-800",
    dot: "bg-rose-500",
    active: "border-rose-200 bg-rose-50 text-rose-800",
  },
  mentoring: {
    label: "Mentoría",
    filterLabel: "Mentorías",
    description: "Mentoría de apoyo académico",
    card: "border-emerald-200 border-l-emerald-500 bg-emerald-50 text-emerald-950 hover:border-emerald-300 hover:bg-emerald-100",
    className: "bg-emerald-100 text-emerald-800",
    dot: "bg-emerald-500",
    active: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  tutoring: {
    label: "Ayudantía",
    filterLabel: "Ayudantías",
    description: "Ayudantía de apoyo académico",
    card: "border-orange-200 border-l-orange-500 bg-orange-50 text-orange-950 hover:border-orange-300 hover:bg-orange-100",
    className: "bg-orange-100 text-orange-800",
    dot: "bg-orange-500",
    active: "border-orange-200 bg-orange-50 text-orange-800",
  },
  workshop: {
    label: "Taller",
    filterLabel: "Talleres",
    description: "Taller extracurricular",
    card: "border-blue-200 border-l-blue-500 bg-blue-50 text-blue-950 hover:border-blue-300 hover:bg-blue-100",
    className: "bg-blue-100 text-blue-800",
    dot: "bg-blue-500",
    active: "border-blue-200 bg-blue-50 text-blue-800",
  },
} satisfies Record<ActivityType, ActivityTypeConfig>;

function isActivityType(value: string): value is ActivityType {
  return Object.hasOwn(ACTIVITY_TYPE_CONFIG, value);
}

export const ACTIVITY_TYPES = Object.keys(ACTIVITY_TYPE_CONFIG).filter(isActivityType);

export const ACTIVITY_FILTERS = ACTIVITY_TYPES.map((id) => {
  const config = ACTIVITY_TYPE_CONFIG[id];

  return {
    id,
    label: config.filterLabel,
    dot: config.dot,
    active: config.active,
  };
});

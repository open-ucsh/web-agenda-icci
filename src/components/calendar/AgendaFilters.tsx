import { Check } from "lucide-react";

import { ACTIVITY_FILTERS } from "@/config/activity-types";
import type { ActivityType } from "@/data/activities";

import styles from "./AgendaCalendar.module.css";

interface AgendaFiltersProps {
  selectedTypes: readonly ActivityType[];
  onTypeToggle: (type: ActivityType) => void;
}

const COLORS = {
  class: "#12376b",
  pace: "#b54a72",
  mentoring: "#087f8c",
  tutoring: "#a67516",
  workshop: "#2563eb",
} satisfies Record<ActivityType, string>;

export function AgendaFilters({ selectedTypes, onTypeToggle }: AgendaFiltersProps) {
  return (
    <div aria-label="Tipos de actividades" className={styles.filters} role="group">
      {ACTIVITY_FILTERS.map((filter) => {
        const selected = selectedTypes.includes(filter.id);
        const color = COLORS[filter.id];
        const personal = filter.id === "class" && selected;

        return (
          <button
            aria-pressed={selected}
            className={styles.filter}
            key={filter.id}
            onClick={() => onTypeToggle(filter.id)}
            style={{
              borderColor: selected ? color : "#e2e8f0",
              backgroundColor: personal ? color : "#ffffff",
              color: personal ? "#ffffff" : selected ? color : "#64748b",
            }}
            type="button"
          >
            <span
              aria-hidden="true"
              className="size-2 shrink-0 rounded-full"
              style={{
                backgroundColor: personal ? "#ffffff" : color,
                opacity: selected ? 1 : 0.45,
              }}
            />
            {filter.label}
            {selected && <Check aria-hidden="true" className="size-3" />}
          </button>
        );
      })}
    </div>
  );
}

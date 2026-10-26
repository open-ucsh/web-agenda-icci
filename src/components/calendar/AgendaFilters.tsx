import { Check } from "lucide-react";

import type { ActivityType } from "@/data/activities";

import styles from "./CalendarToolbar.module.css";

interface AgendaFiltersProps {
  selectedTypes: readonly ActivityType[];
  onTypeToggle: (type: ActivityType) => void;
}

const FILTERS = [
  { id: "class", label: "Mi horario", color: "#12376b" },
  { id: "pace", label: "PACE", color: "#be185d" },
  { id: "mentoring", label: "Mentorías", color: "#087f8c" },
  { id: "tutoring", label: "Ayudantías", color: "#a67516" },
  { id: "workshop", label: "Talleres", color: "#2563eb" },
] as const satisfies readonly {
  id: ActivityType;
  label: string;
  color: string;
}[];

export function AgendaFilters({ selectedTypes, onTypeToggle }: AgendaFiltersProps) {
  return (
    <div aria-label="Actividades visibles" className={styles.filterList} role="group">
      {FILTERS.map(({ id, label, color }) => {
        const selected = selectedTypes.includes(id);

        return (
          <button
            aria-pressed={selected}
            className={styles.filter}
            key={id}
            onClick={() => onTypeToggle(id)}
            type="button"
          >
            <span
              aria-hidden="true"
              className={styles.checkbox}
              style={{
                borderColor: color,
                backgroundColor: selected ? color : "transparent",
              }}
            >
              {selected && <Check strokeWidth={2.5} />}
            </span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

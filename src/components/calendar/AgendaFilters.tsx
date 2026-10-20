import { ACTIVITY_FILTERS } from "@/config/activity-types";

import { Check } from "lucide-react";

import type { ActivityType } from "@/data/activities";

interface AgendaFiltersProps {
  selectedTypes: readonly ActivityType[];
  onTypeToggle: (type: ActivityType) => void;
}

export function AgendaFilters({ selectedTypes, onTypeToggle }: AgendaFiltersProps) {
  return (
    <div
      aria-label="Tipos de actividades"
      className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:items-center"
      role="group"
    >
      {ACTIVITY_FILTERS.map((filter) => {
        const selected = selectedTypes.includes(filter.id);

        return (
          <button
            aria-pressed={selected}
            className={[
              "inline-flex h-9 min-w-0 items-center justify-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              selected ? filter.active : "border-border bg-background text-muted hover:bg-surface",
            ].join(" ")}
            key={filter.id}
            onClick={() => onTypeToggle(filter.id)}
            type="button"
          >
            <span
              aria-hidden="true"
              className={[
                "size-2 shrink-0 rounded-full",
                filter.dot,
                selected ? "" : "opacity-35",
              ].join(" ")}
            />

            <span>{filter.label}</span>

            <Check
              aria-hidden="true"
              className={["size-3 shrink-0", selected ? "visible" : "invisible"].join(" ")}
              strokeWidth={2}
            />
          </button>
        );
      })}
    </div>
  );
}

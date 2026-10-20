import type { ActivityType } from "@/data/activities";

interface AgendaFiltersProps {
  selectedTypes: readonly ActivityType[];
  onTypeToggle: (type: ActivityType) => void;
}

const ACTIVITY_FILTERS = [
  {
    id: "pace",
    label: "PACE",
    dot: "bg-pace",
    active: "border-pace/20 bg-pace-surface text-pace",
  },
  {
    id: "mentoring",
    label: "Mentorías",
    dot: "bg-mentoring",
    active: "border-mentoring/20 bg-mentoring-surface text-mentoring",
  },
  {
    id: "tutoring",
    label: "Ayudantías",
    dot: "bg-tutoring",
    active: "border-tutoring/20 bg-tutoring-surface text-tutoring",
  },
] as const;

export function AgendaFilters({ selectedTypes, onTypeToggle }: AgendaFiltersProps) {
  return (
    <div
      aria-label="Tipos de apoyo académico"
      className="flex flex-wrap items-center gap-2"
      role="group"
    >
      {ACTIVITY_FILTERS.map((filter) => {
        const selected = selectedTypes.includes(filter.id);

        return (
          <button
            aria-pressed={selected}
            className={[
              "inline-flex h-8 items-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:h-9",
              selected ? filter.active : "border-border bg-background text-muted hover:bg-surface",
            ].join(" ")}
            key={filter.id}
            onClick={() => onTypeToggle(filter.id)}
            type="button"
          >
            <span
              aria-hidden="true"
              className={["size-2 rounded-full", filter.dot, selected ? "" : "opacity-35"].join(
                " ",
              )}
            />

            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

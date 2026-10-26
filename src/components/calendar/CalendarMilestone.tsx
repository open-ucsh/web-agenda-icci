import { ChevronRight, X } from "lucide-react";
import { useId, useRef } from "react";

import { Dialog } from "@/components/ui/Dialog";

import styles from "./AgendaCalendar.module.css";

interface MilestoneItem {
  id: string;
  title: string;
  kind: "holiday" | "academic";
}

interface CalendarMilestoneProps {
  dateLabel: string;
  items: readonly MilestoneItem[];
}

export function CalendarMilestone({ dateLabel, items }: CalendarMilestoneProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const first = items[0];

  if (!first) {
    return null;
  }

  return (
    <>
      <button
        aria-haspopup="dialog"
        aria-label={`${dateLabel}. ${items.map((item) => item.title).join(". ")}. Ver detalle.`}
        className={styles.milestone}
        data-holiday={first.kind === "holiday"}
        onClick={() => dialogRef.current?.showModal()}
        ref={triggerRef}
        type="button"
      >
        <span className={styles.milestoneLabel}>
          <span>{first.kind === "holiday" ? "Feriado" : "Fecha clave"}</span>
          {items.length > 1 && <span className={styles.milestoneCount}>+{items.length - 1}</span>}
          <ChevronRight aria-hidden="true" />
        </span>
        <span className={styles.milestoneTitle}>{first.title}</span>
      </button>

      <Dialog
        aria-labelledby={titleId}
        dialogRef={dialogRef}
        restoreFocusRef={triggerRef}
        size="small"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold capitalize text-brand" id={titleId}>
            {dateLabel}
          </h2>
          <button
            aria-label="Cerrar detalle"
            className="grid size-10 shrink-0 place-items-center rounded text-muted hover:bg-surface focus-visible:outline-2 focus-visible:outline-brand"
            onClick={() => dialogRef.current?.close()}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </header>

        <ul className="min-h-0 divide-y divide-border overflow-y-auto px-5">
          {items.map((item) => (
            <li className="py-4" key={item.id}>
              <p className="text-xs font-medium text-muted">
                {item.kind === "holiday" ? "Feriado · Sin actividades" : "Fecha académica"}
              </p>
              <p className="mt-1 text-sm leading-6 text-text">{item.title}</p>
            </li>
          ))}
        </ul>
      </Dialog>
    </>
  );
}

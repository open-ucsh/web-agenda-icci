import { Download, ExternalLink } from "lucide-react";
import { useState } from "react";

import { downloadCalendar, getGoogleCalendarUrl } from "@/lib/calendar-export";
import type { Activity } from "@/types/activity";

interface CalendarExportActionsProps {
  activities: readonly Activity[];
  filename: string;
  label: string;
  googleActivity?: Activity;
  compact?: boolean;
}

const actionClass =
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40";

export function CalendarExportActions({
  activities,
  filename,
  label,
  googleActivity,
  compact = false,
}: CalendarExportActionsProps) {
  const [error, setError] = useState<string | null>(null);

  function download(): void {
    try {
      downloadCalendar(activities, filename);
      setError(null);
    } catch {
      setError("No se pudo exportar el calendario. Revisa la fecha y el horario.");
    }
  }

  let googleUrl: string | undefined;

  if (googleActivity) {
    try {
      googleUrl = getGoogleCalendarUrl(googleActivity);
    } catch {
      googleUrl = undefined;
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          aria-label={label}
          title={label}
          className={
            compact
              ? "inline-flex size-9 shrink-0 items-center justify-center gap-2 rounded-md text-muted transition-colors enabled:hover:bg-surface enabled:hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto sm:px-3"
              : actionClass
          }
          disabled={activities.length === 0}
          onClick={download}
          type="button"
        >
          <Download aria-hidden="true" className="size-4 shrink-0" />
          {compact ? <span className="hidden sm:inline">Exportar</span> : label}
        </button>

        {googleUrl && (
          <a
            aria-label="Añadir actividad a Google Calendar (abre una pestaña nueva)"
            className={actionClass}
            href={googleUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <ExternalLink aria-hidden="true" className="size-4" />
            Google Calendar
          </a>
        )}
      </div>

      {error && (
        <p className="text-xs text-muted" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

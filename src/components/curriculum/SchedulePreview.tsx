import { CURRICULUM_COURSES } from "@/data/curriculum";
import type { CourseSection } from "@/lib/course-sections";

import styles from "./SemesterPlanner.module.css";

interface SchedulePreviewProps {
  sections: readonly CourseSection[];
}

const DAYS = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const COLORS = ["#2563eb", "#0d9488", "#db2777", "#d97706", "#0891b2", "#16a34a"];

function formatTime(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

export function SchedulePreview({ sections }: SchedulePreviewProps) {
  const seen = new Set<string>();
  const events = sections.flatMap((section) =>
    section.rows.flatMap((row) =>
      row.blocks.flatMap((block) => {
        const key = JSON.stringify([
          section.id,
          block.day,
          block.startMinutes,
          block.endMinutes,
          block.room,
        ]);
        if (seen.has(key)) return [];
        seen.add(key);
        return [{ key, section, row, block }];
      }),
    ),
  );

  const days = [1, 2, 3, 4, 5];
  if (events.some((event) => event.block.day === 6)) days.push(6);
  if (events.some((event) => event.block.day === 7)) days.push(7);

  const start =
    Math.floor(Math.min(510, ...events.map((event) => event.block.startMinutes)) / 60) * 60;
  const end = Math.ceil(Math.max(1080, ...events.map((event) => event.block.endMinutes)) / 60) * 60;
  const duration = end - start;
  const hours = Array.from({ length: duration / 60 }, (_, index) => start + index * 60);
  const columns = `3.25rem repeat(${days.length}, minmax(0, 1fr))`;

  return (
    <div
      aria-label="Horario semanal propuesto. Desplázate horizontalmente si es necesario."
      className={styles.preview}
      role="region"
      tabIndex={0}
    >
      <div className={styles.previewInner}>
        <div className={styles.previewDays} style={{ gridTemplateColumns: columns }}>
          <div />
          {days.map((day) => (
            <div className={styles.dayLabel} key={day}>
              {DAYS[day]}
            </div>
          ))}
        </div>

        <div className={styles.previewBody} style={{ gridTemplateColumns: columns }}>
          <div className={styles.timeColumn}>
            {hours.map((hour) => (
              <span
                className={styles.hour}
                key={hour}
                style={{ top: `calc(${((hour - start) / duration) * 100}% + 4px)` }}
              >
                {formatTime(hour)}
              </span>
            ))}
          </div>

          {days.map((day) => (
            <div className={styles.dayColumn} key={day}>
              {hours.map((hour) => (
                <div
                  aria-hidden="true"
                  className={styles.gridLine}
                  key={hour}
                  style={{ top: `${((hour - start) / duration) * 100}%` }}
                />
              ))}

              {events
                .filter((event) => event.block.day === day)
                .map((event) => {
                  const courseIndex = CURRICULUM_COURSES.findIndex(
                    (course) => course.code === event.section.code,
                  );
                  const color = COLORS[Math.max(0, courseIndex) % COLORS.length] ?? "#2563eb";
                  const name =
                    CURRICULUM_COURSES.find((course) => course.code === event.section.code)?.name ??
                    event.row.name;
                  const description = `${name}, ${event.row.activity}, sección ${event.section.section}, ${DAYS[day]} ${formatTime(event.block.startMinutes)}–${formatTime(event.block.endMinutes)}, ${event.block.room || "Sala pendiente"}`;

                  return (
                    <article
                      aria-label={description}
                      className={styles.event}
                      key={event.key}
                      style={{
                        top: `calc(${((event.block.startMinutes - start) / duration) * 100}% + 2px)`,
                        height: `calc(${((event.block.endMinutes - event.block.startMinutes) / duration) * 100}% - 4px)`,
                        borderLeftColor: color,
                      }}
                      title={description}
                    >
                      <p className={styles.eventName}>{name}</p>
                      <p className={styles.eventMeta}>
                        S{event.section.section} · {event.block.room || "Sala pendiente"}
                      </p>
                    </article>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

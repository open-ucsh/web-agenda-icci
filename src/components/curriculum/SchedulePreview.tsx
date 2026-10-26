import { Link2 } from "lucide-react";

import { getCourseAppearance } from "@/config/course-appearance";
import { CURRICULUM_COURSES } from "@/data/curriculum";
import {
  formatAcademicTime,
  getAcademicTimeRange,
  getAcademicTimeRows,
} from "@/lib/academic-time-axis";
import type { CourseSection } from "@/lib/course-sections";

import styles from "./SemesterPlanner.module.css";

interface SchedulePreviewProps {
  sections: readonly CourseSection[];
}

const DAYS = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const COURSES = new Map(CURRICULUM_COURSES.map((course) => [course.code, course]));

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

  const { startMinutes: start, endMinutes: end } = getAcademicTimeRange(
    events.map((event) => event.block.startMinutes),
    events.map((event) => event.block.endMinutes),
  );

  const duration = end - start;
  const timeRows = getAcademicTimeRows(start, end);
  const marks = timeRows.filter((row) => row.kind !== "gap");
  const longBreaks = timeRows.filter(
    (row) => row.kind === "gap" && row.endMinutes - row.startMinutes >= 30,
  );
  const columns = `5.5rem repeat(${days.length}, minmax(0, 1fr))`;

  return (
    <>
      <div
        aria-label="Horario semanal propuesto. Las clases se ubican según su hora real."
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
              {longBreaks.map((gap) => (
                <span
                  className={styles.longBreakTime}
                  key={`gap-${gap.startMinutes}`}
                  style={{
                    top: `${(((gap.startMinutes + gap.endMinutes) / 2 - start) / duration) * 100}%`,
                  }}
                >
                  {formatAcademicTime(gap.startMinutes)}–{formatAcademicTime(gap.endMinutes)}
                </span>
              ))}
              {marks.map((mark) => (
                <span
                  className={styles.axisTime}
                  key={mark.startMinutes}
                  style={{
                    top: `calc(${((mark.startMinutes - start) / duration) * 100}% + 4px)`,
                  }}
                >
                  {formatAcademicTime(mark.startMinutes)}
                </span>
              ))}
            </div>

            {days.map((day) => (
              <div className={styles.dayColumn} key={day}>
                {longBreaks.map((gap) => (
                  <div
                    aria-hidden="true"
                    className={styles.lunchBand}
                    key={`break-${gap.startMinutes}`}
                    style={{
                      top: `${((gap.startMinutes - start) / duration) * 100}%`,
                      height: `${((gap.endMinutes - gap.startMinutes) / duration) * 100}%`,
                    }}
                  />
                ))}

                {marks.map((mark) => (
                  <div
                    aria-hidden="true"
                    className={styles.gridLine}
                    key={mark.startMinutes}
                    style={{
                      top: `${((mark.startMinutes - start) / duration) * 100}%`,
                    }}
                  />
                ))}

                {events
                  .filter((event) => event.block.day === day)
                  .map((event) => {
                    const course = COURSES.get(event.section.code);
                    const appearance = getCourseAppearance(event.section.code);
                    const name = course?.name ?? event.row.name;
                    const prerequisites = course?.prerequisites ?? [];
                    const prerequisiteNames = prerequisites.map(
                      (code) => COURSES.get(code)?.name ?? code,
                    );
                    const requirementLabel =
                      prerequisiteNames.length > 0
                        ? `Prerrequisitos: ${prerequisiteNames.join(", ")}.`
                        : "";
                    const description = [
                      name,
                      event.section.code,
                      event.row.activity,
                      `Sección ${event.section.section}`,
                      `${DAYS[day]} ${formatAcademicTime(event.block.startMinutes)}–${formatAcademicTime(event.block.endMinutes)}`,
                      event.block.room || "Sala por confirmar",
                      requirementLabel,
                    ]
                      .filter(Boolean)
                      .join(" · ");

                    return (
                      <article
                        aria-label={description}
                        className={styles.event}
                        key={event.key}
                        style={{
                          top: `calc(${((event.block.startMinutes - start) / duration) * 100}% + 3px)`,
                          height: `calc(${((event.block.endMinutes - event.block.startMinutes) / duration) * 100}% - 6px)`,
                          backgroundColor: appearance.background,
                          borderColor: appearance.border,
                          borderLeftColor: appearance.accent,
                        }}
                        title={description}
                      >
                        <div className={styles.eventHeading}>
                          <p className={styles.eventName}>{name}</p>
                          {prerequisites.length > 0 && (
                            <span
                              aria-label={requirementLabel}
                              className={styles.prerequisiteMark}
                              style={{ color: appearance.accent }}
                              title={requirementLabel}
                            >
                              <Link2 aria-hidden="true" />
                            </span>
                          )}
                        </div>

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

      <div className={styles.previewLegend}>
        <span>
          <i aria-hidden="true" className={styles.classSample} />
          Clase
        </span>
        <span>
          <Link2 aria-hidden="true" />
          Con prerrequisitos
        </span>
      </div>
    </>
  );
}

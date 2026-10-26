import { getCourseAppearance } from "@/config/course-appearance";
import { CURRICULUM_COURSES } from "@/data/curriculum";
import { formatAcademicTime } from "@/lib/academic-time-axis";
import type { CourseSection } from "@/lib/course-sections";
import { formatResponsibleNames } from "@/lib/responsible-names";

import styles from "./ScheduleSections.module.css";

interface ScheduleSectionsProps {
  sections: readonly CourseSection[];
}

const DAYS = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const COURSES = new Map(CURRICULUM_COURSES.map((course) => [course.code, course]));

function activityLabel(value: string): string {
  const lower = value.trim().toLocaleLowerCase("es-CL");
  return lower ? lower.charAt(0).toLocaleUpperCase("es-CL") + lower.slice(1) : "Actividad";
}

export function ScheduleSections({ sections }: ScheduleSectionsProps) {
  return (
    <div className={styles.content}>
      <p className={styles.intro}>
        Secciones de la opción elegida. Los cupos corresponden al reporte importado.
      </p>

      <ul className={styles.list}>
        {sections.map((section) => {
          const course = COURSES.get(section.code);
          const appearance = getCourseAppearance(section.code);

          return (
            <li
              className={styles.course}
              key={section.id}
              style={{ borderLeftColor: appearance.accent }}
            >
              <header className={styles.header} style={{ backgroundColor: appearance.background }}>
                <div className="min-w-0">
                  <h3 className={styles.title}>
                    {course?.name ?? section.rows[0]?.name ?? section.code}
                  </h3>
                  <p className={styles.metadata}>
                    {section.code}
                    {section.shift && ` · ${activityLabel(section.shift)}`}
                    {section.group && section.group !== "0" && ` · Grupo ${section.group}`}
                  </p>
                </div>

                <span className={styles.section} style={{ color: appearance.accent }}>
                  Sección {section.section || "por confirmar"}
                </span>
              </header>

              {section.rows.map((row) => {
                const blocks = [...row.blocks].sort(
                  (first, second) =>
                    first.day - second.day || first.startMinutes - second.startMinutes,
                );
                const teacher = formatResponsibleNames(row.teachers);

                return (
                  <div className={styles.activity} key={row.sourceRow}>
                    <div className={styles.activityHeading}>
                      <h4>{activityLabel(row.activity)}</h4>
                      <span
                        className={
                          row.capacity.trim() === "0" ? styles.noCapacity : styles.capacity
                        }
                      >
                        {row.capacity.trim()
                          ? `${row.capacity.trim()} cupos`
                          : "Cupos por confirmar"}
                      </span>
                    </div>

                    <p className={styles.teacher}>{teacher || "Docente por confirmar"}</p>

                    {blocks.length > 0 && (
                      <table className={styles.table}>
                        <caption className="sr-only">
                          Horarios de {activityLabel(row.activity)} de {course?.name ?? row.name}
                        </caption>
                        <thead>
                          <tr>
                            <th scope="col">Día</th>
                            <th scope="col">Horario</th>
                            <th scope="col">Sala</th>
                          </tr>
                        </thead>
                        <tbody>
                          {blocks.map((block, index) => (
                            <tr key={`${block.day}-${block.startMinutes}-${index}`}>
                              <td>{DAYS[block.day]}</td>
                              <td className={styles.time}>
                                {formatAcademicTime(block.startMinutes)}–
                                {formatAcademicTime(block.endMinutes)}
                              </td>
                              <td>{block.room || "Por confirmar"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {row.scheduleIssues.map((issue) => (
                      <p className={styles.issue} key={issue}>
                        {issue}
                      </p>
                    ))}
                  </div>
                );
              })}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

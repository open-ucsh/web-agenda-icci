import { Link2 } from "lucide-react";

import { ActivityCard } from "@/components/calendar/ActivityCard";
import {
  DAY_NAMES,
  dayColumnClass,
  fullDateFormatter,
} from "@/components/calendar/calendar-display";
import { getHoliday, type Activity, type Holiday } from "@/data/activities";
import { formatAcademicTime, getAcademicTimeRows } from "@/lib/academic-time-axis";
import { positionActivities } from "@/lib/calendar-layout";
import { dateKey } from "@/lib/dates";
import { timeToMinutes } from "@/lib/time";

import styles from "./AgendaCalendar.module.css";

interface CalendarAcademicDate {
  id: string;
  title: string;
  startsOn: string;
  endsOn: string;
}

interface CalendarGridProps {
  days: readonly Date[];
  selectedDay: number;
  selectedDate: Date;
  selectedHoliday: Holiday | undefined;
  selectedActivityCount: number;
  todayKey: string;
  mobilePanelId: string;
  weekActivities: readonly Activity[];
  visibleAcademicDates: readonly CalendarAcademicDate[];
  hasHolidays: boolean;
  startHour: number;
  endHour: number;
  hours: readonly number[];
  calendarHeight: number;
  onOpenActivity: (activity: Activity, trigger: HTMLButtonElement) => void;
}

export function CalendarGrid({
  days,
  selectedDay,
  selectedDate,
  selectedHoliday,
  selectedActivityCount,
  todayKey,
  mobilePanelId,
  weekActivities,
  visibleAcademicDates,
  hasHolidays,
  startHour,
  endHour,
  onOpenActivity,
}: CalendarGridProps) {
  const start = startHour * 60;
  const end = endHour * 60;
  const duration = end - start;
  const rows = getAcademicTimeRows(start, end);
  const marks = rows.filter((row) => row.kind !== "gap");
  const longBreaks = rows.filter(
    (row) => row.kind === "gap" && row.endMinutes - row.startMinutes >= 30,
  );

  return (
    <>
      <div className={styles.frame}>
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-3 py-2 md:hidden">
          <p className="text-xs font-medium capitalize" id={mobilePanelId}>
            {fullDateFormatter.format(selectedDate)}
          </p>
          <span className="text-xs text-muted">
            {selectedHoliday ? "Feriado" : `${selectedActivityCount} act.`}
          </span>
        </div>

        <div
          aria-label="Agenda semanal. Desplázate para consultar todo el horario."
          className={styles.scroll}
          role="region"
          tabIndex={0}
        >
          <div className={styles.inner}>
            <div className={styles.stickyHeader}>
              <div className={`${styles.dayHeader} hidden md:flex`}>
                <div aria-hidden="true" className={styles.gutter} />
                {days.map((day, index) => {
                  const key = dateKey(day);
                  const isToday = key === todayKey;

                  return (
                    <div
                      className={[
                        dayColumnClass(index, selectedDay),
                        styles.dayHeading,
                        index >= 5 ? styles.weekend : "",
                      ].join(" ")}
                      key={key}
                    >
                      <div className={styles.dateLine}>
                        <span>{DAY_NAMES[index]}</span>
                        <time
                          aria-current={isToday ? "date" : undefined}
                          className={[styles.dateNumber, isToday ? styles.today : ""].join(" ")}
                          dateTime={key}
                        >
                          {day.getDate()}
                        </time>
                      </div>
                    </div>
                  );
                })}
              </div>

              {(visibleAcademicDates.length > 0 || hasHolidays) && (
                <div className={styles.academicDates}>
                  <div className={`${styles.gutter} flex items-center justify-center px-1`}>
                    <span className="text-center text-[10px] text-muted">Fechas clave</span>
                  </div>
                  {days.map((day, index) => {
                    const key = dateKey(day);
                    const holiday = getHoliday(key);
                    const dates = visibleAcademicDates.filter(
                      (item) => item.startsOn <= key && item.endsOn >= key,
                    );

                    return (
                      <div
                        className={[
                          dayColumnClass(index, selectedDay),
                          styles.academicCell,
                          index >= 5 ? styles.weekend : "",
                        ].join(" ")}
                        key={key}
                      >
                        {holiday && (
                          <p className={styles.milestone} title={`Feriado: ${holiday.name}`}>
                            {holiday.name} · Sin actividades
                          </p>
                        )}
                        {dates.map((item) => (
                          <p className={styles.milestone} key={item.id} title={item.title}>
                            {item.title}
                          </p>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className={styles.timeline}>
              <div aria-hidden="true" className={styles.timeColumn}>
                {marks.map((mark) => (
                  <span
                    className={styles.time}
                    key={mark.startMinutes}
                    style={{
                      top: `calc(${((mark.startMinutes - start) / duration) * 100}% + 4px)`,
                    }}
                  >
                    {formatAcademicTime(mark.startMinutes)}
                  </span>
                ))}
                {longBreaks.map((gap) => (
                  <span
                    className={styles.breakTime}
                    key={`gap-${gap.startMinutes}`}
                    style={{
                      top: `${(((gap.startMinutes + gap.endMinutes) / 2 - start) / duration) * 100}%`,
                    }}
                  >
                    {formatAcademicTime(gap.startMinutes)}–{formatAcademicTime(gap.endMinutes)}
                  </span>
                ))}
              </div>

              {days.map((day, index) => {
                const key = dateKey(day);
                const holiday = getHoliday(key);
                const positioned = positionActivities(
                  weekActivities.filter((activity) => activity.date === key),
                );

                return (
                  <section
                    aria-label={`${fullDateFormatter.format(day)}${holiday ? `. Feriado: ${holiday.name}` : ""}`}
                    className={[
                      dayColumnClass(index, selectedDay),
                      styles.dayColumn,
                      index >= 5 || holiday ? styles.weekend : "",
                    ].join(" ")}
                    key={key}
                  >
                    {marks.map((mark) => (
                      <div
                        aria-hidden="true"
                        className={styles.line}
                        key={mark.startMinutes}
                        style={{
                          top: `${((mark.startMinutes - start) / duration) * 100}%`,
                        }}
                      />
                    ))}

                    {positioned.map(({ activity, column, columns }) => {
                      const activityStart = timeToMinutes(activity.startTime);
                      const activityEnd = timeToMinutes(activity.endTime);

                      return (
                        <div
                          className={styles.eventPosition}
                          key={activity.id}
                          style={{
                            top: `${((activityStart - start) / duration) * 100}%`,
                            height: `${((activityEnd - activityStart) / duration) * 100}%`,
                            left: `${(column / columns) * 100}%`,
                            width: `${100 / columns}%`,
                          }}
                        >
                          <ActivityCard activity={activity} onOpen={onOpenActivity} />
                        </div>
                      );
                    })}
                  </section>
                );
              })}
            </div>

            <div aria-hidden="true" className="h-5 shrink-0 pl-3 text-[10px] leading-5 text-muted">
              {formatAcademicTime(end)}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.legend}>
        <span>
          <i aria-hidden="true" className={styles.classSample} />
          Clase
        </span>
        <span>
          <i aria-hidden="true" className={styles.supportSample} />
          Apoyo
        </span>
        <span>
          <Link2 aria-hidden="true" />
          Con prerrequisitos
        </span>
      </div>
    </>
  );
}

PRAGMA foreign_keys = ON;

CREATE TABLE academic_periods (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'America/Santiago',
    semester_end TEXT NOT NULL,
    CHECK (date(semester_end) IS NOT NULL)
) STRICT;

CREATE TABLE weekly_activities (
    id TEXT PRIMARY KEY,
    period_id TEXT NOT NULL REFERENCES academic_periods(id),
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    type TEXT NOT NULL CHECK (type IN ('pace', 'mentoring', 'tutoring')),
    weekday INTEGER NOT NULL CHECK (weekday BETWEEN 1 AND 7),
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    responsible_name TEXT NOT NULL,
    responsible_role TEXT NOT NULL
        CHECK (responsible_role IN ('student', 'professor')),
    location TEXT,
    valid_from TEXT NOT NULL,
    valid_until TEXT NOT NULL,
    CHECK (
        start_time GLOB '[0-2][0-9]:[0-5][0-9]'
        AND substr(start_time, 1, 2) <= '23'
    ),
    CHECK (
        end_time GLOB '[0-2][0-9]:[0-5][0-9]'
        AND substr(end_time, 1, 2) <= '23'
    ),
    CHECK (start_time < end_time),
    CHECK (date(valid_from) IS NOT NULL),
    CHECK (date(valid_until) IS NOT NULL),
    CHECK (valid_from <= valid_until)
) STRICT;

CREATE INDEX weekly_activities_period
    ON weekly_activities(period_id, weekday, start_time);

CREATE TABLE academic_dates (
    id TEXT PRIMARY KEY,
    period_id TEXT NOT NULL REFERENCES academic_periods(id),
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    starts_on TEXT NOT NULL,
    ends_on TEXT NOT NULL,
    featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
    source TEXT NOT NULL,
    CHECK (date(starts_on) IS NOT NULL),
    CHECK (date(ends_on) IS NOT NULL),
    CHECK (starts_on <= ends_on)
) STRICT;

CREATE INDEX academic_dates_period
    ON academic_dates(period_id, starts_on);

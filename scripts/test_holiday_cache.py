import sqlite3
import unittest

from holiday_cache import required_years, validate_cached_holidays


class HolidayCacheTests(unittest.TestCase):
    def setUp(self):
        self.connection = sqlite3.connect(":memory:")
        self.addCleanup(self.connection.close)
        self.connection.executescript(
            """
            CREATE TABLE weekly_activities (
                valid_from TEXT NOT NULL,
                valid_until TEXT NOT NULL
            );
            CREATE TABLE holidays (
                date TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                source TEXT NOT NULL
            );
            CREATE TABLE holiday_sync (
                year INTEGER PRIMARY KEY,
                synced_at TEXT NOT NULL
            );
            """
        )

    def add_schedule(self, starts_on="2026-10-01", ends_on="2026-12-31"):
        self.connection.execute(
            "INSERT INTO weekly_activities VALUES (?, ?)",
            (starts_on, ends_on),
        )

    def add_cache(self, year):
        self.connection.execute(
            "INSERT INTO holiday_sync VALUES (?, ?)",
            (year, "2026-10-20T00:00:00+00:00"),
        )
        self.connection.execute(
            "INSERT INTO holidays VALUES (?, ?, ?)",
            (f"{year}-01-01", "Año Nuevo", "test"),
        )

    def test_no_schedules_require_no_years(self):
        self.assertEqual(required_years(self.connection), set())
        validate_cached_holidays(self.connection)

    def test_collects_all_years_in_schedule_range(self):
        self.add_schedule("2025-12-01", "2027-01-31")
        self.assertEqual(required_years(self.connection), {2025, 2026, 2027})

    def test_rejects_missing_cache(self):
        self.add_schedule()
        with self.assertRaisesRegex(RuntimeError, "2026"):
            validate_cached_holidays(self.connection)

    def test_accepts_cached_year_without_writing(self):
        self.add_schedule()
        self.add_cache(2026)
        self.connection.commit()
        before = self.connection.total_changes
        self.connection.execute("PRAGMA query_only = ON")

        validate_cached_holidays(self.connection)

        self.assertEqual(self.connection.total_changes, before)

    def test_sync_marker_without_holidays_is_insufficient(self):
        self.add_schedule()
        self.connection.execute(
            "INSERT INTO holiday_sync VALUES (?, ?)",
            (2026, "2026-10-20"),
        )
        with self.assertRaisesRegex(RuntimeError, "2026"):
            validate_cached_holidays(self.connection)

    def test_holidays_without_sync_marker_are_insufficient(self):
        self.add_schedule()
        self.connection.execute(
            "INSERT INTO holidays VALUES (?, ?, ?)",
            ("2026-01-01", "Año Nuevo", "test"),
        )
        with self.assertRaisesRegex(RuntimeError, "2026"):
            validate_cached_holidays(self.connection)

    def test_requires_every_year(self):
        self.add_schedule("2026-12-01", "2027-01-31")
        self.add_cache(2026)
        with self.assertRaisesRegex(RuntimeError, "2027"):
            validate_cached_holidays(self.connection)

    def test_reports_missing_tables(self):
        self.connection.execute("DROP TABLE holiday_sync")
        with self.assertRaisesRegex(RuntimeError, "tablas de feriados"):
            validate_cached_holidays(self.connection)


if __name__ == "__main__":
    unittest.main()

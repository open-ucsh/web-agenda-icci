import sqlite3
from datetime import date


def required_years(connection: sqlite3.Connection) -> set[int]:
    years: set[int] = set()

    for starts_on, ends_on in connection.execute(
        "SELECT valid_from, valid_until FROM weekly_activities"
    ):
        first_year = date.fromisoformat(starts_on).year
        last_year = date.fromisoformat(ends_on).year

        if first_year > last_year:
            raise RuntimeError("Un horario tiene un rango de fechas inválido.")

        years.update(range(first_year, last_year + 1))

    return years


def validate_cached_holidays(connection: sqlite3.Connection) -> None:
    years = required_years(connection)
    tables = {
        row[0]
        for row in connection.execute(
            "SELECT name FROM sqlite_master WHERE type = 'table'"
        )
    }

    if not {"holidays", "holiday_sync"}.issubset(tables):
        raise RuntimeError(
            "Faltan las tablas de feriados. "
            "Ejecuta vp run data:sync-holidays antes de exportar."
        )

    cached_years = {
        row[0]
        for row in connection.execute(
            """
            SELECT year
            FROM holiday_sync
            WHERE EXISTS (
                SELECT 1
                FROM holidays
                WHERE substr(date, 1, 4) = CAST(holiday_sync.year AS TEXT)
            )
            """
        )
    }

    missing = years - cached_years

    if missing:
        labels = ", ".join(str(year) for year in sorted(missing))
        raise RuntimeError(
            f"No hay feriados sincronizados para: {labels}. "
            "Ejecuta vp run data:sync-holidays. "
            "Si la API no publica esos años, conserva o restaura "
            "su cobertura en agenda.sqlite."
        )

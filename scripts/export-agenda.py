import json
import sqlite3
from pathlib import Path

from sync_holidays import sync_holidays

root = Path(__file__).resolve().parent.parent
database = root / "database" / "agenda.sqlite"
output = root / "src" / "data" / "agenda.generated.ts"

if not database.is_file():
    raise SystemExit("No existe database/agenda.sqlite. Crea primero la base.")

queries = {
    "periods": """
        SELECT id, name AS label, timezone, semester_end AS semesterEnd
        FROM academic_periods
        ORDER BY id DESC
    """,
    "schedules": """
        SELECT
            id, period_id AS periodId, name, type, weekday,
            start_time AS startTime, end_time AS endTime,
            responsible_name AS responsibleName,
            responsible_role AS responsibleRole,
            location, valid_from AS validFrom, valid_until AS validUntil
        FROM weekly_activities
        ORDER BY weekday, start_time, id
    """,
    "academicDates": """
        SELECT
            id, period_id AS periodId, title,
            starts_on AS startsOn, ends_on AS endsOn,
            featured, source
        FROM academic_dates
        ORDER BY starts_on, id
    """,
    "holidays": """
        SELECT date, name, source
        FROM holidays
        ORDER BY date
    """,
}

try:
    with sqlite3.connect(
        f"{database.resolve().as_uri()}?mode=rw",
        uri=True,
    ) as connection:
        if connection.execute("PRAGMA integrity_check").fetchone()[0] != "ok":
            raise RuntimeError(
                "La base de datos no pasó la comprobación de integridad."
            )

        if connection.execute("PRAGMA foreign_key_check").fetchall():
            raise RuntimeError("La base tiene referencias inválidas.")

        sync_holidays(connection)
        connection.row_factory = sqlite3.Row

        sections = [
            "// Archivo generado desde SQLite. No editar manualmente.",
        ]

        for name, query in queries.items():
            rows = [dict(row) for row in connection.execute(query)]
            serialized = json.dumps(rows, ensure_ascii=False, indent=2)
            sections.append(f"export const {name} = {serialized} as const;")

except (RuntimeError, sqlite3.Error) as error:
    raise SystemExit(str(error)) from error

content = "\n\n".join(sections) + "\n"
output.parent.mkdir(parents=True, exist_ok=True)

if not output.exists() or output.read_text(encoding="utf-8") != content:
    output.write_text(content, encoding="utf-8")

print("Agenda y feriados exportados desde SQLite.")

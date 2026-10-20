import json
import sqlite3
import sys
from datetime import date, datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from holiday_cache import required_years, validate_cached_holidays

API_URL = "https://api.boostr.cl/holidays.json"


def fetch_holidays() -> dict[int, dict[str, str]]:
    request = Request(
        API_URL,
        headers={
            "Accept": "application/json",
            "User-Agent": "OpenUCSH-Agenda/1.0",
        },
    )

    with urlopen(request, timeout=20) as response:
        payload = json.load(response)

    if not isinstance(payload, dict) or payload.get("status") != "success":
        raise ValueError("La API no devolvió una respuesta exitosa.")

    data = payload.get("data")

    if not isinstance(data, list) or not data:
        raise ValueError("La API no devolvió feriados.")

    grouped: dict[int, dict[str, str]] = {}

    for item in data:
        if not isinstance(item, dict):
            raise ValueError("La API devolvió un registro inválido.")

        raw_date = item.get("date")
        title = item.get("title")

        if not isinstance(raw_date, str) or not isinstance(title, str):
            raise ValueError("Un feriado no tiene fecha o nombre válido.")

        holiday_date = date.fromisoformat(raw_date)

        if holiday_date.isoformat() != raw_date or not title.strip():
            raise ValueError("Un feriado tiene formato inválido.")

        yearly_dates = grouped.setdefault(holiday_date.year, {})

        if raw_date in yearly_dates and yearly_dates[raw_date] != title.strip():
            raise ValueError("La API devolvió nombres contradictorios.")

        yearly_dates[raw_date] = title.strip()

    # Evita reemplazar los datos por una respuesta evidentemente incompleta.
    if any(len(items) < 10 for items in grouped.values()):
        raise ValueError("La respuesta anual parece incompleta.")

    return grouped


def sync_holidays(connection: sqlite3.Connection) -> None:
    connection.executescript(
        """
        CREATE TABLE IF NOT EXISTS holidays (
            date TEXT PRIMARY KEY,
            name TEXT NOT NULL CHECK (length(trim(name)) > 0),
            source TEXT NOT NULL,
            CHECK (length(date) = 10 AND date(date) IS NOT NULL)
        ) STRICT;

        CREATE TABLE IF NOT EXISTS holiday_sync (
            year INTEGER PRIMARY KEY,
            synced_at TEXT NOT NULL
        ) STRICT;
        """
    )

    years = required_years(connection)

    if not years:
        print("No hay horarios que requieran feriados.")
        return

    try:
        grouped = fetch_holidays()
    except (HTTPError, URLError, TimeoutError, OSError, ValueError) as error:
        print(
            f"No se pudieron actualizar los feriados: {error}",
            file=sys.stderr,
        )
    else:
        synced_at = datetime.now(timezone.utc).isoformat()

        with connection:
            for year, items in grouped.items():
                connection.execute(
                    "DELETE FROM holidays WHERE substr(date, 1, 4) = ?",
                    (str(year),),
                )

                connection.executemany(
                    """
                    INSERT INTO holidays (date, name, source)
                    VALUES (?, ?, ?)
                    """,
                    [
                        (holiday_date, title, API_URL)
                        for holiday_date, title in sorted(items.items())
                    ],
                )

                connection.execute(
                    """
                    INSERT INTO holiday_sync (year, synced_at)
                    VALUES (?, ?)
                    ON CONFLICT(year) DO UPDATE SET
                        synced_at = excluded.synced_at
                    """,
                    (year, synced_at),
                )

        print("Feriados actualizados desde Boostr.")

    validate_cached_holidays(connection)

    print("Cobertura de feriados disponible para los horarios publicados.")


if __name__ == "__main__":
    root = Path(__file__).resolve().parent.parent
    database = root / "database" / "agenda.sqlite"

    if not database.is_file():
        raise SystemExit("No existe database/agenda.sqlite.")

    try:
        with sqlite3.connect(
            f"{database.resolve().as_uri()}?mode=rw",
            uri=True,
        ) as connection:
            sync_holidays(connection)
    except (RuntimeError, sqlite3.Error) as error:
        raise SystemExit(str(error)) from error

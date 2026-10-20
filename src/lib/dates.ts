export function dateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function parseDateKey(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Formato de fecha inválido: ${value}.`);
  }

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime()) || dateKey(date) !== value) {
    throw new Error(`Fecha inválida: ${value}.`);
  }

  return date;
}

export function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount, 12);
}

export function startOfWeek(date: Date): Date {
  return addDays(date, -((date.getDay() + 6) % 7));
}

export function getDateInTimezone(timezone: string, now: Date = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);

  function part(type: string): number {
    const value = parts.find((item) => item.type === type)?.value;

    if (!value) {
      throw new Error(`No se pudo obtener la fecha: ${type}.`);
    }

    return Number(value);
  }

  return new Date(part("year"), part("month") - 1, part("day"), 12);
}

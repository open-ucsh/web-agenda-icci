const LOWERCASE_PARTICLES = new Set([
  "de",
  "del",
  "la",
  "las",
  "los",
  "y",
  "da",
  "das",
  "do",
  "dos",
  "van",
  "von",
]);

function formatName(value: string): string {
  return value
    .normalize("NFC")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => {
      const lower = word.toLocaleLowerCase("es-CL");

      if (index > 0 && LOWERCASE_PARTICLES.has(lower)) {
        return lower;
      }

      return lower.replace(
        /(^|[-'’])(\p{L})/gu,
        (_match: string, separator: string, letter: string) =>
          separator + letter.toLocaleUpperCase("es-CL"),
      );
    })
    .join(" ");
}

export function formatResponsibleNames(value: string): string {
  const names = value
    .split(/[;|\r\n]+/)
    .map(formatName)
    .filter(Boolean);

  const seen = new Set<string>();

  return names
    .filter((name) => {
      const key = name.toLocaleLowerCase("es-CL");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join(", ");
}

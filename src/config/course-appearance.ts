interface CourseAppearance {
  accent: string;
  background: string;
  border: string;
}

const PALETTE = [
  { accent: "#2563eb", background: "#edf3ff", border: "#d7e5ff" },
  { accent: "#087f8c", background: "#eaf6f5", border: "#cfeae8" },
  { accent: "#c26045", background: "#fff0e9", border: "#f5dcd0" },
  { accent: "#b54a72", background: "#fbeef3", border: "#f2d9e3" },
  { accent: "#a67516", background: "#fcf5e7", border: "#eee1bf" },
  { accent: "#347c59", background: "#edf6ef", border: "#d4e9da" },
] as const satisfies readonly CourseAppearance[];

const COURSE_COLORS: Readonly<Record<string, number>> = {
  ICC201: 0,
  ICC202: 1,
  ICC203: 2,
  ICC205: 3,
  ICC204: 4,
};

export function getCourseAppearance(code: string): CourseAppearance {
  const normalized = code.trim().toUpperCase();
  let hash = 0;

  for (const character of normalized) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  const index = COURSE_COLORS[normalized] ?? hash % PALETTE.length;
  return PALETTE[index] ?? PALETTE[0];
}

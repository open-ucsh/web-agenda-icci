import { describe, expect, it } from "vite-plus/test";

import { decodeOfferingFile, parseOfferingSchedule } from "./course-offering-import";

describe("parseOfferingSchedule", () => {
  it("reads multiple days, accents and rooms", () => {
    const result = parseOfferingSchedule(
      "Miércoles:15:20-16:40 (Carmen 350-E50  ) | Jueves:11:30-12:50 (Carmen 350-E80)",
    );

    expect(result.issues).toEqual([]);
    expect(result.blocks).toEqual([
      { day: 3, startMinutes: 920, endMinutes: 1000, room: "Carmen 350-E50" },
      { day: 4, startMinutes: 690, endMinutes: 770, room: "Carmen 350-E80" },
    ]);
  });

  it("keeps valid blocks while flagging invalid ones", () => {
    const result = parseOfferingSchedule(
      "Lunes:08:30-09:50 (Sala 1) | Martes:25:00-26:00 (Sala 2) | desconocido",
    );
    expect(result.blocks).toHaveLength(1);
    expect(result.issues).toHaveLength(2);
  });

  it("does not interpret missing schedules as free time", () => {
    expect(parseOfferingSchedule("Sin Horario").issues).toHaveLength(1);
    expect(parseOfferingSchedule("").issues).toHaveLength(1);
  });

  it("rejects unknown days and reversed intervals", () => {
    expect(parseOfferingSchedule("Otro:08:30-09:50").issues).toHaveLength(1);
    expect(parseOfferingSchedule("Lunes:10:00-09:00").issues).toHaveLength(1);
  });
});

describe("decodeOfferingFile", () => {
  it("reads UTF-8", () => {
    const bytes = new TextEncoder().encode("Miércoles");
    expect(decodeOfferingFile(bytes.buffer)).toBe("Miércoles");
  });

  it("falls back to Windows-1252", () => {
    const bytes = new Uint8Array([0x4d, 0x69, 0xe9, 0x72, 0x63, 0x6f, 0x6c, 0x65, 0x73]);
    expect(decodeOfferingFile(bytes.buffer)).toBe("Miércoles");
  });

  it("rejects binary Excel formats", () => {
    expect(() => decodeOfferingFile(new Uint8Array([0x50, 0x4b, 3, 4]).buffer)).toThrow(
      "Excel binario",
    );
    expect(() => decodeOfferingFile(new Uint8Array([0xd0, 0xcf, 0x11, 0xe0]).buffer)).toThrow(
      "Excel binario",
    );
  });
});

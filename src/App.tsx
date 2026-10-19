import { useState } from "react";

import { type AcademicPeriod, Navbar } from "@/components/Navbar";

const PERIODS: readonly AcademicPeriod[] = [
  {
    id: "2026-2",
    label: "2026 · Segundo semestre",
  },
];

export default function App() {
  const [selectedPeriod, setSelectedPeriod] = useState("2026-2");

  return (
    <div className="min-h-dvh bg-background text-text">
      <Navbar
        onPeriodChange={setSelectedPeriod}
        periods={PERIODS}
        selectedPeriod={selectedPeriod}
      />
    </div>
  );
}

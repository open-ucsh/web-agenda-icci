import { CalendarDays } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-dvh bg-background text-text">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center gap-3 px-4 sm:px-6">
          <CalendarDays aria-hidden="true" className="size-6 text-brand" />

          <span className="text-lg font-semibold tracking-tight">Agenda ICCI</span>

          <span className="hidden text-sm text-muted sm:inline">por Open UCSH</span>
        </div>
      </header>

      <main className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6">
        <h1 className="text-xl font-semibold tracking-tight">Apoyo académico</h1>

        <p className="mt-2 text-sm text-muted">Mentorías PACE, mentorías y ayudantías de ICCI.</p>
      </main>
    </div>
  );
}

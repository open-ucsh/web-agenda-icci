import { CalendarDays, ChevronDown, CircleHelp, GraduationCap, Layers3, X } from "lucide-react";
import { useId, useRef } from "react";

import { AcademicDates } from "@/components/calendar/AcademicDates";
import { Dialog } from "@/components/ui/Dialog";
import type { AppView } from "@/hooks/use-app-view";

import styles from "./Navbar.module.css";

export interface AcademicPeriod {
  id: string;
  label: string;
}

interface NavbarProps {
  view: AppView;
  periods: readonly AcademicPeriod[];
  selectedPeriod: string;
  onPeriodChange: (periodId: string) => void;
}

const NAVIGATION = [
  { id: "agenda", href: "#agenda", label: "Agenda", Icon: CalendarDays },
  { id: "curriculum", href: "#malla", label: "Mi malla", Icon: GraduationCap },
  {
    id: "planner",
    href: "#semestre",
    label: "Planificar semestre",
    Icon: Layers3,
  },
] as const;

function compactPeriodLabel(period: AcademicPeriod): string {
  const match = /^(\d{4})-([12])$/.exec(period.id);

  return match ? `${match[1]} · ${match[2]}.º semestre` : period.label;
}

export function Navbar({ periods, selectedPeriod, onPeriodChange, view }: NavbarProps) {
  const periodId = useId();
  const helpTitleId = useId();
  const helpRef = useRef<HTMLDialogElement>(null);
  const helpButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <a aria-label="Agenda ICCI, ir a la agenda" className={styles.brand} href="#agenda">
          <img
            alt=""
            className={styles.logo}
            height={40}
            src={`${import.meta.env.BASE_URL}logo.png`}
            width={40}
          />
          <h1 className={styles.brandName}>Agenda ICCI</h1>
        </a>

        <nav aria-label="Navegación principal" className={styles.navigation}>
          {NAVIGATION.map(({ id, href, label, Icon }) => (
            <a
              aria-current={view === id ? "page" : undefined}
              className={styles.link}
              href={href}
              key={id}
            >
              <Icon aria-hidden="true" className={styles.navigationIcon} />
              <span>{label}</span>
            </a>
          ))}
        </nav>

        <div className={styles.tools}>
          <div className={styles.period}>
            <label className="sr-only" htmlFor={periodId}>
              Período académico
            </label>
            <select
              className={styles.select}
              id={periodId}
              onChange={(event) => onPeriodChange(event.currentTarget.value)}
              value={selectedPeriod}
            >
              {periods.map((period) => (
                <option key={period.id} value={period.id}>
                  {compactPeriodLabel(period)}
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden="true" className={styles.chevron} />
          </div>

          <div className={styles.dates}>
            <AcademicDates periodId={selectedPeriod} />
          </div>
        </div>

        <button
          aria-haspopup="dialog"
          aria-label="Cómo usar Agenda ICCI"
          className={styles.help}
          onClick={() => helpRef.current?.showModal()}
          ref={helpButtonRef}
          title="Ayuda"
          type="button"
        >
          <CircleHelp aria-hidden="true" />
        </button>
      </div>

      <Dialog
        aria-labelledby={helpTitleId}
        dialogRef={helpRef}
        restoreFocusRef={helpButtonRef}
        size="small"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-3">
          <h2 className="text-base font-semibold text-brand" id={helpTitleId}>
            Cómo usar Agenda ICCI
          </h2>
          <button
            aria-label="Cerrar ayuda"
            className={styles.close}
            onClick={() => helpRef.current?.close()}
            type="button"
          >
            <X aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 space-y-4 overflow-y-auto p-5 text-sm leading-6 text-muted">
          <p>
            <strong className="font-semibold text-brand">Agenda.</strong> Consulta tus clases y las
            actividades de apoyo. Cambia de semana, vuelve a Hoy o usa los filtros para elegir qué
            mostrar.
          </p>
          <p>
            <strong className="font-semibold text-brand">Mi malla.</strong> Selecciona un ramo para
            actualizar su estado y consultar sus prerrequisitos.
          </p>
          <p>
            <strong className="font-semibold text-brand">Planificar semestre.</strong> Sube la
            oferta académica, elige tus ramos y compara horarios sin topes. Al confirmar un horario
            para la agenda, sus ramos se marcan como cursando.
          </p>
          <p>
            <strong className="font-semibold text-brand">Fechas importantes.</strong> Revisa los
            hitos del período académico seleccionado.
          </p>
          <a
            className="inline-block rounded font-medium text-brand underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            href="https://github.com/open-ucsh"
            rel="noreferrer"
            target="_blank"
          >
            Un proyecto de Open UCSH
          </a>
        </div>
      </Dialog>
    </header>
  );
}

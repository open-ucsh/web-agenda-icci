import {
  ArrowRight,
  ChevronRight,
  Download,
  FileSpreadsheet,
  LockKeyhole,
  Upload,
} from "lucide-react";
import { useId } from "react";

import styles from "./OfferingImportGuide.module.css";

interface OfferingImportGuideProps {
  loading: boolean;
  onSelectFile: () => void;
}

export function OfferingImportGuide({ loading, onSelectFile }: OfferingImportGuideProps) {
  const id = useId();

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <header className={styles.header}>
          <h2 className={styles.title}>Armar semestre</h2>
          <p className={styles.subtitle}>Importa la oferta de tu carrera para empezar.</p>
        </header>

        <div className={styles.panel}>
          <section aria-labelledby={`${id}-guide`} className={styles.guide}>
            <h3 className={styles.sectionTitle} id={`${id}-guide`}>
              Descarga tu oferta
            </h3>

            <ol className={styles.steps}>
              <li className={styles.step}>
                <span aria-hidden="true" className={styles.number}>
                  1
                </span>
                <div className={styles.stepContent}>
                  <h4 className={styles.stepTitle}>Entra a Zona Estudiantes</h4>
                  <p className={styles.description}>
                    Inicia sesión desde la web de la UCSH y abre la oferta académica en tu perfil.
                  </p>

                  <p className={styles.path}>
                    <span>Zona Estudiantes</span>
                    <ChevronRight aria-hidden="true" />
                    <span>Perfil</span>
                    <ChevronRight aria-hidden="true" />
                    <strong>Oferta académica</strong>
                  </p>
                </div>
              </li>

              <li className={styles.step}>
                <span aria-hidden="true" className={styles.number}>
                  2
                </span>
                <div className={styles.stepContent}>
                  <h4 className={styles.stepTitle}>Selecciona tu carrera</h4>
                  <p className={styles.description}>
                    Usa estos datos para consultar la oferta correspondiente.
                  </p>

                  <dl className={styles.selection}>
                    <div>
                      <dt>Facultad</dt>
                      <dd>Ingeniería y Empresas</dd>
                    </div>
                    <div>
                      <dt>Escuela</dt>
                      <dd>Ingeniería</dd>
                    </div>
                    <div>
                      <dt>Carrera</dt>
                      <dd>Ingeniería Civil en Computación e Informática</dd>
                    </div>
                  </dl>
                </div>
              </li>

              <li className={styles.step}>
                <span aria-hidden="true" className={styles.number}>
                  3
                </span>
                <div className={styles.stepContent}>
                  <h4 className={styles.stepTitle}>Descarga el reporte</h4>
                  <p className={styles.description}>
                    Elige el período que quieres planificar y pulsa
                    <strong> Exportar a Excel</strong> en Zona Estudiantes.
                  </p>

                  <p className={styles.exportHint}>
                    <Download aria-hidden="true" />
                    Guarda el archivo .xls en tu dispositivo
                  </p>
                </div>
              </li>
            </ol>
          </section>

          <section aria-labelledby={`${id}-upload`} className={styles.upload}>
            <div className={styles.uploadContent}>
              <div aria-hidden="true" className={styles.fileIcon}>
                <FileSpreadsheet />
                <span>.XLS</span>
              </div>

              <h3 className={styles.uploadTitle} id={`${id}-upload`}>
                Sube el archivo aquí
              </h3>
              <p className={styles.uploadDescription}>
                Usaremos los ramos, secciones y horarios de tu oferta.
              </p>

              <button
                aria-describedby={`${id}-format`}
                className={styles.uploadButton}
                disabled={loading}
                onClick={onSelectFile}
                type="button"
              >
                <Upload aria-hidden="true" />
                {loading ? "Leyendo archivo…" : "Seleccionar archivo"}
              </button>

              <p className={styles.format} id={`${id}-format`}>
                .xls · Máximo 5 MB
              </p>
            </div>
          </section>

          <footer className={styles.footer}>
            <p>
              <LockKeyhole aria-hidden="true" />
              Tu archivo se procesa en este navegador.
            </p>
            <p>Tu avance se mantiene en Mi malla.</p>
          </footer>
        </div>

        <ol aria-label="Cómo funciona el planificador" className={styles.flow}>
          <li>
            <span className={styles.currentNumber}>1</span>
            <strong>Importa tu oferta</strong>
          </li>
          <li aria-hidden="true" className={styles.arrow}>
            <ArrowRight />
          </li>
          <li>
            <span>2</span>Elige tus ramos
          </li>
          <li aria-hidden="true" className={styles.arrow}>
            <ArrowRight />
          </li>
          <li>
            <span>3</span>Lleva tu horario a la agenda
          </li>
        </ol>
      </div>
    </div>
  );
}

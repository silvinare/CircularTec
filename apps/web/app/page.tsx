import { CertificateVerify } from '../components/certificate-verify';
import { PilotFlow } from '../components/pilot-flow';

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <h1>CircularTec - MVP Piloto</h1>
        <p>Gestion de lotes, operaciones, certificacion digital y trazabilidad.</p>
      </section>

      <section className="cards">
        <article className="card">
          <small>Meta anual</small>
          <h3>200 operaciones</h3>
          <p>Operaciones registradas y certificadas.</p>
        </article>
        <article className="card">
          <small>Meta anual</small>
          <h3>150-300 t</h3>
          <p>Volumen de residuos trazados.</p>
        </article>
        <article className="card">
          <small>Actores</small>
          <h3>20-30 / 5-8</h3>
          <p>Generadores y recolectores activos.</p>
        </article>
      </section>

      <PilotFlow />
      <CertificateVerify />
    </main>
  );
}

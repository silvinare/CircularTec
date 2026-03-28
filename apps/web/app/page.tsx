import { CertificateVerify } from '../components/certificate-verify';
import { LiveKpis } from '../components/live-kpis';
import { PilotFlow } from '../components/pilot-flow';

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <h1>CircularTec - MVP Piloto</h1>
        <p>Gestion de lotes, operaciones, certificacion digital y trazabilidad.</p>
      </section>

      <LiveKpis />

      <PilotFlow />
      <CertificateVerify />
    </main>
  );
}

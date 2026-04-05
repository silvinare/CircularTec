'use client';

import { useEffect, useState } from 'react';

type RoleTokens = {
  admin: string;
  generator: string;
  collector: string;
};

type DashboardSummary = {
  period: {
    publishedLots: number;
    recoveredKg: number;
    recoveredTon: number;
    activeGenerators: number;
    activeCollectors: number;
    operationsClosed: number;
    verifiedCertificates: number;
    certificationCoveragePct: number;
    byWaste: Array<{
      wasteType: string;
      quantityKg: number;
    }>;
  };
  backlog: {
    lotsPendingAssignment: number;
    lotsInProgress: number;
    operationsPendingConfirmation: number;
    operationsReadyToClose: number;
    closedWithoutCertificate: number;
  };
};

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
}

async function fetchSummary(token: string, from?: string, to?: string): Promise<DashboardSummary> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);

  const query = params.toString();
  const response = await fetch(`${apiBase()}/dashboard/summary${query ? `?${query}` : ''}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || 'No se pudo cargar dashboard.');
  }

  return payload as DashboardSummary;
}

export function LiveKpis() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  async function load(range?: { from: string; to: string }) {
    setLoading(true);
    setError('');

    try {
      const raw = window.localStorage.getItem('circulartec_demo_tokens');
      if (!raw) {
        setSummary(null);
        setError('Inicia sesion demo para ver KPI en vivo.');
        return;
      }

      const parsed = JSON.parse(raw) as RoleTokens;
      const fromIso = range?.from ? new Date(`${range.from}T00:00:00.000Z`).toISOString() : undefined;
      const toIso = range?.to ? new Date(`${range.to}T23:59:59.999Z`).toISOString() : undefined;
      const result = await fetchSummary(parsed.admin, fromIso, toIso);
      setSummary(result);
    } catch (err) {
      setSummary(null);
      setError(err instanceof Error ? err.message : 'No se pudo cargar dashboard.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const now = new Date();
    const start = new Date();
    start.setDate(now.getDate() - 30);
    const from = start.toISOString().slice(0, 10);
    const to = now.toISOString().slice(0, 10);
    setFromDate(from);
    setToDate(to);

    void load({ from, to });

    const onStorage = () => {
      void load({ from, to });
    };

    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return (
    <section className="cards cards-live">
      <article className="card">
        <small>Lotes publicados</small>
        <h3>{summary ? summary.period.publishedLots : '-'}</h3>
        <p>Ingresados en el periodo seleccionado.</p>
      </article>
      <article className="card">
        <small>Residuos recuperados</small>
        <h3>{summary ? `${summary.period.recoveredTon} t` : '-'}</h3>
        <p>{summary ? `${summary.period.recoveredKg} kg recolectados.` : 'Inicia sesion para ver datos.'}</p>
      </article>
      <article className="card">
        <small>Operaciones cerradas</small>
        <h3>{summary ? summary.period.operationsClosed : '-'}</h3>
        <p>Cerradas y listas para sustentar impacto.</p>
      </article>
      <article className="card">
        <small>Certificados verificados</small>
        <h3>{summary ? summary.period.verifiedCertificates : '-'}</h3>
        <p>Con trazabilidad digital validada.</p>
      </article>
      <article className="card">
        <small>Cobertura certificada</small>
        <h3>{summary ? `${summary.period.certificationCoveragePct}%` : '-'}</h3>
        <p>Operaciones cerradas que ya tienen certificado verificado.</p>
      </article>
      <article className="card">
        <small>Actores activos</small>
        <h3>{summary ? `${summary.period.activeGenerators} / ${summary.period.activeCollectors}` : '-'}</h3>
        <p>Generadores / recolectores con retiros en el periodo.</p>
      </article>

      <article className="card card-wide">
        <small>Impacto por residuo</small>
        {summary && summary.period.byWaste.length > 0 ? (
          <ul className="kpi-list">
            {summary.period.byWaste.map((item) => (
              <li key={item.wasteType}>
                <strong>{item.wasteType}</strong>: {item.quantityKg} kg
              </li>
            ))}
          </ul>
        ) : (
          <p>Sin datos por residuo todavia.</p>
        )}
      </article>

      <article className="card card-wide">
        <small>Backlog operativo actual</small>
        {summary ? (
          <ul className="kpi-list kpi-list-plain">
            <li>
              <strong>{summary.backlog.lotsPendingAssignment}</strong> lotes esperando asignacion
            </li>
            <li>
              <strong>{summary.backlog.lotsInProgress}</strong> lotes en gestion
            </li>
            <li>
              <strong>{summary.backlog.operationsPendingConfirmation}</strong> operaciones pendientes de confirmacion
            </li>
            <li>
              <strong>{summary.backlog.operationsReadyToClose}</strong> operaciones listas para cierre
            </li>
            <li>
              <strong>{summary.backlog.closedWithoutCertificate}</strong> cierres sin certificado verificado
            </li>
          </ul>
        ) : (
          <p>Inicia sesion para ver el estado actual de la operacion.</p>
        )}
      </article>

      <article className="card card-actions">
        <small>Dashboard</small>
        <label htmlFor="from-date">Desde</label>
        <input id="from-date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <label htmlFor="to-date">Hasta</label>
        <input id="to-date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        <button type="button" onClick={() => void load({ from: fromDate, to: toDate })} disabled={loading}>
          {loading ? 'Actualizando...' : 'Actualizar KPI'}
        </button>
        {error ? <p className="kpi-error">{error}</p> : null}
      </article>
    </section>
  );
}

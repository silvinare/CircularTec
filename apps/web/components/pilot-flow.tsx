'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type WasteType = {
  id: string;
  code: string;
  name: string;
};

type Lot = {
  id: string;
  publicCode: string;
  status: 'PUBLISHED' | 'ASSIGNED' | 'COLLECTED' | 'CLOSED' | 'CANCELLED';
  estimatedQuantityKg: number;
  wasteType: {
    name: string;
  };
};

type Operation = {
  id: string;
  status: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'CLOSED';
  certificate: null | {
    publicVerificationCode: string;
  };
};

const DEMO_CONTEXT = {
  generator: {
    role: 'OPERADOR_GENERADOR',
    userId: '22222222-2222-2222-2222-222222222222',
    organizationId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
  },
  collector: {
    role: 'OPERADOR_RECOLECTOR',
    userId: '33333333-3333-3333-3333-333333333333',
    organizationId: 'cccccccc-cccc-cccc-cccc-cccccccccccc'
  },
  admin: {
    role: 'ADMIN_MUNICIPIO',
    userId: '11111111-1111-1111-1111-111111111111',
    organizationId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  }
} as const;

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
}

async function request<T>(
  path: string,
  options: RequestInit,
  context: (typeof DEMO_CONTEXT)[keyof typeof DEMO_CONTEXT]
): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-role': context.role,
      'x-user-id': context.userId,
      'x-organization-id': context.organizationId,
      ...(options.headers || {})
    }
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || 'Error de API');
  }

  return payload as T;
}

export function PilotFlow() {
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [quantity, setQuantity] = useState('120');
  const [wasteTypeId, setWasteTypeId] = useState('');
  const [address, setAddress] = useState('Av. Circular 123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [publicCodes, setPublicCodes] = useState<string[]>([]);

  const fallbackType = useMemo(() => wasteTypes[0]?.id || '', [wasteTypes]);

  async function loadLots() {
    const list = await request<Lot[]>('/lots', { method: 'GET' }, DEMO_CONTEXT.admin);
    setLots(list);
  }

  async function loadWasteTypes() {
    const list = await request<WasteType[]>('/waste-types', { method: 'GET' }, DEMO_CONTEXT.admin);
    setWasteTypes(list);
    if (!wasteTypeId && list[0]?.id) {
      setWasteTypeId(list[0].id);
    }
  }

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        await Promise.all([loadWasteTypes(), loadLots()]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el estado inicial.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function createLot(event: FormEvent) {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      setInfo('');

      const now = new Date();
      const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      await request('/lots', {
        method: 'POST',
        body: JSON.stringify({
          wasteTypeId: wasteTypeId || fallbackType,
          estimatedQuantityKg: Number(quantity),
          address,
          pickupWindowStart: now.toISOString(),
          pickupWindowEnd: end.toISOString()
        })
      }, DEMO_CONTEXT.generator);

      await loadLots();
      setInfo('Lote creado correctamente.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el lote.');
    } finally {
      setLoading(false);
    }
  }

  async function assignLot(lotId: string) {
    try {
      setLoading(true);
      setError('');
      await request(`/lots/${lotId}/assign`, { method: 'POST' }, DEMO_CONTEXT.collector);
      await loadLots();
      setInfo('Lote asignado a recolector demo.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo asignar el lote.');
    } finally {
      setLoading(false);
    }
  }

  async function collectLot(lotId: string) {
    try {
      setLoading(true);
      setError('');
      await request(`/operations/${lotId}/collect`, {
        method: 'POST',
        body: JSON.stringify({
          collectedQuantityKg: 100,
          collectedAt: new Date().toISOString()
        })
      }, DEMO_CONTEXT.collector);

      await loadLots();
      setInfo('Recoleccion registrada.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar la recoleccion.');
    } finally {
      setLoading(false);
    }
  }

  async function closeLot(lotId: string) {
    try {
      setLoading(true);
      setError('');

      const operation = await request<Operation>(`/operations/by-lot/${lotId}`, { method: 'GET' }, DEMO_CONTEXT.admin);

      await request(`/operations/${operation.id}/evidences`, {
        method: 'POST',
        body: JSON.stringify({
          fileUrl: 'https://picsum.photos/seed/circulartec/600/400',
          fileType: 'PHOTO'
        })
      }, DEMO_CONTEXT.collector);

      await request(`/operations/${lotId}/close`, {
        method: 'POST',
        body: JSON.stringify({ operationId: operation.id })
      }, DEMO_CONTEXT.admin);

      const operationUpdated = await request<Operation>(`/operations/by-lot/${lotId}`, { method: 'GET' }, DEMO_CONTEXT.admin);
      const code = operationUpdated.certificate?.publicVerificationCode;
      if (code) {
        setPublicCodes((prev) => [code, ...prev.filter((item) => item !== code)].slice(0, 5));
      }

      await loadLots();
      setInfo('Operacion cerrada y certificado emitido.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cerrar la operacion.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flow">
      <h2>Operacion Piloto (demo)</h2>
      <p>
        Esta seccion usa identidades demo seed para ejecutar el flujo: crear lote, asignar, recolectar y cerrar.
      </p>

      <form className="flow-form" onSubmit={createLot}>
        <label htmlFor="waste">Tipo de residuo</label>
        <select id="waste" value={wasteTypeId} onChange={(e) => setWasteTypeId(e.target.value)}>
          {wasteTypes.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name} ({w.code})
            </option>
          ))}
        </select>

        <label htmlFor="qty">Cantidad estimada (kg)</label>
        <input id="qty" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" required />

        <label htmlFor="addr">Direccion de retiro</label>
        <input id="addr" value={address} onChange={(e) => setAddress(e.target.value)} required />

        <button type="submit" disabled={loading}>Crear lote (Generador)</button>
      </form>

      {error && <p className="feedback error">{error}</p>}
      {info && <p className="feedback ok">{info}</p>}

      <div className="flow-list">
        <h3>Lotes</h3>
        {loading && lots.length === 0 ? <p>Cargando...</p> : null}
        {lots.length === 0 ? <p>Sin lotes todavia.</p> : null}

        {lots.map((lot) => (
          <article key={lot.id} className="flow-item">
            <div>
              <strong>{lot.publicCode}</strong>
              <p>
                {lot.wasteType.name} | {lot.estimatedQuantityKg} kg | Estado: <b>{lot.status}</b>
              </p>
            </div>
            <div className="flow-actions">
              {lot.status === 'PUBLISHED' ? (
                <button type="button" onClick={() => void assignLot(lot.id)} disabled={loading}>
                  Asignar (Recolector)
                </button>
              ) : null}
              {lot.status === 'ASSIGNED' ? (
                <button type="button" onClick={() => void collectLot(lot.id)} disabled={loading}>
                  Registrar recoleccion
                </button>
              ) : null}
              {lot.status === 'COLLECTED' ? (
                <button type="button" onClick={() => void closeLot(lot.id)} disabled={loading}>
                  Cerrar + certificar
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      {publicCodes.length > 0 ? (
        <div className="codes">
          <h3>Codigos publicos recientes</h3>
          <ul>
            {publicCodes.map((code) => (
              <li key={code}>{code}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

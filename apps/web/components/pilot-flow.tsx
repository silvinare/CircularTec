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
  evidences: Array<{
    id: string;
    fileUrl: string;
    fileType: 'PHOTO' | 'DOCUMENT';
  }>;
  certificate: null | {
    publicVerificationCode: string;
  };
};

type LoginResult = {
  token: string;
};

type SessionMe = {
  email: string;
  fullName: string;
  role: string;
};

type RoleTokens = {
  admin: string;
  generator: string;
  collector: string;
};

class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

const DEMO_CREDENTIALS = {
  admin: { email: 'admin@circulartec.local', password: 'demo1234' },
  generator: { email: 'generador@circulartec.local', password: 'demo1234' },
  collector: { email: 'recolector@circulartec.local', password: 'demo1234' }
} as const;

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
}

function apiOrigin(): string {
  return apiBase().replace(/\/api\/v1$/, '');
}

function resolveEvidenceUrl(fileUrl: string): string {
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl;
  }

  return `${apiOrigin()}${fileUrl}`;
}

function readJwtExpiration(token: string): number | null {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;

    const normalized = base64.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(normalized)) as { exp?: number };
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit, token?: string): Promise<T> {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined)
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${apiBase()}${path}`, {
    ...options,
    headers
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = typeof payload === 'object' && payload && 'message' in payload
      ? String((payload as { message: unknown }).message)
      : 'Error de API';

    throw new ApiError(response.status, message);
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
  const [tokens, setTokens] = useState<RoleTokens | null>(null);
  const [sessionMe, setSessionMe] = useState<SessionMe | null>(null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [operationByLot, setOperationByLot] = useState<Record<string, Operation>>({});

  const fallbackType = useMemo(() => wasteTypes[0]?.id || '', [wasteTypes]);
  const remainingMinutes = useMemo(() => {
    if (!sessionExpiresAt) return null;
    const diff = sessionExpiresAt - now;
    if (diff <= 0) return 0;
    return Math.ceil(diff / 60000);
  }, [sessionExpiresAt, now]);

  function clearSession(message?: string) {
    setTokens(null);
    setSessionMe(null);
    setSessionExpiresAt(null);
    setLots([]);
    setWasteTypes([]);
    setEvidenceFile(null);
    setOperationByLot({});
    window.localStorage.removeItem('circulartec_demo_tokens');

    if (message) {
      setInfo('');
      setError(message);
    }
  }

  function handleApiError(err: unknown, fallbackMessage: string): string {
    if (err instanceof ApiError && err.statusCode === 401) {
      clearSession('Sesion expirada o invalida. Inicia sesion demo nuevamente.');
      return 'Sesion expirada o invalida. Inicia sesion demo nuevamente.';
    }

    if (err instanceof Error) {
      return err.message;
    }

    return fallbackMessage;
  }

  async function loadLots(adminToken?: string) {
    const token = adminToken || tokens?.admin;
    if (!token) return;

    const list = await request<Lot[]>('/lots', { method: 'GET' }, token);
    setLots(list);
  }

  async function loadWasteTypes(adminToken?: string) {
    const token = adminToken || tokens?.admin;
    if (!token) return;

    const list = await request<WasteType[]>('/waste-types', { method: 'GET' }, token);
    setWasteTypes(list);
    if (!wasteTypeId && list[0]?.id) {
      setWasteTypeId(list[0].id);
    }
  }

  async function loginAllDemoUsers() {
    setLoading(true);
    setError('');
    setInfo('');

    try {
      const [admin, generator, collector] = await Promise.all([
        request<LoginResult>('/auth/login', {
          method: 'POST',
          body: JSON.stringify(DEMO_CREDENTIALS.admin)
        }),
        request<LoginResult>('/auth/login', {
          method: 'POST',
          body: JSON.stringify(DEMO_CREDENTIALS.generator)
        }),
        request<LoginResult>('/auth/login', {
          method: 'POST',
          body: JSON.stringify(DEMO_CREDENTIALS.collector)
        })
      ]);

      const nextTokens = {
        admin: admin.token,
        generator: generator.token,
        collector: collector.token
      };

      setTokens(nextTokens);
      setSessionExpiresAt(readJwtExpiration(nextTokens.admin));

      const me = await request<SessionMe>('/auth/me', { method: 'GET' }, nextTokens.admin);
      setSessionMe(me);

      await Promise.all([loadWasteTypes(nextTokens.admin), loadLots(nextTokens.admin)]);
      setOperationByLot({});
      setInfo('Sesiones demo activas (admin/generador/recolector).');
    } catch (err) {
      setError(handleApiError(err, 'No se pudieron iniciar las sesiones demo.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const saved = window.localStorage.getItem('circulartec_demo_tokens');
    if (!saved) return;

    void (async () => {
      try {
        const parsed = JSON.parse(saved) as RoleTokens;
        const expiresAt = readJwtExpiration(parsed.admin);
        if (expiresAt && expiresAt <= Date.now()) {
          clearSession('Sesion expirada. Inicia sesion demo nuevamente.');
          return;
        }

        setTokens(parsed);
        setSessionExpiresAt(expiresAt);
        const me = await request<SessionMe>('/auth/me', { method: 'GET' }, parsed.admin);
        setSessionMe(me);
        await Promise.all([loadWasteTypes(parsed.admin), loadLots(parsed.admin)]);
      } catch {
        clearSession('No se pudo restaurar la sesion guardada.');
      }
    })();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 30000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!tokens) return;
    window.localStorage.setItem('circulartec_demo_tokens', JSON.stringify(tokens));
  }, [tokens]);

  useEffect(() => {
    if (!sessionExpiresAt || !tokens) return;
    if (sessionExpiresAt <= now) {
      clearSession('Sesion expirada. Inicia sesion demo nuevamente.');
    }
  }, [sessionExpiresAt, now, tokens]);

  async function createLot(event: FormEvent) {
    event.preventDefault();
    if (!tokens?.generator || !tokens?.admin) {
      setError('Primero inicia sesion demo.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setInfo('');

      const nowDate = new Date();
      const end = new Date(nowDate.getTime() + 2 * 60 * 60 * 1000);

      await request('/lots', {
        method: 'POST',
        body: JSON.stringify({
          wasteTypeId: wasteTypeId || fallbackType,
          estimatedQuantityKg: Number(quantity),
          address,
          pickupWindowStart: nowDate.toISOString(),
          pickupWindowEnd: end.toISOString()
        })
      }, tokens.generator);

      await loadLots(tokens.admin);
      setInfo('Lote creado correctamente.');
    } catch (err) {
      setError(handleApiError(err, 'No se pudo crear el lote.'));
    } finally {
      setLoading(false);
    }
  }

  async function assignLot(lotId: string) {
    if (!tokens?.collector || !tokens?.admin) {
      setError('Primero inicia sesion demo.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await request(`/lots/${lotId}/assign`, { method: 'POST' }, tokens.collector);
      await loadLots(tokens.admin);
      setInfo('Lote asignado a recolector demo.');
    } catch (err) {
      setError(handleApiError(err, 'No se pudo asignar el lote.'));
    } finally {
      setLoading(false);
    }
  }

  async function collectLot(lotId: string) {
    if (!tokens?.collector || !tokens?.admin) {
      setError('Primero inicia sesion demo.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await request(`/operations/${lotId}/collect`, {
        method: 'POST',
        body: JSON.stringify({
          collectedQuantityKg: 100,
          collectedAt: new Date().toISOString()
        })
      }, tokens.collector);

      await loadLots(tokens.admin);
      setInfo('Recoleccion registrada.');
    } catch (err) {
      setError(handleApiError(err, 'No se pudo registrar la recoleccion.'));
    } finally {
      setLoading(false);
    }
  }

  async function closeLot(lotId: string) {
    if (!tokens?.collector || !tokens?.admin) {
      setError('Primero inicia sesion demo.');
      return;
    }
    if (!evidenceFile) {
      setError('Adjunta un archivo de evidencia antes de cerrar la operacion.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const operation = await request<Operation>(`/operations/by-lot/${lotId}`, { method: 'GET' }, tokens.admin);
      const formData = new FormData();
      formData.append('file', evidenceFile);

      await request(`/operations/${operation.id}/evidences/upload`, {
        method: 'POST',
        body: formData
      }, tokens.collector);

      await request(`/operations/${lotId}/close`, {
        method: 'POST',
        body: JSON.stringify({ operationId: operation.id })
      }, tokens.admin);

      const operationUpdated = await request<Operation>(`/operations/by-lot/${lotId}`, { method: 'GET' }, tokens.admin);
      setOperationByLot((prev) => ({ ...prev, [lotId]: operationUpdated }));
      const code = operationUpdated.certificate?.publicVerificationCode;
      if (code) {
        setPublicCodes((prev) => [code, ...prev.filter((item) => item !== code)].slice(0, 5));
      }

      await loadLots(tokens.admin);
      setEvidenceFile(null);
      setInfo('Operacion cerrada y certificado emitido.');
    } catch (err) {
      setError(handleApiError(err, 'No se pudo cerrar la operacion.'));
    } finally {
      setLoading(false);
    }
  }

  async function loadOperationDetail(lotId: string) {
    if (!tokens?.admin) {
      setError('Primero inicia sesion demo.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const operation = await request<Operation>(`/operations/by-lot/${lotId}`, { method: 'GET' }, tokens.admin);
      setOperationByLot((prev) => ({ ...prev, [lotId]: operation }));
    } catch (err) {
      setError(handleApiError(err, 'No se pudo cargar el detalle de la operacion.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flow">
      <h2>Operacion Piloto (demo)</h2>
      <p>
        Este flujo usa autenticacion JWT real. Inicia sesion demo para operar como admin, generador y recolector.
      </p>

      <div className="flow-auth">
        <button type="button" onClick={() => void loginAllDemoUsers()} disabled={loading}>
          Iniciar sesion demo
        </button>
        <button
          type="button"
          onClick={() => {
            clearSession();
            setInfo('Sesion demo cerrada.');
            setError('');
          }}
          disabled={loading}
        >
          Cerrar sesion demo
        </button>
      </div>

      <div className="session-card">
        <strong>Estado de sesion</strong>
        {sessionMe ? (
          <p>
            {sessionMe.fullName} ({sessionMe.email}) | Rol: <b>{sessionMe.role}</b>
            {remainingMinutes !== null ? ` | Expira en ~${remainingMinutes} min` : ''}
          </p>
        ) : (
          <p>No hay sesion activa.</p>
        )}
      </div>

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

        <label htmlFor="evidence">Archivo de evidencia (para cerrar)</label>
        <input
          id="evidence"
          type="file"
          onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
          accept="image/*,.pdf,.doc,.docx"
        />

        <button type="submit" disabled={loading || !tokens}>Crear lote (Generador)</button>
      </form>

      {error && <p className="feedback error">{error}</p>}
      {info && <p className="feedback ok">{info}</p>}

      <div className="flow-list">
        <h3>Lotes</h3>
        {loading && lots.length === 0 ? <p>Cargando...</p> : null}
        {!loading && lots.length === 0 ? <p>Sin lotes todavia.</p> : null}

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
                <button type="button" onClick={() => void assignLot(lot.id)} disabled={loading || !tokens}>
                  Asignar (Recolector)
                </button>
              ) : null}
              {lot.status === 'ASSIGNED' ? (
                <button type="button" onClick={() => void collectLot(lot.id)} disabled={loading || !tokens}>
                  Registrar recoleccion
                </button>
              ) : null}
              {lot.status === 'COLLECTED' ? (
                <button type="button" onClick={() => void closeLot(lot.id)} disabled={loading || !tokens}>
                  Cerrar + certificar
                </button>
              ) : null}
              {(lot.status === 'COLLECTED' || lot.status === 'CLOSED') ? (
                <button type="button" onClick={() => void loadOperationDetail(lot.id)} disabled={loading || !tokens}>
                  Ver detalle
                </button>
              ) : null}
            </div>
            {operationByLot[lot.id] ? (
              <div className="op-detail">
                <p>
                  Operacion: <b>{operationByLot[lot.id].status}</b>
                  {operationByLot[lot.id].certificate?.publicVerificationCode
                    ? ` | Codigo: ${operationByLot[lot.id].certificate?.publicVerificationCode}`
                    : ''}
                </p>
                {operationByLot[lot.id].evidences.length > 0 ? (
                  <ul>
                    {operationByLot[lot.id].evidences.map((evidence) => (
                      <li key={evidence.id}>
                        <a href={resolveEvidenceUrl(evidence.fileUrl)} target="_blank" rel="noreferrer">
                          Ver evidencia ({evidence.fileType})
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Sin evidencias registradas.</p>
                )}
              </div>
            ) : null}
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

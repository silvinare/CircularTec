'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

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
  address: string;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  createdAt: string;
  updatedAt: string;
  wasteType: {
    name: string;
  };
  assignments?: Array<{
    id: string;
    collector?: {
      displayName: string;
    };
  }>;
  operation?: {
    id: string;
    status: string;
    collectedQuantityKg: number | null;
    collectedAt?: string | null;
    closedAt?: string | null;
  } | null;
};

type LotsResponse = {
  items: Lot[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

type LotDetail = {
  id: string;
  publicCode: string;
  status: Lot['status'];
  estimatedQuantityKg: number;
  address: string;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  wasteType: {
    name: string;
    code: string;
  };
  generator: {
    displayName: string;
    legalName: string;
    address: string;
  };
  assignments: Array<{
    id: string;
    status: string;
    collector: {
      displayName: string;
      legalName: string;
    };
  }>;
  operation: Operation | null;
};

type Operation = {
  id: string;
  status: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'CLOSED';
  collectedQuantityKg?: number | null;
  collectedAt?: string | null;
  closedAt?: string | null;
  collector?: {
    displayName: string;
    legalName?: string;
  };
  evidences: Array<{
    id: string;
    fileUrl: string;
    fileType: 'PHOTO' | 'DOCUMENT';
    uploadedAt?: string;
  }>;
  certificate: null | {
    certificateNumber?: string;
    publicVerificationCode: string;
    pdfUrl?: string;
    status?: string;
  };
};

type LoginResult = {
  token: string;
};

type GeneratorCertificate = {
  id: string;
  certificateNumber: string;
  publicVerificationCode: string;
  pdfUrl: string;
  issuedAt: string;
  status: string;
  lotPublicCode: string;
  wasteType: string;
  quantityKg: number;
  blockchainTxId: string | null;
  previewEvidence: null | {
    id: string;
    fileUrl: string;
    fileType: 'PHOTO' | 'DOCUMENT';
  };
};

type CertificatesResponse = {
  items: GeneratorCertificate[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

type SessionMe = {
  email: string;
  fullName: string;
  role: string;
  organization?: string | null;
};

type RoleTokens = {
  admin: string;
  generator: string;
  collector: string;
};

type FieldErrors = Partial<Record<'wasteTypeId' | 'quantity' | 'address' | 'pickupWindowStart' | 'pickupWindowEnd', string>>;

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

const LOT_PROGRESS = ['PUBLISHED', 'ASSIGNED', 'COLLECTED', 'CLOSED'] as const;

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL || 'http://localhost:4000/api/v1';
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

function lotStatusLabel(status: Lot['status']): string {
  switch (status) {
    case 'PUBLISHED':
      return 'Publicado';
    case 'ASSIGNED':
      return 'Asignado';
    case 'COLLECTED':
      return 'Retirado';
    case 'CLOSED':
      return 'Cerrado';
    case 'CANCELLED':
      return 'Cancelado';
  }
}

function lotStatusHint(status: Lot['status']): string {
  switch (status) {
    case 'PUBLISHED':
      return 'Esperando que un recolector tome el lote.';
    case 'ASSIGNED':
      return 'Un recolector ya confirmo la gestion del retiro.';
    case 'COLLECTED':
      return 'El retiro fue registrado y queda pendiente la confirmacion y el cierre.';
    case 'CLOSED':
      return 'El circuito quedo cerrado y el certificado esta disponible.';
    case 'CANCELLED':
      return 'El lote fue cancelado y ya no sigue en circuito.';
  }
}

function lotStatusDetailCopy(status: Lot['status']): string {
  switch (status) {
    case 'PUBLISHED':
      return 'El lote ya fue publicado y esta disponible para gestion.';
    case 'ASSIGNED':
      return 'El lote ya tiene un recolector asignado y queda pendiente el retiro.';
    case 'COLLECTED':
      return 'El retiro ya fue registrado. Falta el cierre final de la operacion.';
    case 'CLOSED':
      return 'La operacion ya termino correctamente y el lote quedo cerrado.';
    case 'CANCELLED':
      return 'El lote fue cancelado y no continua en el circuito.';
  }
}

function operationStatusLabel(status?: Operation['status']): string {
  switch (status) {
    case 'PENDING_CONFIRMATION':
      return 'Retiro registrado';
    case 'CONFIRMED':
      return 'Confirmado';
    case 'CLOSED':
      return 'Cerrado';
    default:
      return 'Sin operacion';
  }
}

function formatDateTime(value?: string | null): string {
  if (!value) return '-';

  return new Date(value).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDateRange(start?: string | null, end?: string | null): string {
  if (!start || !end) return '-';
  return `${formatDateTime(start)} a ${formatDateTime(end)}`;
}

function toDateTimeLocalValue(date: Date): string {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function dateFilterToIso(value: string, endOfDay = false): string {
  if (!value) return '';
  const suffix = endOfDay ? 'T23:59:59' : 'T00:00:00';
  return new Date(`${value}${suffix}`).toISOString();
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

function revokeObjectUrls(previews: Record<string, string | null>) {
  Object.values(previews).forEach((url) => {
    if (url) {
      URL.revokeObjectURL(url);
    }
  });
}

export function PilotFlow() {
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [quantity, setQuantity] = useState('120');
  const [wasteTypeId, setWasteTypeId] = useState('');
  const [address, setAddress] = useState('Av. Circular 123');
  const [pickupWindowStart, setPickupWindowStart] = useState(() => toDateTimeLocalValue(new Date(Date.now() + 60 * 60 * 1000)));
  const [pickupWindowEnd, setPickupWindowEnd] = useState(() => toDateTimeLocalValue(new Date(Date.now() + 3 * 60 * 60 * 1000)));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [publicCodes, setPublicCodes] = useState<string[]>([]);
  const [tokens, setTokens] = useState<RoleTokens | null>(null);
  const [sessionMe, setSessionMe] = useState<SessionMe | null>(null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [operationByLot, setOperationByLot] = useState<Record<string, Operation>>({});
  const [lotDetailById, setLotDetailById] = useState<Record<string, LotDetail>>({});
  const [certificates, setCertificates] = useState<GeneratorCertificate[]>([]);
  const [certificatePreviewSrcById, setCertificatePreviewSrcById] = useState<Record<string, string | null>>({});
  const [evidencePreviewSrcById, setEvidencePreviewSrcById] = useState<Record<string, string | null>>({});
  const [statusFilter, setStatusFilter] = useState<'ALL' | Lot['status']>('ALL');
  const [filterWasteTypeId, setFilterWasteTypeId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [listPage, setListPage] = useState(1);
  const [activeView, setActiveView] = useState<'lots' | 'new' | 'certificates' | 'account'>('lots');
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const [showDemoTools, setShowDemoTools] = useState(false);
  const [listPagination, setListPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1
  });
  const [certificatesPagination, setCertificatesPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1
  });
  const certificatePreviewSrcByIdRef = useRef<Record<string, string | null>>({});
  const evidencePreviewSrcByIdRef = useRef<Record<string, string | null>>({});

  const fallbackType = useMemo(() => wasteTypes[0]?.id || '', [wasteTypes]);
  const remainingMinutes = useMemo(() => {
    if (!sessionExpiresAt) return null;
    const diff = sessionExpiresAt - now;
    if (diff <= 0) return 0;
    return Math.ceil(diff / 60000);
  }, [sessionExpiresAt, now]);
  const publishedLots = lots.filter((lot) => lot.status === 'PUBLISHED').length;
  const closedLots = lots.filter((lot) => lot.status === 'CLOSED').length;
  const assignedLots = lots.filter((lot) => lot.status === 'ASSIGNED' || lot.status === 'COLLECTED').length;
  const lastCertificate = certificates[0] || null;
  const activeFilters = [statusFilter !== 'ALL', !!filterWasteTypeId, !!fromDate, !!toDate].filter(Boolean).length;

  function clearSession(message?: string) {
    revokeObjectUrls(certificatePreviewSrcByIdRef.current);
    revokeObjectUrls(evidencePreviewSrcByIdRef.current);
    setTokens(null);
    setSessionMe(null);
    setSessionExpiresAt(null);
    setLots([]);
    setWasteTypes([]);
    setEvidenceFile(null);
    setOperationByLot({});
    setLotDetailById({});
    setCertificates([]);
    setCertificatePreviewSrcById({});
    setEvidencePreviewSrcById({});
    setListPage(1);
    setSelectedLotId(null);
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

  async function loadLots(generatorToken?: string, pageArg?: number) {
    const token = generatorToken || tokens?.generator;
    if (!token) return;
    const page = pageArg || listPage;
    const params = new URLSearchParams({
      page: String(page),
      pageSize: '10'
    });

    if (statusFilter !== 'ALL') {
      params.set('status', statusFilter);
    }
    if (filterWasteTypeId) {
      params.set('wasteTypeId', filterWasteTypeId);
    }
    if (fromDate) {
      params.set('from', dateFilterToIso(fromDate));
    }
    if (toDate) {
      params.set('to', dateFilterToIso(toDate, true));
    }

    const response = await request<LotsResponse | Lot[]>(`/lots?${params.toString()}`, { method: 'GET' }, token);
    if (Array.isArray(response)) {
      setLots(response);
      setListPagination({
        page,
        pageSize: response.length,
        total: response.length,
        totalPages: 1
      });
      return;
    }

    setLots(response.items);
    setListPagination(response.pagination);
  }

  async function loadWasteTypes(generatorToken?: string) {
    const token = generatorToken || tokens?.generator;
    if (!token) return;

    const list = await request<WasteType[]>('/waste-types', { method: 'GET' }, token);
    setWasteTypes(list);
    if (!wasteTypeId && list[0]?.id) {
      setWasteTypeId(list[0].id);
    }
  }

  async function loadCertificates(generatorToken?: string, pageArg?: number) {
    const token = generatorToken || tokens?.generator;
    if (!token) return;
    const page = pageArg || certificatesPagination.page;
    const params = new URLSearchParams({
      page: String(page),
      pageSize: '10'
    });

    const response = await request<CertificatesResponse>(`/certificates?${params.toString()}`, { method: 'GET' }, token);
    setCertificates(response.items);
    setCertificatesPagination(response.pagination);
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
      setSessionExpiresAt(readJwtExpiration(nextTokens.generator));

      const me = await request<SessionMe>('/auth/me', { method: 'GET' }, nextTokens.generator);
      setSessionMe(me);

      await Promise.all([
        loadWasteTypes(nextTokens.generator),
        loadLots(nextTokens.generator, 1),
        loadCertificates(nextTokens.generator, 1)
      ]);
      setOperationByLot({});
      setInfo('Sesion demo de generador activa.');
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
        const expiresAt = readJwtExpiration(parsed.generator);
        if (expiresAt && expiresAt <= Date.now()) {
          clearSession('Sesion expirada. Inicia sesion demo nuevamente.');
          return;
        }

        setTokens(parsed);
        setSessionExpiresAt(expiresAt);
        const me = await request<SessionMe>('/auth/me', { method: 'GET' }, parsed.generator);
        setSessionMe(me);
        await Promise.all([
          loadWasteTypes(parsed.generator),
          loadLots(parsed.generator, 1),
          loadCertificates(parsed.generator, 1)
        ]);
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
    certificatePreviewSrcByIdRef.current = certificatePreviewSrcById;
  }, [certificatePreviewSrcById]);

  useEffect(() => {
    evidencePreviewSrcByIdRef.current = evidencePreviewSrcById;
  }, [evidencePreviewSrcById]);

  useEffect(() => {
    return () => {
      revokeObjectUrls(certificatePreviewSrcByIdRef.current);
      revokeObjectUrls(evidencePreviewSrcByIdRef.current);
    };
  }, []);

  useEffect(() => {
    if (!tokens?.generator) return;
    void loadLots(tokens.generator, listPage);
  }, [statusFilter, filterWasteTypeId, fromDate, toDate, listPage]);

  useEffect(() => {
    if (!tokens?.generator || activeView !== 'certificates') return;
    void loadCertificates(tokens.generator, certificatesPagination.page);
  }, [tokens, activeView, certificatesPagination.page]);

  useEffect(() => {
    if (!tokens?.generator) return;

    const previews = certificates.filter((certificate) => certificate.previewEvidence?.fileType === 'PHOTO');
    if (previews.length === 0) {
      setCertificatePreviewSrcById((current) => {
        revokeObjectUrls(current);
        return {};
      });
      return;
    }

    let cancelled = false;
    const createdUrls: string[] = [];

    void (async () => {
      const entries = await Promise.all(previews.map(async (certificate) => {
        try {
          const response = await fetch(resolveEvidenceUrl(certificate.previewEvidence!.fileUrl), {
            headers: {
              Authorization: `Bearer ${tokens.generator}`
            }
          });

          if (!response.ok) return [certificate.id, null] as const;

          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          createdUrls.push(objectUrl);
          return [certificate.id, objectUrl] as const;
        } catch {
          return [certificate.id, null] as const;
        }
      }));

      if (cancelled) {
        createdUrls.forEach((url) => URL.revokeObjectURL(url));
        return;
      }

      setCertificatePreviewSrcById((current) => {
        revokeObjectUrls(current);
        return Object.fromEntries(entries);
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [certificates, tokens]);

  useEffect(() => {
    if (!tokens?.generator) return;

    const previews = Object.values(operationByLot).flatMap((operation) =>
      operation.evidences.filter((evidence) => evidence.fileType === 'PHOTO')
    );

    if (previews.length === 0) {
      setEvidencePreviewSrcById((current) => {
        revokeObjectUrls(current);
        return {};
      });
      return;
    }

    let cancelled = false;
    const createdUrls: string[] = [];

    void (async () => {
      const entries = await Promise.all(previews.map(async (evidence) => {
        try {
          const response = await fetch(resolveEvidenceUrl(evidence.fileUrl), {
            headers: {
              Authorization: `Bearer ${tokens.generator}`
            }
          });

          if (!response.ok) return [evidence.id, null] as const;

          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          createdUrls.push(objectUrl);
          return [evidence.id, objectUrl] as const;
        } catch {
          return [evidence.id, null] as const;
        }
      }));

      if (cancelled) {
        createdUrls.forEach((url) => URL.revokeObjectURL(url));
        return;
      }

      setEvidencePreviewSrcById((current) => {
        revokeObjectUrls(current);
        return Object.fromEntries(entries);
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [operationByLot, tokens]);

  async function openProtectedFile(fileUrl: string) {
    if (!tokens?.generator) {
      setError('Primero inicia sesion demo.');
      return;
    }

    try {
      const response = await fetch(resolveEvidenceUrl(fileUrl), {
        headers: {
          Authorization: `Bearer ${tokens.generator}`
        }
      });

      if (!response.ok) {
        throw new ApiError(response.status, 'No se pudo abrir la evidencia.');
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    } catch (err) {
      setError(handleApiError(err, 'No se pudo abrir la evidencia.'));
    }
  }

  useEffect(() => {
    if (!sessionExpiresAt || !tokens) return;
    if (sessionExpiresAt <= now) {
      clearSession('Sesion expirada. Inicia sesion demo nuevamente.');
    }
  }, [sessionExpiresAt, now, tokens]);

  async function createLot(event: FormEvent) {
    event.preventDefault();
    if (!tokens?.generator) {
      setError('Primero inicia sesion demo.');
      return;
    }

    const nextErrors: FieldErrors = {};
    if (!(wasteTypeId || fallbackType)) nextErrors.wasteTypeId = 'Selecciona un tipo de residuo.';
    if (!quantity || Number(quantity) <= 0) nextErrors.quantity = 'Ingresa una cantidad valida en kg.';
    if (!address || address.trim().length < 5) nextErrors.address = 'Ingresa una direccion de retiro mas completa.';
    if (!pickupWindowStart) nextErrors.pickupWindowStart = 'Define el inicio de la ventana de retiro.';
    if (!pickupWindowEnd) nextErrors.pickupWindowEnd = 'Define el cierre de la ventana de retiro.';
    if (pickupWindowStart && pickupWindowEnd && new Date(pickupWindowEnd) <= new Date(pickupWindowStart)) {
      nextErrors.pickupWindowEnd = 'La hora de cierre debe ser posterior al inicio.';
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setError('Revisa los campos marcados antes de publicar el lote.');
      setInfo('');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setInfo('');

      const created = await request<Lot>('/lots', {
        method: 'POST',
        body: JSON.stringify({
          wasteTypeId: wasteTypeId || fallbackType,
          estimatedQuantityKg: Number(quantity),
          address: address.trim(),
          pickupWindowStart: new Date(pickupWindowStart).toISOString(),
          pickupWindowEnd: new Date(pickupWindowEnd).toISOString(),
          notes: notes.trim() || undefined
        })
      }, tokens.generator);

      await loadLots(tokens.generator, 1);
      setListPage(1);
      setQuantity('120');
      setNotes('');
      setPickupWindowStart(toDateTimeLocalValue(new Date(Date.now() + 60 * 60 * 1000)));
      setPickupWindowEnd(toDateTimeLocalValue(new Date(Date.now() + 3 * 60 * 60 * 1000)));
      setActiveView('lots');
      setSelectedLotId(created.id);
      setInfo(`Lote ${created.publicCode} publicado correctamente.`);
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
      await loadLots(tokens.generator, listPage);
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

      await loadLots(tokens.generator, listPage);
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

      const operation = await request<Operation>(`/operations/by-lot/${lotId}`, { method: 'GET' }, tokens.generator);
      const formData = new FormData();
      formData.append('file', evidenceFile);

      await request(`/operations/${operation.id}/evidences/upload`, {
        method: 'POST',
        body: formData
      }, tokens.collector);

      await request(`/operations/${lotId}/confirm`, {
        method: 'POST',
        body: JSON.stringify({ operationId: operation.id })
      }, tokens.generator);

      await request(`/operations/${lotId}/close`, {
        method: 'POST',
        body: JSON.stringify({ operationId: operation.id })
      }, tokens.admin);

      const operationUpdated = await request<Operation>(`/operations/by-lot/${lotId}`, { method: 'GET' }, tokens.generator);
      setOperationByLot((prev) => ({ ...prev, [lotId]: operationUpdated }));
      const code = operationUpdated.certificate?.publicVerificationCode;
      if (code) {
        setPublicCodes((prev) => [code, ...prev.filter((item) => item !== code)].slice(0, 5));
      }

      await loadLots(tokens.generator, listPage);
      await loadCertificates(tokens.generator, 1);
      setEvidenceFile(null);
      setInfo('Operacion confirmada, cerrada y certificado emitido.');
    } catch (err) {
      setError(handleApiError(err, 'No se pudo cerrar la operacion.'));
    } finally {
      setLoading(false);
    }
  }

  async function loadOperationDetail(lotId: string) {
    if (!tokens?.generator) {
      setError('Primero inicia sesion demo.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const operation = await request<Operation>(`/operations/by-lot/${lotId}`, { method: 'GET' }, tokens.generator);
      setOperationByLot((prev) => ({ ...prev, [lotId]: operation }));
      setSelectedLotId(lotId);
    } catch (err) {
      setError(handleApiError(err, 'No se pudo cargar el detalle de la operacion.'));
    } finally {
      setLoading(false);
    }
  }

  async function loadLotDetail(lotId: string) {
    if (!tokens?.generator) {
      setError('Primero inicia sesion demo.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const lot = await request<LotDetail>(`/lots/${lotId}`, { method: 'GET' }, tokens.generator);
      setLotDetailById((prev) => ({ ...prev, [lotId]: lot }));
      if (lot.operation) {
        setOperationByLot((prev) => ({ ...prev, [lotId]: lot.operation as Operation }));
      }
    } catch (err) {
      setError(handleApiError(err, 'No se pudo cargar el detalle del lote.'));
    } finally {
      setLoading(false);
    }
  }

  function toggleLotDetail(lotId: string) {
    if (selectedLotId === lotId) {
      setSelectedLotId(null);
      return;
    }

    setSelectedLotId(lotId);
    if (!lotDetailById[lotId]) {
      void loadLotDetail(lotId);
    }
  }

  return (
    <section className="flow generator-shell">
      <div className="generator-header">
        <div>
          <p className="generator-kicker">Mockup rol generador</p>
          <h2>Espacio de gestion de lotes</h2>
          <p>
            Esta vista traduce el flujo del Generador a una experiencia mas real: resumen, creacion de lotes, seguimiento y certificados.
          </p>
        </div>
        <div className="generator-nav">
          <button type="button" className={`nav-chip ${activeView === 'lots' ? 'active' : ''}`} onClick={() => setActiveView('lots')}>
            Mis lotes
          </button>
          <button type="button" className={`nav-chip ${activeView === 'new' ? 'active' : ''}`} onClick={() => setActiveView('new')}>
            Nuevo lote
          </button>
          <button
            type="button"
            className={`nav-chip ${activeView === 'certificates' ? 'active' : ''}`}
            onClick={() => setActiveView('certificates')}
          >
            Certificados
          </button>
          <button type="button" className={`nav-chip ${activeView === 'account' ? 'active' : ''}`} onClick={() => setActiveView('account')}>
            Mi cuenta
          </button>
        </div>
      </div>

      <div className="flow-auth">
        <button type="button" onClick={() => void loginAllDemoUsers()} disabled={loading}>
          Iniciar sesion demo de generador
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
          <>
            <p>
              {sessionMe.fullName} ({sessionMe.email}) | Rol activo: <b>GENERADOR</b>
              {remainingMinutes !== null ? ` | Expira en ~${remainingMinutes} min` : ''}
            </p>
            <div className="session-shortcuts">
              <button type="button" className="ghost-button" onClick={() => setActiveView('new')}>
                Crear lote
              </button>
              <button type="button" className="ghost-button" onClick={() => setActiveView('lots')}>
                Ver lotes
              </button>
              <button type="button" className="ghost-button" onClick={() => setActiveView('certificates')}>
                Ver certificados
              </button>
            </div>
          </>
        ) : (
          <p>No hay sesion activa.</p>
        )}
      </div>

      <section className="generator-summary">
        <article className="summary-card">
          <small>Lotes publicados</small>
          <strong>{publishedLots}</strong>
          <span>Pendientes de toma</span>
        </article>
        <article className="summary-card">
          <small>Lotes en gestion</small>
          <strong>{assignedLots}</strong>
          <span>Asignados o retirados</span>
        </article>
        <article className="summary-card">
          <small>Lotes cerrados</small>
          <strong>{closedLots}</strong>
          <span>Con trazabilidad finalizada</span>
        </article>
        <article className="summary-card">
          <small>Ultimo certificado</small>
          <strong>{lastCertificate ? lastCertificate.certificateNumber : publicCodes.length}</strong>
          <span>{lastCertificate ? lastCertificate.lotPublicCode : 'Sin cierres en esta sesion'}</span>
        </article>
      </section>

      {activeView === 'new' ? (
        <div className="generator-layout">
          <section className="generator-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">Nuevo lote</p>
                <h3>Publicar residuo</h3>
              </div>
              <span className="panel-note">Campos minimos para publicar</span>
            </div>

            <p className="panel-copy">
              Completa la informacion operativa basica. El seguimiento, las evidencias y el certificado apareceran despues en el mismo modulo.
            </p>

            <form className="flow-form" onSubmit={createLot}>
              <div className="form-field">
                <label htmlFor="waste">Tipo de residuo</label>
                <select
                  id="waste"
                  value={wasteTypeId}
                  onChange={(e) => {
                    setWasteTypeId(e.target.value);
                    setFieldErrors((current) => ({ ...current, wasteTypeId: undefined }));
                  }}
                >
                  {wasteTypes.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
                {fieldErrors.wasteTypeId ? <small className="field-error">{fieldErrors.wasteTypeId}</small> : null}
              </div>

              <div className="form-field">
                <label htmlFor="qty">Cantidad estimada (kg)</label>
                <input
                  id="qty"
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    setFieldErrors((current) => ({ ...current, quantity: undefined }));
                  }}
                  min="1"
                  required
                />
                {fieldErrors.quantity ? <small className="field-error">{fieldErrors.quantity}</small> : null}
              </div>

              <div className="form-field">
                <label htmlFor="addr">Direccion de retiro</label>
                <input
                  id="addr"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setFieldErrors((current) => ({ ...current, address: undefined }));
                  }}
                  required
                />
                {fieldErrors.address ? <small className="field-error">{fieldErrors.address}</small> : null}
              </div>

              <div className="form-field">
                <label htmlFor="pickup-start">Inicio de ventana</label>
                <input
                  id="pickup-start"
                  type="datetime-local"
                  value={pickupWindowStart}
                  onChange={(e) => {
                    setPickupWindowStart(e.target.value);
                    setFieldErrors((current) => ({ ...current, pickupWindowStart: undefined }));
                  }}
                  required
                />
                {fieldErrors.pickupWindowStart ? <small className="field-error">{fieldErrors.pickupWindowStart}</small> : null}
              </div>

              <div className="form-field">
                <label htmlFor="pickup-end">Fin de ventana</label>
                <input
                  id="pickup-end"
                  type="datetime-local"
                  value={pickupWindowEnd}
                  onChange={(e) => {
                    setPickupWindowEnd(e.target.value);
                    setFieldErrors((current) => ({ ...current, pickupWindowEnd: undefined }));
                  }}
                  required
                />
                {fieldErrors.pickupWindowEnd ? <small className="field-error">{fieldErrors.pickupWindowEnd}</small> : null}
              </div>

              <div className="form-field form-field-wide">
                <label htmlFor="notes">Observaciones</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Ej: material limpio, acceso por porton lateral, horario sugerido."
                />
              </div>

              <div className="form-actions">
                <button type="submit" disabled={loading || !tokens}>Publicar lote</button>
                <button type="button" className="ghost-button" onClick={() => setActiveView('lots')} disabled={loading}>
                  Volver a mis lotes
                </button>
              </div>
            </form>
          </section>

          <section className="generator-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">Guia del flujo</p>
                <h3>Que pasa despues de publicar</h3>
              </div>
            </div>

            <div className="journey-list">
              <article className="journey-step">
                <strong>1. Publicado</strong>
                <p>El lote queda visible para la operatoria y aparece en tu listado.</p>
              </article>
              <article className="journey-step">
                <strong>2. Asignado</strong>
                <p>Ves el recolector asignado y la ventana prevista de retiro.</p>
              </article>
              <article className="journey-step">
                <strong>3. Retirado</strong>
                <p>La operacion registra retiro y puede quedar pendiente de confirmacion o lista para cierre.</p>
              </article>
              <article className="journey-step">
                <strong>4. Cerrado</strong>
                <p>El lote muestra certificado, codigo publico y accesos de consulta.</p>
              </article>
            </div>

            {lastCertificate ? (
              <div className="highlight-card">
                <small>Ultimo certificado emitido</small>
                <strong>{lastCertificate.certificateNumber}</strong>
                <span>{lastCertificate.lotPublicCode} | {formatDateTime(lastCertificate.issuedAt)}</span>
              </div>
            ) : (
              <p className="panel-empty">Todavia no hay cierres emitidos para mostrar una referencia.</p>
            )}
          </section>
        </div>
      ) : null}

      {activeView === 'lots' ? (
        <div className="flow-filters">
          <div className="filter-field">
            <label htmlFor="status-filter">Estado</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as 'ALL' | Lot['status']);
                setListPage(1);
              }}
            >
              <option value="ALL">Todos</option>
              <option value="PUBLISHED">Publicado</option>
              <option value="ASSIGNED">Asignado</option>
              <option value="COLLECTED">Recolectado</option>
              <option value="CLOSED">Cerrado</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>
          <div className="filter-field">
            <label htmlFor="waste-filter">Residuo</label>
            <select
              id="waste-filter"
              value={filterWasteTypeId}
              onChange={(e) => {
                setFilterWasteTypeId(e.target.value);
                setListPage(1);
              }}
            >
              <option value="">Todos</option>
              {wasteTypes.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-field">
            <label htmlFor="from-filter">Desde</label>
            <input
              id="from-filter"
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setListPage(1);
              }}
            />
          </div>
          <div className="filter-field">
            <label htmlFor="to-filter">Hasta</label>
            <input
              id="to-filter"
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setListPage(1);
              }}
            />
          </div>
          <div className="filter-actions">
            <button type="button" className="ghost-button" onClick={() => setActiveView('new')}>
              Nuevo lote
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                setStatusFilter('ALL');
                setFilterWasteTypeId('');
                setFromDate('');
                setToDate('');
                setListPage(1);
              }}
              disabled={activeFilters === 0}
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      ) : null}

      {error && <p className="feedback error">{error}</p>}
      {info && <p className="feedback ok">{info}</p>}

      {activeView === 'lots' ? (
        <div className="flow-list">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Mis lotes</p>
              <h3>Seguimiento de publicaciones</h3>
            </div>
            <span className="panel-note">
              {listPagination.total} lotes{activeFilters > 0 ? ` | ${activeFilters} filtro${activeFilters > 1 ? 's' : ''} activo${activeFilters > 1 ? 's' : ''}` : ''}
            </span>
          </div>
          {loading && lots.length === 0 ? <p>Cargando...</p> : null}
          {!loading && lots.length === 0 ? (
            <div className="empty-state">
              <strong>No hay lotes para este criterio.</strong>
              <p>Publica un lote nuevo o ajusta los filtros para ver actividad existente.</p>
              <div className="empty-actions">
                <button type="button" onClick={() => setActiveView('new')}>
                  Crear nuevo lote
                </button>
                {activeFilters > 0 ? (
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => {
                      setStatusFilter('ALL');
                      setFilterWasteTypeId('');
                      setFromDate('');
                      setToDate('');
                      setListPage(1);
                    }}
                  >
                    Ver todos
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {lots.map((lot) => (
            <article key={lot.id} className={`flow-item ${selectedLotId === lot.id ? 'flow-item-active' : ''}`}>
              <div>
                <div className="lot-row-head">
                  <strong>{lot.publicCode}</strong>
                  <span className={`status-pill status-${lot.status.toLowerCase()}`}>{lotStatusLabel(lot.status)}</span>
                </div>
                <p>
                  {lot.wasteType.name} | {lot.estimatedQuantityKg} kg
                </p>
                <div className="lot-meta">
                  <span>Creado: {formatDateTime(lot.createdAt)}</span>
                  <span>Ventana: {formatDateRange(lot.pickupWindowStart, lot.pickupWindowEnd)}</span>
                </div>
                <p className="lot-status-hint">{lotStatusHint(lot.status)}</p>
                {lot.assignments && lot.assignments.length > 0 && lot.assignments[0].collector ? (
                  <p>Recolector asignado: <b>{lot.assignments[0].collector.displayName}</b></p>
                ) : null}
              </div>
              <div className="flow-actions">
                <button type="button" onClick={() => toggleLotDetail(lot.id)} disabled={loading || !tokens}>
                  {selectedLotId === lot.id ? 'Ocultar detalle' : 'Ver detalle'}
                </button>
                {(lot.status === 'COLLECTED' || lot.status === 'CLOSED') ? (
                  <button type="button" onClick={() => void loadOperationDetail(lot.id)} disabled={loading || !tokens}>
                    {lot.status === 'CLOSED' ? 'Ver certificado' : 'Ver operacion'}
                  </button>
                ) : null}
              </div>
              {selectedLotId === lot.id && lotDetailById[lot.id] ? (
                <div className="lot-detail">
                  <div className="detail-grid">
                    <div>
                      <small className="detail-label">Resumen</small>
                      <p>
                        Estado actual: <b>{lotStatusLabel(lotDetailById[lot.id].status)}</b>
                      </p>
                      <p>{lotStatusDetailCopy(lotDetailById[lot.id].status)}</p>
                      <p>
                        Residuo: <b>{lotDetailById[lot.id].wasteType.name}</b> ({lotDetailById[lot.id].wasteType.code})
                      </p>
                      <p>Cantidad estimada: {lotDetailById[lot.id].estimatedQuantityKg} kg</p>
                      <p>Direccion: {lotDetailById[lot.id].address}</p>
                      <p>Ventana: {formatDateRange(lotDetailById[lot.id].pickupWindowStart, lotDetailById[lot.id].pickupWindowEnd)}</p>
                      <p>Ultima actualizacion: {formatDateTime(lotDetailById[lot.id].updatedAt)}</p>
                    </div>
                    <div>
                      <small className="detail-label">Seguimiento</small>
                      {lotDetailById[lot.id].status === 'CANCELLED' ? (
                        <div className="status-steps">
                          <span className="step-pill step-cancelled">Cancelado</span>
                        </div>
                      ) : (
                        <div className="status-steps">
                          {LOT_PROGRESS.map((status, index) => {
                            const currentIndex = LOT_PROGRESS.indexOf(lotDetailById[lot.id].status as (typeof LOT_PROGRESS)[number]);
                            const stepState = currentIndex > index ? 'done' : currentIndex === index ? 'current' : 'todo';
                            return (
                              <span key={status} className={`step-pill step-${stepState}`}>
                                {lotStatusLabel(status)}
                              </span>
                            );
                          })}
                        </div>
                      )}
                      <div className="detail-list">
                        <p>
                          Publicacion: <b>{formatDateTime(lotDetailById[lot.id].createdAt)}</b>
                        </p>
                        {lotDetailById[lot.id].assignments.length > 0 ? (
                          <p>
                            Recolector asignado: <b>{lotDetailById[lot.id].assignments[0].collector.displayName}</b>
                          </p>
                        ) : (
                          <p>Recolector asignado: <b>Pendiente</b></p>
                        )}
                        {lotDetailById[lot.id].notes ? <p>Observaciones: {lotDetailById[lot.id].notes}</p> : null}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
              {selectedLotId === lot.id && operationByLot[lot.id] ? (
                <div className="op-detail">
                  <small className="detail-label">Resultado</small>
                  <div className="detail-list">
                    <p>Operacion: <b>{operationStatusLabel(operationByLot[lot.id].status)}</b></p>
                    {operationByLot[lot.id].collectedQuantityKg ? (
                      <p>
                        Retiro registrado: <b>{operationByLot[lot.id].collectedQuantityKg} kg</b>
                        {operationByLot[lot.id].collectedAt ? ` el ${formatDateTime(operationByLot[lot.id].collectedAt)}` : ''}
                      </p>
                    ) : null}
                    {operationByLot[lot.id].closedAt ? (
                      <p>Cierre: <b>{formatDateTime(operationByLot[lot.id].closedAt)}</b></p>
                    ) : null}
                    {operationByLot[lot.id].certificate?.publicVerificationCode ? (
                      <p>Codigo de certificado: <b>{operationByLot[lot.id].certificate?.publicVerificationCode}</b></p>
                    ) : null}
                  </div>
                  {operationByLot[lot.id].certificate?.pdfUrl ? (
                    <p>
                      <a href={resolveEvidenceUrl(operationByLot[lot.id].certificate?.pdfUrl || '')} target="_blank" rel="noreferrer">
                        Abrir PDF del certificado
                      </a>
                    </p>
                  ) : null}
                  {operationByLot[lot.id].evidences.length > 0 ? (
                    <ul>
                      {operationByLot[lot.id].evidences.map((evidence) => (
                        <li key={evidence.id}>
                          <button type="button" className="link-button" onClick={() => void openProtectedFile(evidence.fileUrl)}>
                            Ver evidencia ({evidence.fileType})
                          </button>
                          {evidence.fileType === 'PHOTO' ? (
                            evidence.id in evidencePreviewSrcById ? (
                              evidencePreviewSrcById[evidence.id] ? (
                                <button
                                  type="button"
                                  className="thumbnail-button"
                                  onClick={() => void openProtectedFile(evidence.fileUrl)}
                                >
                                  <img
                                    src={evidencePreviewSrcById[evidence.id] || undefined}
                                    alt="Miniatura evidencia"
                                    className="evidence-thumb"
                                  />
                                </button>
                              ) : (
                                <p>Sin vista previa.</p>
                              )
                            ) : (
                              <p>Cargando imagen...</p>
                            )
                          ) : null}
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
      ) : null}

      {activeView === 'lots' ? (
        <div className="flow-pagination">
          <button type="button" onClick={() => setListPage((current) => Math.max(1, current - 1))} disabled={loading || listPagination.page <= 1}>
            Anterior
          </button>
          <span>
            Pagina {listPagination.page} de {Math.max(1, listPagination.totalPages)} | {listPagination.total} lotes
          </span>
          <button
            type="button"
            onClick={() => setListPage((current) => Math.min(listPagination.totalPages || 1, current + 1))}
            disabled={loading || listPagination.page >= listPagination.totalPages}
          >
            Siguiente
          </button>
        </div>
      ) : null}

      {activeView === 'certificates' ? (
        <section className="generator-panel certificates-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Mis certificados</p>
              <h3>Trazabilidad cerrada</h3>
            </div>
            <span className="panel-note">{certificatesPagination.total} certificados</span>
          </div>
          <p className="panel-copy">
            Cada certificado corresponde a un lote ya cerrado y permite validacion publica mediante su codigo.
          </p>

          {certificates.length === 0 ? (
            <p className="panel-empty">Todavia no hay certificados emitidos para esta organizacion.</p>
          ) : (
            <div className="certificate-cards">
              {certificates.map((certificate) => (
                <article key={certificate.id} className="certificate-card">
                  {certificate.previewEvidence ? (
                    certificate.id in certificatePreviewSrcById ? (
                      certificatePreviewSrcById[certificate.id] ? (
                        <a
                          href={certificatePreviewSrcById[certificate.id] || undefined}
                          target="_blank"
                          rel="noreferrer"
                          className="certificate-thumb-link"
                        >
                          <img
                            src={certificatePreviewSrcById[certificate.id] || undefined}
                            alt={`Vista previa de evidencia del certificado ${certificate.certificateNumber}`}
                            className="certificate-thumb"
                          />
                        </a>
                      ) : (
                        <div className="certificate-thumb-placeholder">Sin imagen</div>
                      )
                    ) : (
                      <div className="certificate-thumb-link" aria-hidden="true">
                        <div className="certificate-thumb-placeholder">Cargando imagen</div>
                      </div>
                    )
                  ) : (
                    <div className="certificate-thumb-placeholder">Sin imagen</div>
                  )}
                  <div className="lot-row-head">
                    <strong>{certificate.certificateNumber}</strong>
                    <span className="status-pill status-closed">{certificate.status}</span>
                  </div>
                  <p>Lote: <b>{certificate.lotPublicCode}</b></p>
                  <p>{certificate.wasteType} | {certificate.quantityKg} kg</p>
                  <p>Codigo publico: <b>{certificate.publicVerificationCode}</b></p>
                  <p>Emitido: {new Date(certificate.issuedAt).toLocaleString('es-AR')}</p>
                  {certificate.blockchainTxId ? <p>Tx blockchain: {certificate.blockchainTxId}</p> : null}
                  <div className="certificate-actions">
                    <a href={resolveEvidenceUrl(certificate.pdfUrl)} target="_blank" rel="noreferrer">
                      Abrir PDF
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="flow-pagination">
            <button
              type="button"
              onClick={() => setCertificatesPagination((current) => ({ ...current, page: Math.max(1, current.page - 1) }))}
              disabled={loading || certificatesPagination.page <= 1}
            >
              Anterior
            </button>
            <span>
              Pagina {certificatesPagination.page} de {Math.max(1, certificatesPagination.totalPages)} | {certificatesPagination.total} certificados
            </span>
            <button
              type="button"
              onClick={() => setCertificatesPagination((current) => ({ ...current, page: Math.min(current.totalPages || 1, current.page + 1) }))}
              disabled={loading || certificatesPagination.page >= certificatesPagination.totalPages}
            >
              Siguiente
            </button>
          </div>
        </section>
      ) : null}

      {activeView === 'account' ? (
        <section className="generator-panel account-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Mi cuenta</p>
              <h3>Datos del operador</h3>
            </div>
          </div>
          {sessionMe ? (
            <div className="account-grid">
              <article className="account-card">
                <small>Operador</small>
                <strong>{sessionMe.fullName}</strong>
                <span>{sessionMe.email}</span>
              </article>
              <article className="account-card">
                <small>Organizacion</small>
                <strong>{sessionMe.organization || 'Generador demo'}</strong>
                <span>Rol activo: GENERADOR</span>
              </article>
              <article className="account-card">
                <small>Sesion</small>
                <strong>{remainingMinutes !== null ? `~${remainingMinutes} min` : 'Activa'}</strong>
                <span>Tiempo restante estimado</span>
              </article>
            </div>
          ) : (
            <p className="panel-empty">Inicia sesion para ver los datos de la cuenta.</p>
          )}
        </section>
      ) : null}

      {(activeView === 'lots' || activeView === 'new') ? (
        <section className="demo-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Modo demo</p>
              <h3>Simulacion interna del circuito</h3>
            </div>
            <button type="button" className="ghost-button" onClick={() => setShowDemoTools((current) => !current)}>
              {showDemoTools ? 'Ocultar herramientas' : 'Mostrar herramientas'}
            </button>
          </div>
          <p className="panel-copy">
            Este bloque no forma parte de la experiencia del Generador. Solo sirve para simular pasos de recolector y administrador mientras validamos el MVP.
          </p>

          {showDemoTools ? (
            <div className="demo-panel-grid">
              {lots.map((lot) => (
                <article key={`demo-${lot.id}`} className="demo-lot-card">
                  <div className="lot-row-head">
                    <strong>{lot.publicCode}</strong>
                    <span className={`status-pill status-${lot.status.toLowerCase()}`}>{lotStatusLabel(lot.status)}</span>
                  </div>
                  <p>{lot.wasteType.name}</p>
                  <div className="demo-tools-actions">
                    {lot.status === 'PUBLISHED' ? (
                      <button type="button" onClick={() => void assignLot(lot.id)} disabled={loading || !tokens}>
                        Simular asignacion
                      </button>
                    ) : null}
                    {lot.status === 'ASSIGNED' ? (
                      <button type="button" onClick={() => void collectLot(lot.id)} disabled={loading || !tokens}>
                        Simular retiro
                      </button>
                    ) : null}
                    {lot.status === 'COLLECTED' ? (
                      <>
                        <label className="demo-file-field" htmlFor={`evidence-${lot.id}`}>
                          Evidencia de cierre
                        </label>
                        <input
                          id={`evidence-${lot.id}`}
                          type="file"
                          onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                          accept="image/*,.pdf,.doc,.docx"
                        />
                        <button type="button" onClick={() => void closeLot(lot.id)} disabled={loading || !tokens}>
                          Simular cierre
                        </button>
                      </>
                    ) : null}
                    {(lot.status === 'COLLECTED' || lot.status === 'CLOSED') ? (
                      <button type="button" onClick={() => void loadOperationDetail(lot.id)} disabled={loading || !tokens}>
                        Ver operacion
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
    </section>
  );
}

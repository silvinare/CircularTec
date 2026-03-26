'use client';

import { FormEvent, useState } from 'react';

type VerifyResponse = {
  valid: boolean;
  message?: string;
  certificate?: {
    certificateNumber: string;
    issuedAt: string;
    wasteType: string;
    quantityKg: number;
    blockchainTxId: string | null;
    hash: string | null;
  };
};

export function CertificateVerify() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const response = await fetch(`${baseUrl}/certificates/verify/${code}`);
    const data = (await response.json()) as VerifyResponse;
    setResult(data);
    setLoading(false);
  }

  return (
    <section className="verify">
      <h2>Verificacion de certificado</h2>
      <form onSubmit={onSubmit}>
        <label htmlFor="code">Codigo publico</label>
        <input
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Ej: A1B2C3D4E5F6G7H8"
          required
        />
        <button type="submit" disabled={loading}>{loading ? 'Verificando...' : 'Verificar'}</button>
      </form>

      {result && (
        <div style={{ marginTop: 14 }}>
          <strong>{result.valid ? 'Certificado valido' : 'No valido'}</strong>
          {result.message && <p>{result.message}</p>}
          {result.certificate && (
            <ul>
              <li>Numero: {result.certificate.certificateNumber}</li>
              <li>Fecha: {new Date(result.certificate.issuedAt).toLocaleString()}</li>
              <li>Residuo: {result.certificate.wasteType}</li>
              <li>Cantidad (kg): {result.certificate.quantityKg}</li>
              <li>Tx blockchain: {result.certificate.blockchainTxId || 'Pendiente'}</li>
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

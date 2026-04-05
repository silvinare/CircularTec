'use client';

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body style={{ padding: 24, fontFamily: 'sans-serif' }}>
        <h1>Error critico</h1>
        <p>{error.message || 'No se pudo renderizar la aplicacion.'}</p>
        <button type="button" onClick={() => reset()}>
          Reintentar
        </button>
      </body>
    </html>
  );
}

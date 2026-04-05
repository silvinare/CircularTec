'use client';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Error de aplicacion</h1>
      <p>{error.message || 'Ocurrio un error inesperado.'}</p>
      <button type="button" onClick={() => reset()}>
        Reintentar
      </button>
    </main>
  );
}

import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CircularTec - MVP Piloto',
  description: 'Tablero inicial de operaciones y verificacion de certificados.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

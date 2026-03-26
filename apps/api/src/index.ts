import path from 'node:path';
import dotenv from 'dotenv';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { mockAuth } from './lib/auth-middleware';
import { HttpError } from './lib/errors';
import lotsRoutes from './routes/lots';
import operationsRoutes from './routes/operations';
import certificatesRoutes from './routes/certificates';
import wasteTypesRoutes from './routes/waste-types';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());
app.use(mockAuth);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'circulartec-api' });
});

app.use('/api/v1/lots', lotsRoutes);
app.use('/api/v1/operations', operationsRoutes);
app.use('/api/v1/certificates', certificatesRoutes);
app.use('/api/v1/waste-types', wasteTypesRoutes);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (typeof err === 'object' && err && 'issues' in err) {
    return res.status(400).json({ message: 'Error de validacion', details: err });
  }

  console.error(err);
  return res.status(500).json({ message: 'Error interno del servidor.' });
});

app.listen(port, () => {
  console.log(`CircularTec API escuchando en puerto ${port}`);
});

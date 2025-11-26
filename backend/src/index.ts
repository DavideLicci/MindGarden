import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRouter from './routes/auth';
import checkinsRouter from './routes/checkins';
import gardensRouter from './routes/gardens';
import plantsRouter from './routes/plants';
import uploadsRouter from './routes/uploads';
import exportRouter from './routes/export';
import insightsRouter from './routes/insights';
import settingsRouter from './routes/settings';
import analyticsRouter from './routes/analytics';
import { initializeDatabase } from './services/database.service.sqlite';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

// Initialize database
console.log('Initializing database...');
initializeDatabase();
console.log('Database initialized');

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// serve openapi spec for reference
app.get('/openapi.yaml', (_req, res) => {
  const specPath = path.resolve(__dirname, '..', '..', 'openapi', 'mindgarden.yaml');
  res.sendFile(specPath);
});

app.use('/auth', authRouter);
app.use('/checkins', checkinsRouter);
app.use('/gardens', gardensRouter);
app.use('/plants', plantsRouter);
app.use('/uploads', uploadsRouter);
app.use('/export', exportRouter);
app.use('/insights', insightsRouter);
app.use('/settings', settingsRouter);
app.use('/analytics', analyticsRouter);

console.log('Starting server...');
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`MindGarden API running on http://localhost:${PORT}`);
});

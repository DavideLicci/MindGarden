import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import checkinsRouter from './routes/checkins';
import gardensRouter from './routes/gardens';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// serve openapi spec for reference
app.get('/openapi.yaml', (_req, res) => {
  const specPath = path.resolve(__dirname, '..', '..', 'openapi', 'mindgarden.yaml');
  res.sendFile(specPath);
});

app.use('/checkins', checkinsRouter);
app.use('/gardens', gardensRouter);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`MindGarden API running on http://localhost:${PORT}`);
});

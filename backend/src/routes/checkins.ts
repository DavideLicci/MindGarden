import { Router } from 'express';

const router = Router();

type Checkin = {
  id: string;
  userId: string;
  mood: string;
  text?: string;
  createdAt: string;
};

const store: Checkin[] = [];

router.get('/', (_req, res) => {
  res.json(store);
});

router.post('/', (req, res) => {
  const { userId = 'me', mood, text } = req.body as Partial<Checkin>;
  if (!mood) return res.status(400).json({ error: 'mood is required' });
  const item: Checkin = {
    id: `${Date.now()}`,
    userId,
    mood,
    text,
    createdAt: new Date().toISOString(),
  };
  store.push(item);
  res.status(201).json(item);
});

export default router;

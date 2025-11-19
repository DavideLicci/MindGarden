import { Router } from 'express';

const router = Router();

router.get('/me', (_req, res) => {
  // lightweight stub response for a user's garden state
  res.json({
    userId: 'me',
    plants: [
      { id: 'p1', type: 'flower', health: 0.9 },
      { id: 'p2', type: 'sapling', health: 0.7 },
    ],
    lastCheckin: new Date().toISOString(),
  });
});

export default router;

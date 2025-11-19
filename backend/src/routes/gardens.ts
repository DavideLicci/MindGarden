import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { dbStatements } from '../db';

const router = Router();

router.use(authMiddleware);

router.get('/me', async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.user!.id);
    const garden = await dbStatements.getGardenByUserId(userId);
    if (!garden) {
      return res.status(404).json({ error: 'Garden not found' });
    }

    // Get recent checkins to determine plant types and health
    const recentCheckins = await dbStatements.getRecentCheckinsByUserId(userId, 5);
    const plants = recentCheckins.map((checkin, index) => ({
      id: `p${index + 1}`,
      type: checkin.mood === 'happy' ? 'flower' : checkin.mood === 'good' ? 'sapling' : 'weed',
      health: garden.health,
    }));

    res.json({
      userId: req.user!.id,
      plants,
      lastCheckin: recentCheckins.length > 0 ? recentCheckins[0].created_at : null,
    });
  } catch (error) {
    console.error('Get garden error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

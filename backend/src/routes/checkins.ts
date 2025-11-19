import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { dbStatements } from '../db';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.user!.id);
    const checkins = await dbStatements.getCheckinsByUserId(userId);
    res.json(checkins);
  } catch (error) {
    console.error('Get checkins error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { mood, text } = req.body;
    if (!mood) return res.status(400).json({ error: 'mood is required' });

    const userId = parseInt(req.user!.id);
    const checkinId = await dbStatements.createCheckin(userId, mood, text || null);

    // Update garden health based on checkin
    const garden = await dbStatements.getGardenByUserId(userId);
    if (garden) {
      // Simple logic: positive moods increase health, negative decrease
      const healthChange = mood === 'happy' || mood === 'good' ? 0.1 : -0.1;
      const newHealth = Math.max(0, Math.min(1, garden.health + healthChange));
      await dbStatements.updateGardenHealth(newHealth, userId);
    }

    const checkin = {
      id: checkinId,
      user_id: userId,
      mood,
      text: text || null,
      created_at: new Date().toISOString(),
    };

    res.status(201).json(checkin);
  } catch (error) {
    console.error('Create checkin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

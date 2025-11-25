import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { dbStatements } from '../services/database.service';

const router = Router();

router.use(authMiddleware);

// GET /gardens/me - Get current user's garden snapshot
router.get('/me', async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.user!.id);
    const garden = await dbStatements.getGardenByUserId(userId);

    if (!garden) {
      return res.status(404).json({ error: 'Garden not found' });
    }

    // Get plants for this garden
    const plants = await dbStatements.getPlantsByUserId(userId);

    // Get recent checkins for lastCheckin info
    const recentCheckins = await dbStatements.getRecentCheckinsByUserId(userId, 1);

    const gardenResponse = {
      gardenId: garden.id,
      userId: garden.user_id,
      createdAt: garden.created_at,
      plants: plants.map(plant => ({
        id: plant.id,
        userId: plant.user_id,
        checkinId: plant.checkin_id,
        archetype: plant.archetype,
        params: plant.params,
        position: plant.position,
        styleSkin: plant.style_skin,
        health: plant.health,
        growthProgress: plant.growth_progress,
        createdAt: plant.created_at
      })),
      aggregate: {
        health: garden.health,
        plantCount: plants.length
      },
      lastCheckin: recentCheckins.length > 0 ? recentCheckins[0].created_at : null,
    };

    res.json(gardenResponse);
  } catch (error) {
    console.error('Get garden error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

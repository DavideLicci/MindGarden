import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { dbStatements } from '../db';

const router = Router();

router.use(authMiddleware);

// GET /plants/:plantId - Get plant instance detail
router.get('/:plantId', async (req: AuthRequest, res) => {
  try {
    const { plantId } = req.params;
    const plant = await dbStatements.getPlantById(plantId);

    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    // Check if plant belongs to user
    if (plant.user_id !== parseInt(req.user!.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(plant);
  } catch (error) {
    console.error('Get plant error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /plants/:plantId/actions - Perform care action on a plant
router.post('/:plantId/actions', async (req: AuthRequest, res) => {
  try {
    const { plantId } = req.params;
    const { action, metadata } = req.body;

    if (!action) {
      return res.status(400).json({ error: 'action is required' });
    }

    const plant = await dbStatements.getPlantById(plantId);
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    // Check if plant belongs to user
    if (plant.user_id !== parseInt(req.user!.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Perform action
    let healthChange = 0;
    let growthChange = 0;

    switch (action) {
      case 'water':
        healthChange = 0.1;
        break;
      case 'meditate':
        healthChange = 0.05;
        growthChange = 0.1;
        break;
      case 'journal':
        growthChange = 0.05;
        break;
      case 'prune':
        // Pruning can help unhealthy plants recover
        if (plant.health < 0.5) {
          healthChange = 0.2;
        } else {
          healthChange = -0.1; // Over-pruning can harm healthy plants
        }
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    const newHealth = Math.max(0, Math.min(1, plant.health + healthChange));
    const newGrowth = Math.min(1, plant.growth_progress + growthChange);

    await dbStatements.updatePlantHealth(plantId, newHealth, newGrowth);

    // Return updated plant
    const updatedPlant = await dbStatements.getPlantById(plantId);
    res.json(updatedPlant);
  } catch (error) {
    console.error('Plant action error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

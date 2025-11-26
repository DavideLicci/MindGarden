import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { dbStatements } from '../services/database.service.sqlite';
import { generateInsights, generateGardenKeeperInsight } from '../services/ml.service';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.use(authMiddleware);

// GET /insights - List recent insights from Garden Keeper
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.user!.id);
    const limit = parseInt(req.query.limit as string) || 10;

    const insights = await dbStatements.getInsightsByUserId(userId, limit);

    res.json(insights);
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /insights/generate - Request on-demand insight generation
router.post('/generate', async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.user!.id);
    const { fromDate, toDate, checkinIds } = req.body;

    // Get checkins for analysis
    let checkins;
    if (checkinIds && checkinIds.length > 0) {
      // Get specific checkins
      checkins = [];
      for (const id of checkinIds) {
        const checkin = await dbStatements.getCheckinById(id);
        if (checkin && checkin.user_id === userId) {
          checkins.push(checkin);
        }
      }
    } else {
      // Get recent checkins
      checkins = await dbStatements.getRecentCheckinsByUserId(userId, 20);
    }

    // Generate insights using ML
    const newInsights = await generateInsights(checkins, userId.toString());

    // Save insights to database
    for (const insight of newInsights) {
      await dbStatements.createInsight({
        id: insight.id,
        userId,
        text: insight.text,
        insightType: insight.insightType,
        sourceCheckins: insight.sourceCheckins
      });
    }

    // Also generate a Garden Keeper message
    const keeperMessage = generateGardenKeeperInsight(checkins, userId.toString());
    const keeperInsight = {
      id: uuidv4(),
      userId,
      text: keeperMessage,
      insightType: 'garden_keeper',
      sourceCheckins: checkins.map(c => c.id.toString())
    };

    await dbStatements.createInsight(keeperInsight);

    // Return job ID (in production this would be async)
    const jobId = `insight-job-${Date.now()}`;
    res.status(202).json({ jobId });
  } catch (error) {
    console.error('Generate insights error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

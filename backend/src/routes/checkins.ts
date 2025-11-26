import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { dbStatements } from '../services/database.service.sqlite';
import { analyzeEmotion } from '../services/ml.service';

const router = Router();

router.use(authMiddleware);

// GET /checkins - List user's checkins
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

// GET /checkins/{id} - Get specific checkin
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const checkinId = parseInt(req.params.id);
    const checkin = await dbStatements.getCheckinById(checkinId);

    if (!checkin) {
      return res.status(404).json({ error: 'Checkin not found' });
    }

    // Check if checkin belongs to user
    if (checkin.user_id !== parseInt(req.user!.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(checkin);
  } catch (error) {
    console.error('Get checkin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /checkins - Create new checkin
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { text, sttText, audioObjectKey, tags } = req.body;

    if (!text && !sttText) {
      return res.status(400).json({ error: 'text or sttText is required' });
    }

    const userId = parseInt(req.user!.id);

    // Analyze emotion from text
    const analysisText = text || sttText || '';
    const emotionAnalysis = analyzeEmotion(analysisText);

    // Create checkin with advanced fields
    const checkinData = {
      text: text || null,
      sttText: sttText || null,
      audioObjectKey: audioObjectKey || null,
      emotionLabel: emotionAnalysis.emotionLabel,
      sentimentScore: emotionAnalysis.sentimentScore,
      intensity: emotionAnalysis.intensity,
      tags: tags || []
    };

    const checkinId = await dbStatements.createCheckin(userId, checkinData);

    // Update garden health based on sentiment
    const garden = await dbStatements.getGardenByUserId(userId);
    if (garden) {
      const healthChange = emotionAnalysis.sentimentScore * 0.1; // Scale sentiment to health change
      const newHealth = Math.max(0, Math.min(1, garden.health + healthChange));
      await dbStatements.updateGardenHealth(newHealth, userId);
    }

    // Return created checkin
    const checkin = await dbStatements.getCheckinById(checkinId);
    res.status(201).json(checkin);
  } catch (error) {
    console.error('Create checkin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

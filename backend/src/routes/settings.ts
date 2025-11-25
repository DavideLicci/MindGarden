import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { dbStatements } from '../services/database.service';

const router = Router();

router.use(authMiddleware);

// GET /settings/me - Get current user's settings
router.get('/me', async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.user!.id);
    const settings = await dbStatements.getSettingsByUserId(userId);
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /settings/me - Update user settings
router.patch('/me', async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.user!.id);
    const { processingMode, audioRetentionDays, shareAnonymized } = req.body;

    // Validate input
    if (processingMode && !['local', 'cloud'].includes(processingMode)) {
      return res.status(400).json({ error: 'processingMode must be local or cloud' });
    }

    if (audioRetentionDays !== undefined && (audioRetentionDays < 1 || audioRetentionDays > 365)) {
      return res.status(400).json({ error: 'audioRetentionDays must be between 1 and 365' });
    }

    if (shareAnonymized !== undefined && typeof shareAnonymized !== 'boolean') {
      return res.status(400).json({ error: 'shareAnonymized must be boolean' });
    }

    const updateData: any = {};
    if (processingMode !== undefined) updateData.processingMode = processingMode;
    if (audioRetentionDays !== undefined) updateData.audioRetentionDays = audioRetentionDays;
    if (shareAnonymized !== undefined) updateData.shareAnonymized = shareAnonymized;

    await dbStatements.updateSettings(userId, updateData);

    // Return updated settings
    const updatedSettings = await dbStatements.getSettingsByUserId(userId);
    res.json(updatedSettings);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

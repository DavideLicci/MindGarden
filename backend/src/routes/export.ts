import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { dbStatements } from '../services/database.service.sqlite';

const router = Router();

router.use(authMiddleware);

// POST /export - Request export of user data (GDPR)
router.post('/', async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.user!.id);
    const { format } = req.body;

    if (!format || !['json', 'zip'].includes(format)) {
      return res.status(400).json({ error: 'format must be json or zip' });
    }

    // In production, this would queue an export job
    // For now, return a placeholder response
    const jobId = `export-job-${Date.now()}`;

    res.status(202).json({ jobId });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /data - Delete all user data (GDPR delete)
router.delete('/data', async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.user!.id);

    // In production, this would queue a deletion job
    // For now, return a placeholder response
    const jobId = `delete-job-${Date.now()}`;

    res.status(202).json({ jobId });
  } catch (error) {
    console.error('Delete data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

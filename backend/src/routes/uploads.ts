import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// POST /uploads/signed-url - Request signed URL for file upload
router.post('/signed-url', async (req: AuthRequest, res) => {
  try {
    const { userId, contentType, lengthSeconds } = req.body;

    if (!userId || !contentType) {
      return res.status(400).json({ error: 'userId and contentType are required' });
    }

    // Verify user owns the requested userId
    if (parseInt(userId) !== parseInt(req.user!.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // In production, this would generate a signed URL for S3 or similar service
    // For now, return a placeholder response
    const objectKey = `audio/${userId}/${Date.now()}.wav`;
    const uploadUrl = `https://example-storage.com/upload/${objectKey}?signature=placeholder`;

    res.json({
      uploadUrl,
      objectKey
    });
  } catch (error) {
    console.error('Signed URL error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

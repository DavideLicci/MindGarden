"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
// POST /uploads/signed-url - Request signed URL for file upload
router.post('/signed-url', async (req, res) => {
    try {
        const { userId, contentType, lengthSeconds } = req.body;
        if (!userId || !contentType) {
            return res.status(400).json({ error: 'userId and contentType are required' });
        }
        // Verify user owns the requested userId
        if (parseInt(userId) !== parseInt(req.user.id)) {
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
    }
    catch (error) {
        console.error('Signed URL error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;

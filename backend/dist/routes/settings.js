"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const db_1 = require("../db");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
// GET /settings/me - Get current user's settings
router.get('/me', async (req, res) => {
    try {
        const userId = parseInt(req.user.id);
        const settings = await db_1.dbStatements.getSettingsByUserId(userId);
        res.json(settings);
    }
    catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PATCH /settings/me - Update user settings
router.patch('/me', async (req, res) => {
    try {
        const userId = parseInt(req.user.id);
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
        const updateData = {};
        if (processingMode !== undefined)
            updateData.processingMode = processingMode;
        if (audioRetentionDays !== undefined)
            updateData.audioRetentionDays = audioRetentionDays;
        if (shareAnonymized !== undefined)
            updateData.shareAnonymized = shareAnonymized;
        await db_1.dbStatements.updateSettings(userId, updateData);
        // Return updated settings
        const updatedSettings = await db_1.dbStatements.getSettingsByUserId(userId);
        res.json(updatedSettings);
    }
    catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;

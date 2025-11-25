"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const database_service_1 = require("../services/database.service");
const ml_service_1 = require("../services/ml.service");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
// GET /checkins - List user's checkins
router.get('/', async (req, res) => {
    try {
        const userId = parseInt(req.user.id);
        const checkins = await database_service_1.dbStatements.getCheckinsByUserId(userId);
        res.json(checkins);
    }
    catch (error) {
        console.error('Get checkins error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /checkins/{id} - Get specific checkin
router.get('/:id', async (req, res) => {
    try {
        const checkinId = parseInt(req.params.id);
        const checkin = await database_service_1.dbStatements.getCheckinById(checkinId);
        if (!checkin) {
            return res.status(404).json({ error: 'Checkin not found' });
        }
        // Check if checkin belongs to user
        if (checkin.user_id !== parseInt(req.user.id)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.json(checkin);
    }
    catch (error) {
        console.error('Get checkin error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /checkins - Create new checkin
router.post('/', async (req, res) => {
    try {
        const { text, sttText, audioObjectKey, tags } = req.body;
        if (!text && !sttText) {
            return res.status(400).json({ error: 'text or sttText is required' });
        }
        const userId = parseInt(req.user.id);
        // Analyze emotion from text
        const analysisText = text || sttText || '';
        const emotionAnalysis = (0, ml_service_1.analyzeEmotion)(analysisText);
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
        const checkinId = await database_service_1.dbStatements.createCheckin(userId, checkinData);
        // Update garden health based on sentiment
        const garden = await database_service_1.dbStatements.getGardenByUserId(userId);
        if (garden) {
            const healthChange = emotionAnalysis.sentimentScore * 0.1; // Scale sentiment to health change
            const newHealth = Math.max(0, Math.min(1, garden.health + healthChange));
            await database_service_1.dbStatements.updateGardenHealth(newHealth, userId);
        }
        // Return created checkin
        const checkin = await database_service_1.dbStatements.getCheckinById(checkinId);
        res.status(201).json(checkin);
    }
    catch (error) {
        console.error('Create checkin error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;

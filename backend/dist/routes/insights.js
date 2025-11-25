"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const database_service_1 = require("../services/database.service");
const ml_service_1 = require("../services/ml.service");
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
// GET /insights - List recent insights from Garden Keeper
router.get('/', async (req, res) => {
    try {
        const userId = parseInt(req.user.id);
        const limit = parseInt(req.query.limit) || 10;
        const insights = await database_service_1.dbStatements.getInsightsByUserId(userId, limit);
        res.json(insights);
    }
    catch (error) {
        console.error('Get insights error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /insights/generate - Request on-demand insight generation
router.post('/generate', async (req, res) => {
    try {
        const userId = parseInt(req.user.id);
        const { fromDate, toDate, checkinIds } = req.body;
        // Get checkins for analysis
        let checkins;
        if (checkinIds && checkinIds.length > 0) {
            // Get specific checkins
            checkins = [];
            for (const id of checkinIds) {
                const checkin = await database_service_1.dbStatements.getCheckinById(id);
                if (checkin && checkin.user_id === userId) {
                    checkins.push(checkin);
                }
            }
        }
        else {
            // Get recent checkins
            checkins = await database_service_1.dbStatements.getRecentCheckinsByUserId(userId, 20);
        }
        // Generate insights using ML
        const newInsights = await (0, ml_service_1.generateInsights)(checkins, userId.toString());
        // Save insights to database
        for (const insight of newInsights) {
            await database_service_1.dbStatements.createInsight({
                id: insight.id,
                userId,
                text: insight.text,
                insightType: insight.insightType,
                sourceCheckins: insight.sourceCheckins
            });
        }
        // Also generate a Garden Keeper message
        const keeperMessage = (0, ml_service_1.generateGardenKeeperInsight)(checkins, userId.toString());
        const keeperInsight = {
            id: (0, uuid_1.v4)(),
            userId,
            text: keeperMessage,
            insightType: 'garden_keeper',
            sourceCheckins: checkins.map(c => c.id.toString())
        };
        await database_service_1.dbStatements.createInsight(keeperInsight);
        // Return job ID (in production this would be async)
        const jobId = `insight-job-${Date.now()}`;
        res.status(202).json({ jobId });
    }
    catch (error) {
        console.error('Generate insights error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;

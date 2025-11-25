"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const database_service_1 = require("../services/database.service");
const ml_service_1 = require("../services/ml.service");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
// POST /chatbot/conversation - Send message and get AI response
router.post('/conversation', async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;
        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                error: 'Message is required and must be a string',
                code: 'INVALID_MESSAGE'
            });
        }
        if (message.length > 1000) {
            return res.status(400).json({
                error: 'Message too long. Please keep messages under 1000 characters.',
                code: 'MESSAGE_TOO_LONG'
            });
        }
        const userId = parseInt(req.user.id);
        // Get recent checkins for emotion context (limit to prevent performance issues)
        const allCheckins = await database_service_1.dbStatements.getCheckinsByUserId(userId);
        const recentCheckins = allCheckins.slice(0, 10);
        // Generate AI response with emotion context
        const aiResponse = await (0, ml_service_1.generateChatbotResponse)(message, conversationHistory, recentCheckins, userId.toString());
        res.json({
            response: aiResponse,
            timestamp: new Date().toISOString(),
            contextUsed: recentCheckins.length > 0
        });
    }
    catch (error) {
        console.error('Chatbot conversation error:', error);
        // Provide more specific error messages
        if (error instanceof Error) {
            if (error.message.includes('OpenAI')) {
                return res.status(503).json({
                    error: 'AI service temporarily unavailable. Please try again later.',
                    code: 'AI_SERVICE_UNAVAILABLE'
                });
            }
        }
        res.status(500).json({
            error: 'Internal server error',
            code: 'INTERNAL_ERROR'
        });
    }
});
// GET /chatbot/context - Get current emotional context for the user
router.get('/context', async (req, res) => {
    var _a;
    try {
        const userId = parseInt(req.user.id);
        // Get recent checkins for context
        const allCheckins = await database_service_1.dbStatements.getCheckinsByUserId(userId);
        const recentCheckins = allCheckins.slice(0, 5);
        if (recentCheckins.length === 0) {
            return res.json({
                hasContext: false,
                message: 'No recent check-ins found. Start by sharing how you\'re feeling!',
                suggestion: 'Try making a check-in to help me understand your emotional state better.'
            });
        }
        // Calculate current emotional state
        const avgSentiment = recentCheckins.reduce((sum, c) => sum + (c.sentimentScore || 0), 0) / recentCheckins.length;
        const dominantEmotion = recentCheckins
            .map(c => c.emotionLabel)
            .filter(Boolean)
            .reduce((acc, emotion) => {
            acc[emotion] = (acc[emotion] || 0) + 1;
            return acc;
        }, {});
        const dominantEmotionLabel = Object.keys(dominantEmotion).reduce((a, b) => dominantEmotion[a] > dominantEmotion[b] ? a : b, 'neutral');
        // Calculate sentiment trend
        const recentSentiment = recentCheckins.slice(0, 3).reduce((sum, c) => sum + (c.sentimentScore || 0), 0) / Math.min(3, recentCheckins.length);
        const olderSentiment = recentCheckins.slice(3).reduce((sum, c) => sum + (c.sentimentScore || 0), 0) / Math.max(1, recentCheckins.slice(3).length);
        let trend = 'stable';
        if (recentSentiment > olderSentiment + 0.1)
            trend = 'improving';
        else if (recentSentiment < olderSentiment - 0.1)
            trend = 'declining';
        res.json({
            hasContext: true,
            currentEmotion: dominantEmotionLabel,
            averageSentiment: avgSentiment,
            sentimentTrend: trend,
            recentCheckinsCount: recentCheckins.length,
            lastCheckinDate: (_a = recentCheckins[0]) === null || _a === void 0 ? void 0 : _a.created_at,
            emotionalRange: {
                min: Math.min(...recentCheckins.map(c => c.sentimentScore || 0)),
                max: Math.max(...recentCheckins.map(c => c.sentimentScore || 0))
            }
        });
    }
    catch (error) {
        console.error('Get chatbot context error:', error);
        res.status(500).json({
            error: 'Internal server error',
            code: 'CONTEXT_ERROR'
        });
    }
});
// GET /chatbot/suggestions - Get conversation starters based on emotional state
router.get('/suggestions', async (req, res) => {
    try {
        const userId = parseInt(req.user.id);
        const allCheckins = await database_service_1.dbStatements.getCheckinsByUserId(userId);
        const recentCheckins = allCheckins.slice(0, 3);
        let suggestions = [];
        if (recentCheckins.length === 0) {
            suggestions = [
                "How are you feeling today?",
                "What's been on your mind lately?",
                "Tell me about your day so far.",
                "What's one thing you're grateful for?"
            ];
        }
        else {
            const avgSentiment = recentCheckins.reduce((sum, c) => sum + (c.sentimentScore || 0), 0) / recentCheckins.length;
            const dominantEmotion = recentCheckins
                .map(c => c.emotionLabel)
                .filter(Boolean)
                .reduce((acc, emotion) => {
                acc[emotion] = (acc[emotion] || 0) + 1;
                return acc;
            }, {});
            const dominantEmotionLabel = Object.keys(dominantEmotion).reduce((a, b) => dominantEmotion[a] > dominantEmotion[b] ? a : b, 'neutral');
            // Context-aware suggestions
            if (avgSentiment > 0.2) {
                suggestions = [
                    "What's making you feel positive today?",
                    "Tell me more about what's going well.",
                    "How can you build on this good feeling?",
                    "What's one thing you'd like to celebrate?"
                ];
            }
            else if (avgSentiment < -0.2) {
                suggestions = [
                    "What's been challenging for you lately?",
                    "Is there anything specific you'd like to talk about?",
                    "What would help you feel a bit better right now?",
                    "Have you tried any coping strategies recently?"
                ];
            }
            else {
                suggestions = [
                    "How has your week been going?",
                    "What's something you're looking forward to?",
                    "Tell me about your emotional garden.",
                    "What's one small goal you'd like to work on?"
                ];
            }
        }
        res.json({
            suggestions,
            basedOnCheckins: recentCheckins.length
        });
    }
    catch (error) {
        console.error('Get chatbot suggestions error:', error);
        res.status(500).json({
            error: 'Internal server error',
            code: 'SUGGESTIONS_ERROR'
        });
    }
});
exports.default = router;

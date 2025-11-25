"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSmartNotifications = generateSmartNotifications;
exports.generateInsights = generateInsights;
exports.generateGardenKeeperInsight = generateGardenKeeperInsight;
// Fallback chatbot response when OpenAI fails
function generateFallbackChatbotResponse(userMessage, recentCheckins) {
    const lowerMessage = userMessage.toLowerCase();
    // Simple keyword-based responses
    if (lowerMessage.includes('sad') || lowerMessage.includes('depresso') || lowerMessage.includes('triste')) {
        return 'I hear that you\'re feeling sad. It\'s okay to feel this way sometimes. Would you like to talk about what\'s been bothering you?';
    }
    if (lowerMessage.includes('happy') || lowerMessage.includes('felice') || lowerMessage.includes('contento')) {
        return 'That\'s wonderful to hear! It sounds like you\'re having a good day. What\'s bringing you joy right now?';
    }
    if (lowerMessage.includes('anxious') || lowerMessage.includes('ansioso') || lowerMessage.includes('preoccupato')) {
        return 'Anxiety can be really challenging. Try taking a few deep breaths - sometimes that helps. What\'s on your mind?';
    }
    if (lowerMessage.includes('stress') || lowerMessage.includes('stressato')) {
        return 'Stress can feel overwhelming. Maybe try a short walk or some gentle stretching? I\'m here to listen if you want to share more.';
    }
    // Default empathetic response
    return 'Thank you for sharing that with me. I\'m here to listen. How are you feeling about your emotional garden lately?';
}
// Smart notification generation based on user patterns
async function generateSmartNotifications(userId, recentCheckins) {
    const notifications = [];
    if (recentCheckins.length === 0) {
        // Welcome notification for new users
        notifications.push({
            type: 'welcome',
            title: 'Welcome to MindGarden! 🌱',
            message: 'Start your emotional wellness journey by sharing how you\'re feeling today.',
            priority: 'high',
            data: { action: 'checkin' }
        });
        return notifications;
    }
    // Analyze emotional patterns
    const avgSentiment = recentCheckins.reduce((sum, c) => sum + (c.sentimentScore || 0), 0) / recentCheckins.length;
    const lastCheckin = recentCheckins[0];
    const daysSinceLastCheckin = Math.floor((Date.now() - new Date(lastCheckin.created_at).getTime()) / (1000 * 60 * 60 * 24));
    // Check-in reminder if no activity for 2+ days
    if (daysSinceLastCheckin >= 2) {
        const reminderMessage = daysSinceLastCheckin === 2
            ? 'It\'s been a couple of days since your last check-in. How are you feeling today?'
            : `It\'s been ${daysSinceLastCheckin} days since your last check-in. Your garden misses you! 🌱`;
        notifications.push({
            type: 'checkin_reminder',
            title: 'Time for a Check-In',
            message: reminderMessage,
            priority: 'normal',
            data: { action: 'checkin', daysSinceLast: daysSinceLastCheckin }
        });
    }
    // Emotional pattern notifications
    if (recentCheckins.length >= 5) {
        const emotionCounts = {};
        recentCheckins.forEach(checkin => {
            const emotion = checkin.emotionLabel || 'neutral';
            emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        });
        const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) => emotionCounts[a] > emotionCounts[b] ? a : b, 'neutral');
        // Persistent negative emotions
        if (avgSentiment < -0.3 && emotionCounts[dominantEmotion] >= 3) {
            notifications.push({
                type: 'emotional_support',
                title: 'Your Garden Needs Care',
                message: `I've noticed you've been feeling ${dominantEmotion} frequently. Consider some self-care activities or talking to a trusted friend.`,
                priority: 'high',
                data: { emotion: dominantEmotion, pattern: 'negative_trend' }
            });
        }
        // Positive streak celebration
        if (avgSentiment > 0.4 && emotionCounts[dominantEmotion] >= 3) {
            notifications.push({
                type: 'positive_encouragement',
                title: 'Amazing Progress! 🌟',
                message: `You're on a wonderful positive streak! Keep nurturing these good feelings - your garden is blooming beautifully.`,
                priority: 'normal',
                data: { emotion: dominantEmotion, pattern: 'positive_streak' }
            });
        }
    }
    // Weekly insights summary (if it's been a week since last insight)
    const lastWeekCheckins = recentCheckins.filter(checkin => {
        const checkinDate = new Date(checkin.created_at);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return checkinDate >= weekAgo;
    });
    const { emotionLabel, sentimentScore, intensity } = emotionAnalysis;
    // Plant archetypes based on emotions
    const plantArchetypes = {
        joy: { color: '#FFD700', shape: 'flower', growthRate: 1.2 },
        sadness: { color: '#4169E1', shape: 'drooping', growthRate: 0.8 },
        anger: { color: '#DC143C', shape: 'spiky', growthRate: 1.0 },
        fear: { color: '#800080', shape: 'curled', growthRate: 0.7 },
        surprise: { color: '#FFA500', shape: 'star', growthRate: 1.1 },
        disgust: { color: '#228B22', shape: 'thorny', growthRate: 0.9 },
        anxiety: { color: '#FF6347', shape: 'wavy', growthRate: 0.8 },
        excitement: { color: '#FF1493', shape: 'burst', growthRate: 1.3 },
        gratitude: { color: '#98FB98', shape: 'blooming', growthRate: 1.1 },
        love: { color: '#FF69B4', shape: 'heart', growthRate: 1.2 },
        confusion: { color: '#D3D3D3', shape: 'twisted', growthRate: 0.9 },
        calm: { color: '#87CEEB', shape: 'straight', growthRate: 1.0 },
        neutral: { color: '#8B4513', shape: 'basic', growthRate: 1.0 }
    };
    const archetype = plantArchetypes[emotionLabel] || plantArchetypes.neutral;
    // Calculate size based on intensity and sentiment
    const baseSize = 0.5 + intensity * 0.5;
    const sentimentModifier = sentimentScore > 0 ? 1.2 : sentimentScore < 0 ? 0.8 : 1.0;
    const size = baseSize * sentimentModifier;
    // Generate position avoiding existing plants
    const position = generatePlantPosition(existingPlants);
    return {
        archetype: emotionLabel,
        params: {
            color: archetype.color,
            size,
            shape: archetype.shape,
            growthRate: archetype.growthRate
        },
        position
    };
}
// Generate non-overlapping plant position
function generatePlantPosition(existingPlants) {
    const minDistance = 2;
    let attempts = 0;
    let position;
    do {
        position = {
            x: (Math.random() - 0.5) * 16, // -8 to 8
            y: 0,
            z: (Math.random() - 0.5) * 16 // -8 to 8
        };
        attempts++;
    } while (attempts < 50 && existingPlants.some(plant => Math.sqrt(Math.pow(plant.position.x - position.x, 2) +
        Math.pow(plant.position.z - position.z, 2)) < minDistance));
    return position;
}
// Generate personalized insights using OpenAI
async function generateInsights(checkins, userId) {
    var _a, _b;
    const insights = [];
    if (checkins.length === 0)
        return insights;
    try {
        // Prepare checkin data for analysis
        const recentCheckins = checkins.slice(0, 20);
        const checkinSummary = recentCheckins.map(c => {
            var _a, _b;
            return ({
                date: c.created_at,
                emotion: c.emotionLabel,
                sentiment: c.sentimentScore,
                text: ((_a = c.text) === null || _a === void 0 ? void 0 : _a.substring(0, 100)) + (((_b = c.text) === null || _b === void 0 ? void 0 : _b.length) > 100 ? '...' : '')
            });
        });
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `Analyze the user's emotional checkins and generate 2-3 personalized insights. Each insight should be:
          - Helpful and empathetic
          - Based on patterns in their emotional data
          - Encouraging positive growth
          - Return as JSON array with objects containing: text, insightType, sourceCheckins (array of checkin IDs)

          Insight types: trend_analysis, pattern_recognition, encouragement, milestone, recommendation`
                },
                {
                    role: 'user',
                    content: `User's recent checkins: ${JSON.stringify(checkinSummary)}`
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });
        const result = (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
        if (result) {
            try {
                const parsedInsights = JSON.parse(result);
                parsedInsights.forEach((insight) => {
                    insights.push({
                        id: uuidv4(),
                        text: insight.text,
                        insightType: insight.insightType,
                        sourceCheckins: insight.sourceCheckins || recentCheckins.map(c => c.id.toString())
                    });
                });
            }
            catch (parseError) {
                console.error('Failed to parse OpenAI insights:', parseError);
            }
        }
    }
    catch (error) {
        console.error('OpenAI insights generation failed:', error);
    }
    // Fallback to rule-based insights if OpenAI fails
    if (insights.length === 0) {
        return generateInsightsFallback(checkins, userId);
    }
    return insights;
}
// Fallback rule-based insights
function generateInsightsFallback(checkins, userId) {
    const insights = [];
    if (checkins.length === 0)
        return insights;
    // Trend analysis
    const recentCheckins = checkins.slice(0, 10);
    const avgSentiment = recentCheckins.reduce((sum, c) => sum + (c.sentimentScore || 0), 0) / recentCheckins.length;
    if (avgSentiment > 0.2) {
        insights.push({
            id: uuidv4(),
            text: 'Your emotional garden is blooming! Keep nurturing those positive feelings.',
            insightType: 'trend_positive',
            sourceCheckins: recentCheckins.map(c => c.id.toString())
        });
    }
    else if (avgSentiment < -0.2) {
        insights.push({
            id: uuidv4(),
            text: 'Your garden shows some wilting. Consider activities that bring you peace and joy.',
            insightType: 'trend_negative',
            sourceCheckins: recentCheckins.map(c => c.id.toString())
        });
    }
    // Pattern recognition
    const emotionCounts = {};
    recentCheckins.forEach(checkin => {
        const emotion = checkin.emotionLabel || 'neutral';
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
    const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) => emotionCounts[a] > emotionCounts[b] ? a : b);
    if (emotionCounts[dominantEmotion] > 5) {
        insights.push({
            id: uuidv4(),
            text: `You've been feeling ${dominantEmotion} frequently. This pattern might be worth exploring further.`,
            insightType: 'pattern_recognition',
            sourceCheckins: recentCheckins.filter(c => c.emotionLabel === dominantEmotion).map(c => c.id.toString())
        });
    }
    return insights;
}
// Garden Keeper AI - Generate personalized insights
function generateGardenKeeperInsight(checkins, userId) {
    const recentCheckins = checkins.slice(0, 5);
    if (recentCheckins.length === 0) {
        return 'Benvenuto nel tuo giardino! Inizia a condividere i tuoi pensieri per vedere crescere le tue piante digitali.';
    }
    const avgSentiment = recentCheckins.reduce((sum, c) => sum + (c.sentimentScore || 0), 0) / recentCheckins.length;
    if (avgSentiment > 0.3) {
        return 'Il tuo giardino sta fiorendo! Le tue piante positive stanno crescendo rigogliose. Continua a coltivare questi momenti felici.';
    }
    else if (avgSentiment < -0.3) {
        return 'Il tuo giardino ha bisogno di cure. Considera attività rilassanti come meditazione o passeggiate per aiutare le tue piante a riprendersi.';
    }
    else {
        return 'Il tuo giardino è in equilibrio. Ogni check-in è un seme che pianti. Continua a monitorare i tuoi stati d\'animo per vedere come cresce.';
    }
}

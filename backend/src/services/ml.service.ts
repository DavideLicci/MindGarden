import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Placeholder ML functions for MindGarden
// These will be replaced with actual ML models in production

export interface EmotionAnalysis {
  emotionLabel: string;
  sentimentScore: number;
  intensity: number;
}

export interface InsightGeneration {
  id: string;
  text: string;
  insightType: string;
  sourceCheckins: string[];
}

export interface EmbeddingResult {
  id: string;
  vector: number[];
}

export interface PlantGenerationParams {
  archetype: string;
  params: {
    color: string;
    size: number;
    shape: string;
    growthRate: number;
  };
  position: { x: number; y: number; z: number };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Simple keyword-based emotion analysis
export function analyzeEmotion(text: string): EmotionAnalysis {
  const lowerText = text.toLowerCase();

  // Positive keywords
  const positiveKeywords = ['felice', 'bene', 'contento', 'sereno', 'rilassato', 'tranquillo', 'ottimo', 'meraviglioso', 'eccitato', 'entusiasta'];
  // Negative keywords
  const negativeKeywords = ['triste', 'ansioso', 'stressato', 'preoccupato', 'arrabbiato', 'frustrato', 'deluso', 'solo', 'stanco', 'depresso'];
  // Neutral keywords
  const neutralKeywords = ['normale', 'così così', 'indifferente', 'neutrale'];

  let positiveScore = 0;
  let negativeScore = 0;

  positiveKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) positiveScore += 1;
  });

  negativeKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) negativeScore += 1;
  });

  const totalKeywords = positiveScore + negativeScore;
  const sentimentScore = totalKeywords > 0 ? (positiveScore - negativeScore) / totalKeywords : 0;

  let emotionLabel = 'neutrale';
  if (sentimentScore > 0.3) emotionLabel = 'positivo';
  else if (sentimentScore < -0.3) emotionLabel = 'negativo';

  // Intensity based on keyword count and exclamation marks
  const intensity = Math.min(1, (totalKeywords * 0.2) + (text.split('!').length - 1) * 0.1);

  return {
    emotionLabel,
    sentimentScore,
    intensity
  };
}

// Placeholder for speech-to-text processing
export function processSTT(audioBuffer: Buffer): Promise<string> {
  // In production, this would call a real STT service like Google Speech-to-Text or OpenAI Whisper
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('Questo è un testo di esempio dalla trascrizione audio.');
    }, 100);
  });
}

// Generate insights from checkins
export function generateInsights(checkins: any[], userId: string): InsightGeneration[] {
  const insights: InsightGeneration[] = [];

  if (checkins.length < 3) {
    return insights; // Need minimum data for insights
  }

  const recentCheckins = checkins.slice(0, 10);
  const avgSentiment = recentCheckins.reduce((sum, c) => sum + (c.sentimentScore || 0), 0) / recentCheckins.length;

  if (avgSentiment > 0.2) {
    insights.push({
      id: uuidv4(),
      text: 'Your emotional garden is blooming! Keep nurturing those positive feelings.',
      insightType: 'trend_positive',
      sourceCheckins: recentCheckins.map(c => c.id.toString())
    });
  } else if (avgSentiment < -0.2) {
    insights.push({
      id: uuidv4(),
      text: 'Your garden shows some wilting. Consider activities that bring you peace and joy.',
      insightType: 'trend_negative',
      sourceCheckins: recentCheckins.map(c => c.id.toString())
    });
  }

  // Pattern recognition
  const emotionCounts: { [key: string]: number } = {};
  recentCheckins.forEach(checkin => {
    const emotion = checkin.emotionLabel || 'neutral';
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
  });

  const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) =>
    emotionCounts[a] > emotionCounts[b] ? a : b
  );

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
export function generateGardenKeeperInsight(checkins: any[], userId: string): string {
  const recentCheckins = checkins.slice(0, 5);

  if (recentCheckins.length === 0) {
    return 'Benvenuto nel tuo giardino! Inizia a condividere i tuoi pensieri per vedere crescere le tue piante digitali.';
  }

  const avgSentiment = recentCheckins.reduce((sum, c) => sum + (c.sentimentScore || 0), 0) / recentCheckins.length;

  if (avgSentiment > 0.3) {
    return 'Il tuo giardino sta fiorendo! Le tue piante positive stanno crescendo rigogliose. Continua a coltivare questi momenti felici.';
  } else if (avgSentiment < -0.3) {
    return 'Il tuo giardino ha bisogno di cure. Considera attività rilassanti come meditazione o passeggiate per aiutare le tue piante a riprendersi.';
  } else {
    return 'Il tuo giardino è in equilibrio. Ogni check-in è un seme che pianti. Continua a monitorare i tuoi stati d\'animo per vedere come cresce.';
  }
}

// Chatbot conversation logic
export async function generateChatbotResponse(
  userMessage: string,
  conversationHistory: ChatMessage[],
  recentCheckins: any[],
  userId: string
): Promise<string> {
  try {
    // Prepare emotional context from recent checkins
    const emotionalContext = prepareEmotionalContext(recentCheckins);

    // Build conversation context for OpenAI
    const messages = [
      {
        role: 'system' as const,
        content: `You are an empathetic AI companion for MindGarden, a mental wellness app that helps users track their emotions through digital gardens.

Your role is to:
- Provide supportive, non-judgmental listening
- Help users process their emotions
- Offer gentle suggestions for emotional wellness
- Reference their emotional patterns from recent check-ins when relevant
- Encourage healthy coping strategies
- Be conversational and warm, like a trusted friend

Current emotional context from user's recent check-ins:
${emotionalContext}

Guidelines:
- Keep responses conversational (2-4 sentences)
- Acknowledge their feelings first
- Ask open-ended questions to encourage sharing
- Suggest mindfulness or self-care when appropriate
- Never give medical advice
- If they're in crisis, gently suggest professional help`
      },
      // Include recent conversation history (last 5 messages)
      ...conversationHistory.slice(-5).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: userMessage
      }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 200
    });

    return response.choices[0]?.message?.content || 'I\'m here to listen. How are you feeling right now?';
  } catch (error) {
    console.error('OpenAI chatbot response failed:', error);
    // Fallback to rule-based response
    return generateFallbackChatbotResponse(userMessage, recentCheckins);
  }
}

// Prepare emotional context string from recent checkins
function prepareEmotionalContext(recentCheckins: any[]): string {
  if (recentCheckins.length === 0) {
    return 'No recent check-ins available. This appears to be their first conversation.';
  }

  const avgSentiment = recentCheckins.reduce((sum, c) => sum + (c.sentimentScore || 0), 0) / recentCheckins.length;

  const emotionCounts: Record<string, number> = {};
  recentCheckins.forEach(checkin => {
    const emotion = checkin.emotionLabel || 'neutral';
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
  });

  const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) =>
    emotionCounts[a] > emotionCounts[b] ? a : b, 'neutral'
  );

  const lastCheckin = recentCheckins[0];
  const daysSinceLastCheckin = Math.floor((Date.now() - new Date(lastCheckin.created_at).getTime()) / (1000 * 60 * 60 * 24));

  return `Recent emotional patterns:
- Average sentiment: ${avgSentiment > 0.2 ? 'positive' : avgSentiment < -0.2 ? 'negative' : 'neutral'}
- Dominant emotion: ${dominantEmotion}
- Number of recent check-ins: ${recentCheckins.length}
- Days since last check-in: ${daysSinceLastCheckin}
- Last check-in emotion: ${lastCheckin.emotionLabel || 'not analyzed'}`;
}

// Fallback chatbot response when OpenAI fails
function generateFallbackChatbotResponse(userMessage: string, recentCheckins: any[]): string {
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

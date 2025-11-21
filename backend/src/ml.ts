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
    // Simulate processing time
    setTimeout(() => {
      resolve('Questo è un testo di esempio trascritto dall\'audio. In produzione utilizzerebbe un servizio STT reale.');
    }, 1000);
  });
}

// Generate embeddings for text (placeholder)
export function generateEmbeddings(text: string): Promise<EmbeddingResult> {
  // In production, this would use a model like BERT or OpenAI embeddings
  return new Promise((resolve) => {
    const id = uuidv4();
    // Generate a simple hash-based vector (placeholder)
    const vector = Array.from(text).map(char => char.charCodeAt(0) % 100).slice(0, 128);
    resolve({ id, vector });
  });
}

// Generate plant based on emotion analysis
export function generatePlantFromEmotion(emotionAnalysis: EmotionAnalysis, existingPlants: any[]): PlantGenerationParams {
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

  const archetype = plantArchetypes[emotionLabel as keyof typeof plantArchetypes] || plantArchetypes.neutral;

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
function generatePlantPosition(existingPlants: any[]): { x: number; y: number; z: number } {
  const minDistance = 2;
  let attempts = 0;
  let position: { x: number; y: number; z: number };

  do {
    position = {
      x: (Math.random() - 0.5) * 16, // -8 to 8
      y: 0,
      z: (Math.random() - 0.5) * 16  // -8 to 8
    };
    attempts++;
  } while (attempts < 50 && existingPlants.some(plant =>
    Math.sqrt(
      Math.pow(plant.position.x - position.x, 2) +
      Math.pow(plant.position.z - position.z, 2)
    ) < minDistance
  ));

  return position;
}

// Generate personalized insights using OpenAI
export async function generateInsights(checkins: any[], userId: string): Promise<InsightGeneration[]> {
  const insights: InsightGeneration[] = [];

  if (checkins.length === 0) return insights;

  try {
    // Prepare checkin data for analysis
    const recentCheckins = checkins.slice(0, 20);
    const checkinSummary = recentCheckins.map(c => ({
      date: c.created_at,
      emotion: c.emotionLabel,
      sentiment: c.sentimentScore,
      text: c.text?.substring(0, 100) + (c.text?.length > 100 ? '...' : '')
    }));

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

    const result = response.choices[0]?.message?.content;
    if (result) {
      try {
        const parsedInsights = JSON.parse(result);
        parsedInsights.forEach((insight: any) => {
          insights.push({
            id: uuidv4(),
            text: insight.text,
            insightType: insight.insightType,
            sourceCheckins: insight.sourceCheckins || recentCheckins.map(c => c.id.toString())
          });
        });
      } catch (parseError) {
        console.error('Failed to parse OpenAI insights:', parseError);
      }
    }
  } catch (error) {
    console.error('OpenAI insights generation failed:', error);
  }

  // Fallback to rule-based insights if OpenAI fails
  if (insights.length === 0) {
    return generateInsightsFallback(checkins, userId);
  }

  return insights;
}

// Fallback rule-based insights
function generateInsightsFallback(checkins: any[], userId: string): InsightGeneration[] {
  const insights: InsightGeneration[] = [];

  if (checkins.length === 0) return insights;

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

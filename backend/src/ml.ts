import { v4 as uuidv4 } from 'uuid';

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

// Generate insights based on recent checkins
export function generateInsights(checkins: any[], userId: string): InsightGeneration[] {
  const insights: InsightGeneration[] = [];

  if (checkins.length === 0) return insights;

  // Insight 1: Trend analysis
  const recentCheckins = checkins.slice(0, 10);
  const avgSentiment = recentCheckins.reduce((sum, c) => sum + (c.sentimentScore || 0), 0) / recentCheckins.length;

  if (avgSentiment > 0.2) {
    insights.push({
      id: uuidv4(),
      text: 'Negli ultimi giorni hai mostrato un umore generalmente positivo. Continua così!',
      insightType: 'trend_positive',
      sourceCheckins: recentCheckins.map(c => c.id.toString())
    });
  } else if (avgSentiment < -0.2) {
    insights.push({
      id: uuidv4(),
      text: 'Negli ultimi giorni hai espresso sentimenti negativi. Considera di prenderti del tempo per te stesso.',
      insightType: 'trend_negative',
      sourceCheckins: recentCheckins.map(c => c.id.toString())
    });
  }

  // Insight 2: Pattern recognition
  const emotionCounts: { [key: string]: number } = {};
  recentCheckins.forEach(checkin => {
    const emotion = checkin.emotionLabel || 'neutrale';
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
  });

  const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) =>
    emotionCounts[a] > emotionCounts[b] ? a : b
  );

  if (emotionCounts[dominantEmotion] > 5) {
    insights.push({
      id: uuidv4(),
      text: `Hai espresso spesso emozioni di tipo "${dominantEmotion}". Questo potrebbe indicare un pattern ricorrente.`,
      insightType: 'pattern_recognition',
      sourceCheckins: recentCheckins.filter(c => c.emotionLabel === dominantEmotion).map(c => c.id.toString())
    });
  }

  // Insight 3: Encouragement
  const lastCheckin = checkins[0];
  if (lastCheckin && lastCheckin.sentimentScore < 0) {
    insights.push({
      id: uuidv4(),
      text: 'Ricorda che ogni giorno è una nuova opportunità. Il tuo giardino cresce con te.',
      insightType: 'encouragement',
      sourceCheckins: [lastCheckin.id.toString()]
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

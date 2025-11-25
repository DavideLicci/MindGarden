import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../backend/src/middleware/auth';
import { dbStatements } from '../../../backend/src/services/database.service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userId = parseInt(decoded.id);
    const { period = 'weekly' } = req.query; // 'weekly' or 'monthly'

    const days = period === 'monthly' ? 30 : 7;
    const checkins = await dbStatements.getCheckinsByUserId(userId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const periodCheckins = checkins.filter((c: any) => new Date(c.created_at) >= cutoffDate);

    if (periodCheckins.length === 0) {
      return res.json({
        period,
        message: `No check-ins found for the last ${days} days`,
        report: null
      });
    }

    // Calculate metrics
    const avgSentiment = periodCheckins.reduce((sum: number, c: any) => sum + (c.sentimentScore || 0), 0) / periodCheckins.length;
    const avgIntensity = periodCheckins.reduce((sum: number, c: any) => sum + (c.intensity || 0), 0) / periodCheckins.length;

    // Emotion distribution
    const emotionCounts: { [emotion: string]: number } = {};
    periodCheckins.forEach((c: any) => {
      const emotion = c.emotionLabel || 'neutral';
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    // Most common emotion
    const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) =>
      emotionCounts[a] > emotionCounts[b] ? a : b
    );

    // Trend analysis
    const firstHalf = periodCheckins.slice(0, Math.floor(periodCheckins.length / 2));
    const secondHalf = periodCheckins.slice(Math.floor(periodCheckins.length / 2));

    const firstHalfAvg = firstHalf.reduce((sum: number, c: any) => sum + (c.sentimentScore || 0), 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum: number, c: any) => sum + (c.sentimentScore || 0), 0) / secondHalf.length;

    let trend = 'stable';
    if (secondHalfAvg > firstHalfAvg + 0.1) trend = 'improving';
    else if (secondHalfAvg < firstHalfAvg - 0.1) trend = 'declining';

    // Generate insights
    const insights = [];
    if (avgSentiment > 0.2) {
      insights.push(`Your ${period} has been generally positive with an average sentiment of ${(avgSentiment * 100).toFixed(0)}%`);
    } else if (avgSentiment < -0.2) {
      insights.push(`Your ${period} has shown some challenges with an average sentiment of ${(avgSentiment * 100).toFixed(0)}%`);
    }

    insights.push(`Your most common emotion this ${period} was "${dominantEmotion}"`);
    insights.push(`Overall emotional trend: ${trend}`);

    res.json({
      period,
      dateRange: {
        from: cutoffDate.toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
      },
      metrics: {
        totalCheckins: periodCheckins.length,
        avgSentiment: parseFloat(avgSentiment.toFixed(2)),
        avgIntensity: parseFloat(avgIntensity.toFixed(2)),
        dominantEmotion,
        trend
      },
      emotionDistribution: emotionCounts,
      insights,
      recommendations: generateRecommendations(avgSentiment, dominantEmotion, trend)
    });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function generateRecommendations(avgSentiment: number, dominantEmotion: string, trend: string): string[] {
  const recommendations = [];

  if (avgSentiment < -0.3) {
    recommendations.push('Consider incorporating more positive activities into your routine');
    recommendations.push('Try mindfulness or meditation to help manage negative emotions');
  }

  if (dominantEmotion === 'anxiety' || dominantEmotion === 'fear') {
    recommendations.push('Consider breathing exercises or progressive muscle relaxation');
  }

  if (trend === 'declining') {
    recommendations.push('Reach out to friends or loved ones for support');
    recommendations.push('Consider professional help if negative patterns persist');
  }

  if (trend === 'improving') {
    recommendations.push('Keep up the great work! Continue the positive habits that are helping');
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue monitoring your emotional well-being');
    recommendations.push('Consider journaling about what brings you joy and peace');
  }

  return recommendations;
}

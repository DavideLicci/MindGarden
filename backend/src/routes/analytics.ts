import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { dbStatements } from '../services/database.service.sqlite';

const router = Router();

router.use(authMiddleware);

// GET /analytics/emotion-trends - Get emotion trends over time
router.get('/emotion-trends', async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.user!.id);
    const { days = 30 } = req.query;

    const checkins = await dbStatements.getCheckinsByUserId(userId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days as string));

    const recentCheckins = checkins.filter(c => new Date(c.created_at) >= cutoffDate);

    // Group by date and emotion
    const trends: { [date: string]: { [emotion: string]: number } } = {};
    const emotionCounts: { [emotion: string]: number } = {};

    recentCheckins.forEach(checkin => {
      const date = new Date(checkin.created_at).toISOString().split('T')[0];
      const emotion = checkin.emotionLabel || 'neutral';

      if (!trends[date]) trends[date] = {};
      trends[date][emotion] = (trends[date][emotion] || 0) + 1;
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    // Calculate sentiment averages per day
    const sentimentTrends: { date: string; avgSentiment: number; checkinCount: number }[] = [];

    Object.keys(trends).forEach(date => {
      const dayCheckins = recentCheckins.filter(c =>
        new Date(c.created_at).toISOString().split('T')[0] === date
      );
      const avgSentiment = dayCheckins.reduce((sum, c) => sum + (c.sentimentScore || 0), 0) / dayCheckins.length;

      sentimentTrends.push({
        date,
        avgSentiment: parseFloat(avgSentiment.toFixed(2)),
        checkinCount: dayCheckins.length
      });
    });

    res.json({
      emotionTrends: trends,
      sentimentTrends: sentimentTrends.sort((a, b) => a.date.localeCompare(b.date)),
      emotionSummary: emotionCounts,
      totalCheckins: recentCheckins.length
    });
  } catch (error) {
    console.error('Emotion trends error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /analytics/garden-health - Get garden health metrics
router.get('/garden-health', async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.user!.id);

    const garden = await dbStatements.getGardenByUserId(userId);
    const plants = await dbStatements.getPlantsByUserId(userId);
    const checkins = await dbStatements.getCheckinsByUserId(userId);

    // Calculate health metrics
    const avgPlantHealth = plants.length > 0
      ? plants.reduce((sum, p) => sum + p.health, 0) / plants.length
      : 0;

    const recentCheckins = checkins.slice(0, 10);
    const avgSentiment = recentCheckins.length > 0
      ? recentCheckins.reduce((sum, c) => sum + (c.sentimentScore || 0), 0) / recentCheckins.length
      : 0;

    // Growth progress
    const totalGrowth = plants.reduce((sum, p) => sum + p.growth_progress, 0);
    const avgGrowth = plants.length > 0 ? totalGrowth / plants.length : 0;

    // Health trend (compare last 5 vs previous 5)
    let healthTrend = 'stable';
    if (checkins.length >= 10) {
      const last5 = checkins.slice(0, 5);
      const prev5 = checkins.slice(5, 10);
      const last5Avg = last5.reduce((sum, c) => sum + (c.sentimentScore || 0), 0) / 5;
      const prev5Avg = prev5.reduce((sum, c) => sum + (c.sentimentScore || 0), 0) / 5;

      if (last5Avg > prev5Avg + 0.1) healthTrend = 'improving';
      else if (last5Avg < prev5Avg - 0.1) healthTrend = 'declining';
    }

    res.json({
      gardenHealth: garden?.health || 0,
      avgPlantHealth: parseFloat(avgPlantHealth.toFixed(2)),
      avgSentiment: parseFloat(avgSentiment.toFixed(2)),
      avgGrowth: parseFloat(avgGrowth.toFixed(2)),
      plantCount: plants.length,
      totalCheckins: checkins.length,
      healthTrend,
      lastCheckin: checkins.length > 0 ? checkins[0].created_at : null
    });
  } catch (error) {
    console.error('Garden health error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /analytics/achievements - Get user achievements and badges
router.get('/achievements', async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.user!.id);

    const checkins = await dbStatements.getCheckinsByUserId(userId);
    const plants = await dbStatements.getPlantsByUserId(userId);
    const garden = await dbStatements.getGardenByUserId(userId);

    const achievements = [];

    // Check-in achievements
    if (checkins.length >= 1) achievements.push({ id: 'first_checkin', name: 'First Steps', description: 'Made your first emotional check-in' });
    if (checkins.length >= 10) achievements.push({ id: 'regular_logger', name: 'Regular Logger', description: 'Made 10 check-ins' });
    if (checkins.length >= 50) achievements.push({ id: 'dedicated_gardener', name: 'Dedicated Gardener', description: 'Made 50 check-ins' });
    if (checkins.length >= 100) achievements.push({ id: 'master_gardener', name: 'Master Gardener', description: 'Made 100 check-ins' });

    // Emotional variety achievements
    const emotions = new Set(checkins.map(c => c.emotionLabel));
    if (emotions.size >= 3) achievements.push({ id: 'emotion_explorer', name: 'Emotion Explorer', description: 'Experienced 3 different emotions' });
    if (emotions.size >= 5) achievements.push({ id: 'emotion_master', name: 'Emotion Master', description: 'Experienced 5 different emotions' });

    // Positive streak achievements
    const positiveCheckins = checkins.filter(c => (c.sentimentScore || 0) > 0.2);
    if (positiveCheckins.length >= 7) achievements.push({ id: 'positive_week', name: 'Positive Week', description: '7 positive check-ins in a row' });

    // Plant achievements
    if (plants.length >= 5) achievements.push({ id: 'growing_garden', name: 'Growing Garden', description: 'Grew 5 plants' });
    if (plants.length >= 20) achievements.push({ id: 'flourishing_garden', name: 'Flourishing Garden', description: 'Grew 20 plants' });

    // Health achievements
    if (garden && garden.health >= 0.8) achievements.push({ id: 'healthy_garden', name: 'Healthy Garden', description: 'Maintained garden health above 80%' });

    // Streak achievements
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    for (let i = 0; i < checkins.length; i++) {
      const checkinDate = new Date(checkins[i].created_at).toISOString().split('T')[0];
      if (checkinDate === today || currentStreak > 0) {
        currentStreak++;
      } else {
        break;
      }
    }
    if (currentStreak >= 7) achievements.push({ id: 'week_streak', name: 'Week Streak', description: 'Checked in for 7 days straight' });
    if (currentStreak >= 30) achievements.push({ id: 'month_streak', name: 'Month Streak', description: 'Checked in for 30 days straight' });

    res.json({
      achievements,
      stats: {
        totalCheckins: checkins.length,
        totalPlants: plants.length,
        gardenHealth: garden?.health || 0,
        currentStreak,
        uniqueEmotions: emotions.size
      }
    });
  } catch (error) {
    console.error('Achievements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /analytics/report - Generate weekly/monthly report
router.get('/report', async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.user!.id);
    const { period = 'weekly' } = req.query; // 'weekly' or 'monthly'

    const days = period === 'monthly' ? 30 : 7;
    const checkins = await dbStatements.getCheckinsByUserId(userId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const periodCheckins = checkins.filter(c => new Date(c.created_at) >= cutoffDate);

    if (periodCheckins.length === 0) {
      return res.json({
        period,
        message: `No check-ins found for the last ${days} days`,
        report: null
      });
    }

    // Calculate metrics
    const avgSentiment = periodCheckins.reduce((sum, c) => sum + (c.sentimentScore || 0), 0) / periodCheckins.length;
    const avgIntensity = periodCheckins.reduce((sum, c) => sum + (c.intensity || 0), 0) / periodCheckins.length;

    // Emotion distribution
    const emotionCounts: { [emotion: string]: number } = {};
    periodCheckins.forEach(c => {
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

    const firstHalfAvg = firstHalf.reduce((sum, c) => sum + (c.sentimentScore || 0), 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, c) => sum + (c.sentimentScore || 0), 0) / secondHalf.length;

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
});

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

export default router;

import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { dbStatements } from '../../../shared/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

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

    const garden = await dbStatements.getGardenByUserId(userId);
    const plants = await dbStatements.getPlantsByUserId(userId);
    const checkins = await dbStatements.getCheckinsByUserId(userId);

    // Calculate health metrics
    const avgPlantHealth = plants.length > 0
      ? plants.reduce((sum: number, p: any) => sum + p.health, 0) / plants.length
      : 0;

    const recentCheckins = checkins.slice(0, 10);
    const avgSentiment = recentCheckins.length > 0
      ? recentCheckins.reduce((sum: number, c: any) => sum + (c.sentimentScore || 0), 0) / recentCheckins.length
      : 0;

    // Growth progress
    const totalGrowth = plants.reduce((sum: number, p: any) => sum + p.growth_progress, 0);
    const avgGrowth = plants.length > 0 ? totalGrowth / plants.length : 0;

    // Health trend (compare last 5 vs previous 5)
    let healthTrend = 'stable';
    if (checkins.length >= 10) {
      const last5 = checkins.slice(0, 5);
      const prev5 = checkins.slice(5, 10);
      const last5Avg = last5.reduce((sum: number, c: any) => sum + (c.sentimentScore || 0), 0) / 5;
      const prev5Avg = prev5.reduce((sum: number, c: any) => sum + (c.sentimentScore || 0), 0) / 5;

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
}

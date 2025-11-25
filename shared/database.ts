import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export interface Checkin {
  id: number;
  user_id: number;
  text: string | null;
  sttText: string | null;
  audioObjectKey: string | null;
  emotionLabel: string | null;
  sentimentScore: number | null;
  intensity: number | null;
  tags: string[];
  created_at: string;
}

export interface Plant {
  id: number;
  user_id: number;
  archetype: string;
  color: string;
  size: number;
  shape: string;
  growth_rate: number;
  position_x: number;
  position_y: number;
  position_z: number;
  health: number;
  growth_progress: number;
  created_at: string;
}

export interface Garden {
  id: number;
  user_id: number;
  health: number;
  created_at: string;
}

export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
}

class DatabaseService {
  async getCheckinsByUserId(userId: number, limit?: number): Promise<Checkin[]> {
    const query = limit
      ? 'SELECT * FROM checkins WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2'
      : 'SELECT * FROM checkins WHERE user_id = $1 ORDER BY created_at DESC';
    const params = limit ? [userId, limit] : [userId];
    const result = await pool.query(query, params);
    return result.rows;
  }

  async getCheckinById(checkinId: number): Promise<Checkin | null> {
    const result = await pool.query('SELECT * FROM checkins WHERE id = $1', [checkinId]);
    return result.rows[0] || null;
  }

  async createCheckin(userId: number, checkinData: Partial<Checkin>): Promise<number> {
    const { text, sttText, audioObjectKey, emotionLabel, sentimentScore, intensity, tags } = checkinData;
    const result = await pool.query(
      `INSERT INTO checkins (user_id, text, stt_text, audio_object_key, emotion_label, sentiment_score, intensity, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [userId, text, sttText, audioObjectKey, emotionLabel, sentimentScore, intensity, tags || []]
    );
    return result.rows[0].id;
  }

  async getPlantsByUserId(userId: number): Promise<Plant[]> {
    const result = await pool.query('SELECT * FROM plants WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows;
  }

  async getGardenByUserId(userId: number): Promise<Garden | null> {
    const result = await pool.query('SELECT * FROM gardens WHERE user_id = $1', [userId]);
    return result.rows[0] || null;
  }

  async updateGardenHealth(health: number, userId: number): Promise<void> {
    await pool.query(
      'UPDATE gardens SET health = $1 WHERE user_id = $2',
      [health, userId]
    );
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  async createUser(email: string, passwordHash: string): Promise<number> {
    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
      [email, passwordHash]
    );
    return result.rows[0].id;
  }

  async createGarden(userId: number): Promise<number> {
    const result = await pool.query(
      'INSERT INTO gardens (user_id, health) VALUES ($1, $2) RETURNING id',
      [userId, 0.5]
    );
    return result.rows[0].id;
  }
}

export const dbStatements = new DatabaseService();

import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({
  host: 'db.zrzujsvjrzuxuqwdzbor.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function initializeDatabase() {
  console.log('Initializing PostgreSQL database...');

  try {
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gardens (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        health REAL DEFAULT 0.5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS checkins (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        text TEXT,
        stt_text TEXT,
        audio_object_key TEXT,
        emotion_label TEXT,
        sentiment_score REAL,
        intensity REAL,
        tags JSONB DEFAULT '[]'::jsonb,
        embeddings_id TEXT,
        status TEXT DEFAULT 'complete',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS plants (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        checkin_id INTEGER REFERENCES checkins(id) ON DELETE SET NULL,
        archetype TEXT,
        params JSONB DEFAULT '{}'::jsonb,
        position JSONB DEFAULT '{}'::jsonb,
        style_skin TEXT,
        health REAL DEFAULT 0.5,
        growth_progress REAL DEFAULT 0.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS insights (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        insight_type TEXT,
        source_checkins JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        processing_mode TEXT DEFAULT 'cloud',
        audio_retention_days INTEGER DEFAULT 30,
        share_anonymized BOOLEAN DEFAULT false
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Database operations
export const dbStatements = {
  // Users
  createUser: async (email: string, password: string): Promise<number> => {
    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id',
      [email, password]
    );
    return result.rows[0].id;
  },
  getUserByEmail: async (email: string): Promise<any> => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  },

  // Gardens
  createGarden: async (userId: number): Promise<string> => {
    const id = uuidv4();
    await pool.query('INSERT INTO gardens (id, user_id) VALUES ($1, $2)', [id, userId]);
    return id;
  },
  getGardenByUserId: async (userId: number): Promise<any> => {
    const result = await pool.query('SELECT * FROM gardens WHERE user_id = $1', [userId]);
    return result.rows[0] || null;
  },
  updateGardenHealth: async (health: number, userId: number): Promise<void> => {
    await pool.query('UPDATE gardens SET health = $1 WHERE user_id = $2', [health, userId]);
  },

  // Checkins
  createCheckin: async (userId: number, data: any): Promise<number> => {
    const { text, sttText, audioObjectKey, emotionLabel, sentimentScore, intensity, tags } = data;
    const result = await pool.query(`
      INSERT INTO checkins (user_id, text, stt_text, audio_object_key, emotion_label, sentiment_score, intensity, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [userId, text, sttText, audioObjectKey, emotionLabel, sentimentScore, intensity, JSON.stringify(tags || [])]);
    return result.rows[0].id;
  },
  getCheckinsByUserId: async (userId: number): Promise<any[]> => {
    const result = await pool.query('SELECT * FROM checkins WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows.map(row => ({ ...row, tags: row.tags || [] }));
  },
  getCheckinById: async (id: number): Promise<any> => {
    const result = await pool.query('SELECT * FROM checkins WHERE id = $1', [id]);
    if (result.rows[0]) {
      return { ...result.rows[0], tags: result.rows[0].tags || [] };
    }
    return null;
  },
  getRecentCheckinsByUserId: async (userId: number, limit: number): Promise<any[]> => {
    const result = await pool.query('SELECT * FROM checkins WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2', [userId, limit]);
    return result.rows.map(row => ({ ...row, tags: row.tags || [] }));
  },

  // Plants
  createPlant: async (data: any): Promise<string> => {
    const { id, userId, checkinId, archetype, params, position, styleSkin, health, growthProgress } = data;
    await pool.query(`
      INSERT INTO plants (id, user_id, checkin_id, archetype, params, position, style_skin, health, growth_progress)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [id, userId, checkinId, archetype, JSON.stringify(params || {}), JSON.stringify(position || {}), styleSkin, health, growthProgress]);
    return id;
  },
  getPlantsByUserId: async (userId: number): Promise<any[]> => {
    const result = await pool.query('SELECT * FROM plants WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows.map(row => ({
      ...row,
      params: row.params || {},
      position: row.position || {}
    }));
  },
  getPlantById: async (id: string): Promise<any> => {
    const result = await pool.query('SELECT * FROM plants WHERE id = $1', [id]);
    if (result.rows[0]) {
      return {
        ...result.rows[0],
        params: result.rows[0].params || {},
        position: result.rows[0].position || {}
      };
    }
    return null;
  },
  updatePlantHealth: async (id: string, health: number, growthProgress: number): Promise<void> => {
    await pool.query('UPDATE plants SET health = $1, growth_progress = $2 WHERE id = $3', [health, growthProgress, id]);
  },

  // Insights
  createInsight: async (data: any): Promise<string> => {
    const { id, userId, text, insightType, sourceCheckins } = data;
    await pool.query(`
      INSERT INTO insights (id, user_id, text, insight_type, source_checkins)
      VALUES ($1, $2, $3, $4, $5)
    `, [id, userId, text, insightType, JSON.stringify(sourceCheckins || [])]);
    return id;
  },
  getInsightsByUserId: async (userId: number, limit: number): Promise<any[]> => {
    const result = await pool.query('SELECT * FROM insights WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2', [userId, limit]);
    return result.rows.map(row => ({ ...row, sourceCheckins: row.sourceCheckins || [] }));
  },

  // Settings
  getSettingsByUserId: async (userId: number): Promise<any> => {
    const result = await pool.query('SELECT * FROM settings WHERE user_id = $1', [userId]);
    return result.rows[0] || { userId, processingMode: 'cloud', audioRetentionDays: 30, shareAnonymized: false };
  },
  updateSettings: async (userId: number, data: any): Promise<void> => {
    const { processingMode, audioRetentionDays, shareAnonymized } = data;
    await pool.query(`
      INSERT INTO settings (user_id, processing_mode, audio_retention_days, share_anonymized)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id) DO UPDATE SET
        processing_mode = EXCLUDED.processing_mode,
        audio_retention_days = EXCLUDED.audio_retention_days,
        share_anonymized = EXCLUDED.share_anonymized
    `, [userId, processingMode, audioRetentionDays, shareAnonymized]);
  },
};

// Close database connection on process exit
process.on('exit', () => pool.end());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));

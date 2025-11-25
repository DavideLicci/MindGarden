"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbStatements = void 0;
exports.initializeDatabase = initializeDatabase;
const sqlite3 = __importStar(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const DB_PATH = path_1.default.join(__dirname, '..', 'mindgarden.db');
let db;
function initializeDatabase() {
    console.log('Initializing database at:', DB_PATH);
    db = new sqlite3.Database(DB_PATH);
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');
    // Create tables
    db.serialize(() => {
        db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        db.run(`
      CREATE TABLE IF NOT EXISTS gardens (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
        user_id INTEGER NOT NULL,
        health REAL DEFAULT 0.5,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
        db.run(`
      CREATE TABLE IF NOT EXISTS checkins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        text TEXT,
        stt_text TEXT,
        audio_object_key TEXT,
        emotion_label TEXT,
        sentiment_score REAL,
        intensity REAL,
        tags TEXT,
        embeddings_id TEXT,
        status TEXT DEFAULT 'complete',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
        db.run(`
      CREATE TABLE IF NOT EXISTS plants (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        checkin_id INTEGER,
        archetype TEXT,
        params TEXT,
        position TEXT,
        style_skin TEXT,
        health REAL DEFAULT 0.5,
        growth_progress REAL DEFAULT 0.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (checkin_id) REFERENCES checkins(id) ON DELETE SET NULL
      )
    `);
        db.run(`
      CREATE TABLE IF NOT EXISTS insights (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        text TEXT NOT NULL,
        insight_type TEXT,
        source_checkins TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
        db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        user_id INTEGER PRIMARY KEY,
        processing_mode TEXT DEFAULT 'cloud',
        audio_retention_days INTEGER DEFAULT 30,
        share_anonymized BOOLEAN DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    });
    console.log('Database initialized at', DB_PATH);
}
// Database operations
exports.dbStatements = {
    // Users
    createUser: (email, password) => {
        return new Promise((resolve, reject) => {
            db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, password], function (err) {
                if (err)
                    reject(err);
                else
                    resolve(this.lastID);
            });
        });
    },
    getUserByEmail: (email) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                if (err)
                    reject(err);
                else
                    resolve(row);
            });
        });
    },
    // Gardens
    createGarden: (userId) => {
        return new Promise((resolve, reject) => {
            const id = (0, uuid_1.v4)();
            db.run('INSERT INTO gardens (id, user_id) VALUES (?, ?)', [id, userId], function (err) {
                if (err)
                    reject(err);
                else
                    resolve(id);
            });
        });
    },
    getGardenByUserId: (userId) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM gardens WHERE user_id = ?', [userId], (err, row) => {
                if (err)
                    reject(err);
                else
                    resolve(row);
            });
        });
    },
    updateGardenHealth: (health, userId) => {
        return new Promise((resolve, reject) => {
            db.run('UPDATE gardens SET health = ? WHERE user_id = ?', [health, userId], function (err) {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    },
    // Checkins
    createCheckin: (userId, data) => {
        return new Promise((resolve, reject) => {
            const { text, sttText, audioObjectKey, emotionLabel, sentimentScore, intensity, tags } = data;
            db.run(`
        INSERT INTO checkins (user_id, text, stt_text, audio_object_key, emotion_label, sentiment_score, intensity, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [userId, text, sttText, audioObjectKey, emotionLabel, sentimentScore, intensity, JSON.stringify(tags || [])], function (err) {
                if (err)
                    reject(err);
                else
                    resolve(this.lastID);
            });
        });
    },
    getCheckinsByUserId: (userId) => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM checkins WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows.map(row => ({ ...row, tags: JSON.parse(row.tags || '[]') })));
            });
        });
    },
    getCheckinById: (id) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM checkins WHERE id = ?', [id], (err, row) => {
                if (err)
                    reject(err);
                else if (row)
                    resolve({ ...row, tags: JSON.parse(row.tags || '[]') });
                else
                    resolve(null);
            });
        });
    },
    getRecentCheckinsByUserId: (userId, limit) => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM checkins WHERE user_id = ? ORDER BY created_at DESC LIMIT ?', [userId, limit], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows.map((row) => ({ ...row, tags: JSON.parse(row.tags || '[]') })));
            });
        });
    },
    // Plants
    createPlant: (data) => {
        return new Promise((resolve, reject) => {
            const { id, userId, checkinId, archetype, params, position, styleSkin, health, growthProgress } = data;
            db.run(`
        INSERT INTO plants (id, user_id, checkin_id, archetype, params, position, style_skin, health, growth_progress)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [id, userId, checkinId, archetype, JSON.stringify(params || {}), JSON.stringify(position || {}), styleSkin, health, growthProgress], function (err) {
                if (err)
                    reject(err);
                else
                    resolve(id);
            });
        });
    },
    getPlantsByUserId: (userId) => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM plants WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows.map(row => ({
                        ...row,
                        params: JSON.parse(row.params || '{}'),
                        position: JSON.parse(row.position || '{}')
                    })));
            });
        });
    },
    getPlantById: (id) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM plants WHERE id = ?', [id], (err, row) => {
                if (err)
                    reject(err);
                else if (row)
                    resolve({
                        ...row,
                        params: JSON.parse(row.params || '{}'),
                        position: JSON.parse(row.position || '{}')
                    });
                else
                    resolve(null);
            });
        });
    },
    updatePlantHealth: (id, health, growthProgress) => {
        return new Promise((resolve, reject) => {
            db.run('UPDATE plants SET health = ?, growth_progress = ? WHERE id = ?', [health, growthProgress, id], function (err) {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    },
    // Insights
    createInsight: (data) => {
        return new Promise((resolve, reject) => {
            const { id, userId, text, insightType, sourceCheckins } = data;
            db.run(`
        INSERT INTO insights (id, user_id, text, insight_type, source_checkins)
        VALUES (?, ?, ?, ?, ?)
      `, [id, userId, text, insightType, JSON.stringify(sourceCheckins || [])], function (err) {
                if (err)
                    reject(err);
                else
                    resolve(id);
            });
        });
    },
    getInsightsByUserId: (userId, limit) => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM insights WHERE user_id = ? ORDER BY created_at DESC LIMIT ?', [userId, limit], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows.map(row => ({ ...row, sourceCheckins: JSON.parse(row.source_checkins || '[]') })));
            });
        });
    },
    // Settings
    getSettingsByUserId: (userId) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM settings WHERE user_id = ?', [userId], (err, row) => {
                if (err)
                    reject(err);
                else
                    resolve(row || { userId, processingMode: 'cloud', audioRetentionDays: 30, shareAnonymized: false });
            });
        });
    },
    updateSettings: (userId, data) => {
        return new Promise((resolve, reject) => {
            const { processingMode, audioRetentionDays, shareAnonymized } = data;
            db.run(`
        INSERT OR REPLACE INTO settings (user_id, processing_mode, audio_retention_days, share_anonymized)
        VALUES (?, ?, ?, ?)
      `, [userId, processingMode, audioRetentionDays, shareAnonymized], function (err) {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    },
};
// Close database connection on process exit
process.on('exit', () => db === null || db === void 0 ? void 0 : db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));

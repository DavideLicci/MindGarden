import * as sqlite3 from 'sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', 'mindgarden.db');

let db: sqlite3.Database;

export function initializeDatabase() {
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
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        mood TEXT NOT NULL,
        text TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
  });

  console.log('Database initialized at', DB_PATH);
}

// Database operations
export const dbStatements = {
  // Users
  createUser: (email: string, password: string): Promise<number> => {
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, password], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },
  getUserByEmail: (email: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // Gardens
  createGarden: (userId: number): Promise<number> => {
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO gardens (user_id) VALUES (?)', [userId], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },
  getGardenByUserId: (userId: number): Promise<any> => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM gardens WHERE user_id = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  updateGardenHealth: (health: number, userId: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.run('UPDATE gardens SET health = ? WHERE user_id = ?', [health, userId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  },

  // Checkins
  createCheckin: (userId: number, mood: string, text: string | null): Promise<number> => {
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO checkins (user_id, mood, text) VALUES (?, ?, ?)', [userId, mood, text], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },
  getCheckinsByUserId: (userId: number): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM checkins WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  getRecentCheckinsByUserId: (userId: number, limit: number): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM checkins WHERE user_id = ? ORDER BY created_at DESC LIMIT ?', [userId, limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
};

// Close database connection on process exit
process.on('exit', () => db?.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));

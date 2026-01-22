const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/plexyfin.db');
let db;

function getDb() {
  if (!db) {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
      }
    });
  }
  return db;
}

async function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = getDb();
    
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Media items table
      db.run(`
        CREATE TABLE IF NOT EXISTS media (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          type TEXT NOT NULL,
          file_path TEXT UNIQUE NOT NULL,
          folder_path TEXT,
          duration INTEGER,
          size INTEGER,
          codec TEXT,
          resolution TEXT,
          year INTEGER,
          genre TEXT,
          rating REAL,
          overview TEXT,
          poster_url TEXT,
          backdrop_url TEXT,
          tmdb_id TEXT,
          imdb_id TEXT,
          tvdb_id TEXT,
          added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Watch history table
      db.run(`
        CREATE TABLE IF NOT EXISTS watch_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          media_id INTEGER NOT NULL,
          progress INTEGER DEFAULT 0,
          completed BOOLEAN DEFAULT 0,
          last_watched DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (media_id) REFERENCES media(id),
          UNIQUE(user_id, media_id)
        )
      `);
      
      // Sessions table
      db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          media_id INTEGER NOT NULL,
          started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          device TEXT,
          ip_address TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (media_id) REFERENCES media(id)
        )
      `);
      
      // Create default admin user if none exists
      db.get('SELECT COUNT(*) as count FROM users', async (err, row) => {
        if (err) {
          console.error('Error checking users:', err);
          reject(err);
          return;
        }
        
        if (row.count === 0) {
          const hashedPassword = await bcrypt.hash('admin', 10);
          db.run(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            ['admin', 'admin@plexyfin.local', hashedPassword, 'admin'],
            (err) => {
              if (err) {
                console.error('Error creating admin user:', err);
                reject(err);
              } else {
                console.log('✅ Default admin user created (username: admin, password: admin)');
                console.log('⚠️  Please change the default password after first login!');
                resolve();
              }
            }
          );
        } else {
          resolve();
        }
      });
    });
  });
}

function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    getDb().run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function getQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    getDb().get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    getDb().all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

module.exports = {
  getDb,
  initDatabase,
  runQuery,
  getQuery,
  allQuery
};

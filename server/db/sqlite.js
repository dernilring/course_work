const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, '../data/movies.db'))

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL')

// --- Schema ---

db.exec(`
  CREATE TABLE IF NOT EXISTS movie_embeddings (
    tmdb_id     TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    embedding   TEXT NOT NULL,   -- JSON array of 384 floats
    overview    TEXT,
    genre       TEXT,
    rating      REAL,
    year        TEXT,
    poster      TEXT,
    cached_at   INTEGER DEFAULT (strftime('%s','now'))
  );

  CREATE TABLE IF NOT EXISTS user_actions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    tmdb_id     TEXT NOT NULL,
    action      TEXT NOT NULL CHECK(action IN ('like','dislike','watched','watchlist')),
    created_at  INTEGER DEFAULT (strftime('%s','now')),
    UNIQUE(tmdb_id, action)
  );
`)

// --- Movie embeddings ---

function saveEmbedding(movie, embedding) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO movie_embeddings
      (tmdb_id, title, embedding, overview, genre, rating, year, poster)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  stmt.run(
    movie.id,
    movie.Series_Title,
    JSON.stringify(embedding),
    movie.Overview,
    movie.Genre,
    parseFloat(movie.IMDB_Rating) || null,
    movie.Released_Year,
    movie.Poster_Link
  )
}

function getEmbedding(tmdbId) {
  const row = db.prepare('SELECT * FROM movie_embeddings WHERE tmdb_id = ?').get(tmdbId)
  if (!row) return null
  return { ...row, embedding: JSON.parse(row.embedding) }
}

function getAllEmbeddings() {
  const rows = db.prepare('SELECT * FROM movie_embeddings').all()
  return rows.map(r => ({ ...r, embedding: JSON.parse(r.embedding) }))
}

function hasEmbedding(tmdbId) {
  return !!db.prepare('SELECT 1 FROM movie_embeddings WHERE tmdb_id = ?').get(tmdbId)
}

// --- User actions ---

function saveAction(tmdbId, action) {
  db.prepare(`
    INSERT OR REPLACE INTO user_actions (tmdb_id, action) VALUES (?, ?)
  `).run(tmdbId, action)
}

function removeAction(tmdbId, action) {
  db.prepare('DELETE FROM user_actions WHERE tmdb_id = ? AND action = ?').run(tmdbId, action)
}

function getActions() {
  return db.prepare('SELECT * FROM user_actions ORDER BY created_at DESC').all()
}

function getActionsByType(action) {
  return db.prepare('SELECT * FROM user_actions WHERE action = ?').all(action)
}

function getActionMap() {
  const actions = getActions()
  const map = {}
  for (const a of actions) {
    if (!map[a.tmdb_id]) map[a.tmdb_id] = new Set()
    map[a.tmdb_id].add(a.action)
  }
  return map
}

module.exports = {
  saveEmbedding, getEmbedding, getAllEmbeddings, hasEmbedding,
  saveAction, removeAction, getActions, getActionsByType, getActionMap
}
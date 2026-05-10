const { getSemanticRecommendations } = require("../services/similarity");
const { getEmbedding, saveEmbedding, hasEmbedding } = require("../db/sqlite");
const { getMovieById, getMovieTextForEmbedding } = require("../services/omdb");
const { embed } = require("../services/embeddings");

/**
 * Ensure a movie has an embedding in SQLite.
 * If not — fetch from TMDB, embed, and save.
 */
async function ensureEmbedding(tmdbId) {
  if (hasEmbedding(tmdbId)) {
    console.log("эмбеддинг уже есть:", tmdbId);
    return;
  }

  const movie = await getMovieById(tmdbId);
  const text = await getMovieTextForEmbedding(tmdbId, movie.Overview);
  const vector = await embed(text);
  saveEmbedding(movie, vector);
}

// GET /api/recommendations/:id
async function getRecommendations(req, res) {
  try {
    const tmdbId = req.params.id;
    if (!tmdbId) return res.status(400).json({ error: "Invalid movie id" });

    await ensureEmbedding(tmdbId);
    const recommendations = await getSemanticRecommendations(tmdbId, 10);
    console.log("recommendations:", recommendations.length);

    res.json(recommendations);
  } catch (err) {
    console.error("Recommendations error:", err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /api/recommendations/seed
 * Pre-computes embeddings for top N movies from TMDB.
 * Call this once after server start (or via a script).
 */
async function seedEmbeddings(req, res) {
  try {
    const { getTopMovies } = require("../services/omdb");
    const pages = req.body.pages || 3; 
    let seeded = 0;

    for (let page = 1; page <= pages; page++) {
      const movies = await getTopMovies(page);
      for (const movie of movies) {
        if (!hasEmbedding(movie.id)) {
          try {
            const text = await getMovieTextForEmbedding(
              movie.id,
              movie.Overview,
            );
            const vector = await embed(text);
            saveEmbedding(movie, vector);
            seeded++;
            console.log(`Embedded [${seeded}]: ${movie.Series_Title}`);
          } catch (e) {
            console.warn(`Skipped ${movie.Series_Title}:`, e.message);
          }
        }
      }
    }

    res.json({ seeded, message: `Successfully embedded ${seeded} movies` });
  } catch (err) {
    console.error("Seed error:", err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getRecommendations, seedEmbeddings, ensureEmbedding };

const { cosineSimilarity, averageVectors, subtractVectors } = require('./embeddings')
const { getEmbedding, getAllEmbeddings, getActionsByType } = require('../db/sqlite')

/**
 * Find movies similar to a target movie using semantic embeddings.
 * Optionally blends in the user's taste profile (from liked/disliked movies).
 *
 * @param {number} targetTmdbId - TMDB id of the movie to find recommendations for
 * @param {number} topN - how many results to return
 * @returns {Array} sorted list of similar movies with scores
 */
async function getSemanticRecommendations(targetTmdbId, topN = 10) {
  // 1. Get target embedding
  const target = getEmbedding(targetTmdbId)
  if (!target) throw new Error(`No embedding found for movie ${targetTmdbId}`)

  // 2. Build user taste profile from liked/disliked movies
  const likedIds = getActionsByType('like').map(a => a.tmdb_id)
  const dislikedIds = getActionsByType('dislike').map(a => a.tmdb_id)

  const likedEmbeddings = likedIds
    .map(id => getEmbedding(id))
    .filter(Boolean)
    .map(e => e.embedding)

  const dislikedEmbeddings = dislikedIds
    .map(id => getEmbedding(id))
    .filter(Boolean)
    .map(e => e.embedding)

  // 3. Build query vector = blend of target + user profile
  let queryVector = [...target.embedding]

  if (likedEmbeddings.length > 0) {
    const profileVector = averageVectors(likedEmbeddings)
    // 70% current movie, 30% user taste profile
    queryVector = queryVector.map((x, i) => x * 0.7 + profileVector[i] * 0.3)
  }

  // Subtract disliked content from query
  if (dislikedEmbeddings.length > 0) {
    queryVector = subtractVectors(queryVector, dislikedEmbeddings, 0.2)
  }

  // 4. Score all movies in DB
  const all = getAllEmbeddings()

  const results = all
    .filter(m => m.tmdb_id !== targetTmdbId)
    .filter(m => !dislikedIds.includes(m.tmdb_id)) // don't recommend disliked movies
    .map(m => {
      const semanticScore = cosineSimilarity(queryVector, m.embedding)

      // Small bonus for genre overlap (keep some genre logic as a tiebreaker)
      const targetGenres = new Set((target.genre || '').split(',').map(g => g.trim()))
      const movieGenres = new Set((m.genre || '').split(',').map(g => g.trim()))
      const intersection = [...targetGenres].filter(g => movieGenres.has(g)).length
      const union = new Set([...targetGenres, ...movieGenres]).size
      const genreBonus = union > 0 ? (intersection / union) * 0.1 : 0

      const totalScore = semanticScore + genreBonus

      return {
        id: m.tmdb_id,
        Series_Title: m.title,
        Overview: m.overview,
        Genre: m.genre,
        IMDB_Rating: m.rating,
        Released_Year: m.year,
        Poster_Link: m.poster,
        totalScore,
        semanticScore: +semanticScore.toFixed(4),
        // Why this was recommended (shown in UI)
        reason: buildReason(target, m, semanticScore, likedEmbeddings.length)
      }
    })
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, topN)

  return results
}

// Build a short human-readable reason string for the UI "why this film?" feature
function buildReason(target, candidate, score, likedCount) {
  if (score > 0.85) return `Very similar theme and tone to ${target.title}`
  if (score > 0.75) return `Similar story and mood`
  if (likedCount > 0 && score > 0.65) return `Matches your taste based on liked films`
  return `Thematically related`
}

module.exports = { getSemanticRecommendations }
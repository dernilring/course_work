const {
  cosineSimilarity,
  averageVectors,
  subtractVectors,
} = require("./embeddings");
const {
  getEmbedding,
  getAllEmbeddings,
  getActionsByType,
} = require("../db/sqlite");

/**
 * Find movies similar to a target movie using semantic embeddings.
 * Optionally blends in the user's taste profile (from liked/disliked movies).
 *
 * @param {number} targettmdbId - tmdb id of the movie to find recommendations for
 * @param {number} topN - how many results to return
 * @returns {Array} sorted list of similar movies with scores
 */
async function getSemanticRecommendations(targetTmdbId, topN = 10) {
  const target = getEmbedding(targetTmdbId);
  console.log("target:", target ? "найден" : "НЕ НАЙДЕН");
  if (!target) throw new Error(`No embedding found for movie ${targetTmdbId}`);

  const likedIds = getActionsByType("like").map((a) => a.tmdb_id);
  console.log("лайкнутых:", likedIds);
  const dislikedIds = getActionsByType("dislike").map((a) => a.tmdb_id);

  const likedEmbeddings = likedIds
    .map((id) => getEmbedding(id))
    .filter(Boolean)
    .map((e) => e.embedding);

  const dislikedEmbeddings = dislikedIds
    .map((id) => getEmbedding(id))
    .filter(Boolean)
    .map((e) => e.embedding);

  // blend of target + user profile
  let queryVector = [...target.embedding];

  if (likedEmbeddings.length > 0) {
    const profileVector = averageVectors(likedEmbeddings);
    queryVector = queryVector.map((x, i) => x * 0.7 + profileVector[i] * 0.3);
  }

  if (dislikedEmbeddings.length > 0) {
    queryVector = subtractVectors(queryVector, dislikedEmbeddings, 0.2);
  }

  const all = getAllEmbeddings();

  console.log("всего в БД:", all.length);
  const results = all
    .filter((m) => m.tmdb_id !== targetTmdbId)
    .filter((m) => !dislikedIds.includes(m.tmdb_id))
    .map((m) => {
      const semanticScore = cosineSimilarity(queryVector, m.embedding);

      const ratingMap = {
        G: 0,
        PG: 6,
        "PG-13": 13,
        R: 17,
        "NC-17": 18,
        "TV-Y": 0,
        "TV-Y7": 7,
        "TV-G": 0,
        "TV-PG": 6,
        "TV-14": 14,
        "TV-MA": 18,
      };

      const targetAge = ratingMap[target.certificate] ?? null;
      const movieAge = ratingMap[m.certificate] ?? null;
      const ageBonus =
        targetAge !== null && movieAge !== null
          ? (1 - Math.abs(targetAge - movieAge) / 18) * 0.5
          : 0;

      const targetGenres = new Set(
        (target.genre || "").split(",").map((g) => g.trim()),
      );
      const movieGenres = new Set(
        (m.genre || "").split(",").map((g) => g.trim()),
      );
      const intersection = [...targetGenres].filter((g) =>
        movieGenres.has(g),
      ).length;
      const union = new Set([...targetGenres, ...movieGenres]).size;
      const genreBonus = union > 0 ? (intersection / union) * 0.3 : 0;

      const totalScore = semanticScore + genreBonus + ageBonus;

      return {
        id: m.tmdb_id,
        Series_Title: m.title,
        Overview: m.overview,
        Genre: m.genre,
        IMDB_Rating: m.rating,
        Released_Year: m.year,
        Poster_Link: m.poster,
         Certificate: m.certificate, 
        totalScore,
        semanticScore: +semanticScore.toFixed(4),
        reason: buildReason(target, m, semanticScore, likedEmbeddings.length),
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, topN);

  return results;
}

function buildReason(target, candidate, score, likedCount) {
  const reasons = [];

  const targetGenres = new Set(
    (target.genre || "").split(",").map((g) => g.trim()),
  );
  const candidateGenres = (candidate.genre || "")
    .split(",")
    .map((g) => g.trim());
  const sharedGenres = candidateGenres.filter((g) => targetGenres.has(g));

  if (sharedGenres.length > 0) {
    reasons.push(`Общие жанры: ${sharedGenres.join(", ")}`);
  }

  const ratingDiff = Math.abs((target.rating || 0) - (candidate.rating || 0));
  if (ratingDiff <= 0.3) {
    reasons.push(`Схожий рейтинг (${candidate.rating})`);
  }

  const targetYear = parseInt(target.year);
  const candidateYear = parseInt(candidate.year);
  if (!isNaN(targetYear) && !isNaN(candidateYear)) {
    if (Math.abs(targetYear - candidateYear) <= 10) {
      reasons.push(`Из той же эпохи (${candidateYear})`);
    }
  }

  if (score > 0.85) {
    reasons.push("Очень похожий сюжет и атмосфера");
  } else if (score > 0.75) {
    reasons.push("Похожая история и настроение");
  } else if (likedCount > 0 && score > 0.65) {
    reasons.push("Соответствует вашему вкусу");
  }

  return reasons.length > 0 ? reasons.join(" · ") : "Высокий рейтинг IMDb";
}

module.exports = { getSemanticRecommendations };

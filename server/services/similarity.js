function jaccardSimilarity(setA, setB) {
  const A = new Set(setA);
  const B = new Set(setB);

  const intersection = new Set([...A].filter((a) => B.has(a)));
  const union = new Set([...A, ...B]);
  if (union.size === 0) return 0;

  return intersection.size / union.size;
}

function normalize(value, min, max) {
  if (min === max) return 0;
  return (value - min) / (max - min);
}


function getSimilarMovies(target, allMovies) {
  // фильтруем только валидные числа
  const validMovies = allMovies.filter(m => 
    !isNaN(m.Meta_score) && 
    !isNaN(m.IMDB_Rating) && 
    !isNaN(m.Released_Year) &&
    m.Released_Year > 0
  );

  let scores = validMovies.map((m) => m.Meta_score);
  let ratings = validMovies.map((m) => m.IMDB_Rating);
  let releasedYears = validMovies.map((m) => m.Released_Year);

  let minScore = Math.min(...scores);
  let minRatings = Math.min(...ratings);
  let minReleasedYears = Math.min(...releasedYears);
  let maxScore = Math.max(...scores);
  let maxRatings = Math.max(...ratings);
  let maxReleasedYears = Math.max(...releasedYears);

  return allMovies
    .filter((movie) => movie.id !== target.id)
    .map((movie) => {
      const genreScore = jaccardSimilarity(target.genres, movie.genres);
      const score = isNaN(movie.Meta_score) ? 0 : 
        1 - Math.abs(normalize(target.Meta_score, minScore, maxScore) - normalize(movie.Meta_score, minScore, maxScore));
      const rating = isNaN(movie.IMDB_Rating) ? 0 :
        1 - Math.abs(normalize(target.IMDB_Rating, minRatings, maxRatings) - normalize(movie.IMDB_Rating, minRatings, maxRatings));
      const releasedYear = isNaN(movie.Released_Year) || movie.Released_Year === 0 ? 0 :
        1 - Math.abs(normalize(target.Released_Year, minReleasedYears, maxReleasedYears) - normalize(movie.Released_Year, minReleasedYears, maxReleasedYears));
      
      const totalScore = genreScore * 0.5 + score * 0.3 + rating * 0.3 + releasedYear * 0.2;
      return { ...movie, totalScore };
    })
    .sort((a, b) => b.totalScore - a.totalScore);
}




module.exports = { getSimilarMovies };

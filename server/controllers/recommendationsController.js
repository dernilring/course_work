const { poolPromise, sql } = require("../db");
const { getSimilarMovies } = require("../services/similarity");

async function getRecommendations(req, res) {
  try {
    const { id } = req.params;
    console.log("ID:", id);

    const pool = await poolPromise;

    const targetResult = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM imdb_movies WHERE id = @id");

    const allResult = await pool.request().query("SELECT * FROM imdb_movies");

    const targetRow = targetResult.recordset[0];
    console.log("колонки:", Object.keys(targetRow));

    const allMovies = allResult.recordset.map((m) => ({
      ...m,
      genres: m.Genre.split(",").map((g) => g.trim()),
      Meta_score: m.Meta_score ? Number(m.Meta_score) : 0,
      IMDB_Rating: Number(m.IMDB_Rating),
      Released_Year: Number(m.Released_Year),
    }));

    const target = {
      ...targetRow,
      genres: targetRow.Genre.split(",").map((g) => g.trim()),
        Meta_score: targetRow.Meta_score ? Number(targetRow.Meta_score) : 0,
      IMDB_Rating: Number(targetRow.IMDB_Rating),
      Released_Year: Number(targetRow.Released_Year),
    };

    const result = getSimilarMovies(target, allMovies);
    console.log(
      "target:",
      target.Series_Title,
      target.genres,
      target.Meta_score,
      target.IMDB_Rating,
      target.Released_Year,
    );
    console.log(
      "top 3:",
      result.slice(0, 3).map((m) => ({
        title: m.Series_Title,
        score: m.totalScore,
        genres: m.genres,
      })),
    );
    res.json(result.slice(0, 10));
  } catch (err) {
    console.error("ОШИБКА:", err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getRecommendations };

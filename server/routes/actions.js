const router = require("express").Router();
const { sql, poolPromise } = require("../db.js");

router.post("/actions", (req, res) => {
  try {
    const { movieId, action } = req.body;

    const pool = await poolPromise
    await pool
    .request()
    .input('movieId',sql.Int, movieId )
    .input('action', sql.VarChar, action)
    .query(`INSERT INTO UserActions (movieId, action) VALUES (@movieId, @action) `)

    res.json({ success: true });
  } catch {
     res.status(500).json({ error: err.message });
  }
});

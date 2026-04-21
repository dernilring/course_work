const router = require("express").Router();
const { sql, poolPromise } = require("../db.js");

router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
      console.log("page:", page, "limit:", limit, "offset:", offset);

    const result = await pool
      .request()
      .input('limit', sql.Int, limit)
      .input('offset', sql.Int , offset)
      .query('SELECT * FROM imdb_movies ORDER BY id OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

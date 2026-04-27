const router = require("express").Router();
const {
  getTopMovies,
  getMovieById,
  searchMovies,
} = require("../services/omdb");
const { saveAction, removeAction, getActionMap } = require("../db/sqlite");
const { ensureEmbedding } = require("../controllers/recommendationsController");

// GET /films?page=1&limit=20
router.get("/", async (req, res) => {
  try {
    const page = req.query.page || 1;
    // omdb returns 20 per page — matches your current limit
    const omdbPage = Math.ceil(page);
    const movies = await getTopMovies(omdbPage);

    // Attach user actions so frontend can show like/watchlist state
    const actionMap = getActionMap();
    const result = movies.map((m) => ({
      ...m,
      userActions: [...(actionMap[m.id] || [])],
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /films/search?q=inception
router.get("/search", async (req, res) => {
  try {
    const { q, page = 1 } = req.query;
    if (!q) return res.status(400).json({ error: "Query required" });
    const movies = await searchMovies(q, page);
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /films/actions/all — get all user actions (for profile page / watchlist)
router.get("/actions/all", async (req, res) => {
  try {
    const { getActions } = require("../db/sqlite");
    res.json(getActions());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /films/:id — single movie detail
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const movie = await getMovieById(id);

    // Pre-compute embedding in background (don't block response)
    ensureEmbedding(id).catch(console.warn);

    const actionMap = getActionMap();
    res.json({ ...movie, userActions: [...(actionMap[id] || [])] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /films/:id/action — like, dislike, watched, watchlist
// Body: { action: 'like', active: true/false }
router.post("/:id/action", async (req, res) => {
  console.log("ACTION:", req.params.id, req.body);
  try {
    const omdbId = req.params.id;
    const { action, active } = req.body;

    const validActions = ["like", "dislike", "watched", "watchlist"];
    if (!validActions.includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }

    console.log("saving...", omdbId, action, active);
    if (active) {
      // If liking, remove dislike (and vice versa — can't do both)
      if (action === "like") removeAction(omdbId, "dislike");
      if (action === "dislike") removeAction(omdbId, "like");
      saveAction(omdbId, action);
      console.log("saved!");
      // When user likes/dislikes, make sure we have an embedding for this movie
      // (needed for user profile calculations)
      ensureEmbedding(omdbId).catch(console.warn);
    } else {
      removeAction(omdbId, action);
    }

    res.json({ success: true, omdbId, action, active });
  } catch (err) {
    console.error("ACTION ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

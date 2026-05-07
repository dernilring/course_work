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
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort || "default";
    const TOTAL_IDS = 100;
    const PER_PAGE = 20;
    const TOTAL_PAGES = TOTAL_IDS / PER_PAGE; // = 5

    let movies;
    if (sort === "rating_asc") {
      const reversedPage = TOTAL_PAGES - page + 1;
      movies = reversedPage < 1 ? [] : await getTopMovies(reversedPage, true);
    } else {
      movies = await getTopMovies(page);
    }

    const actionMap = getActionMap();
    const result = movies.map((m) => ({
      ...m,
      userActions: [...(actionMap[m.id] || [])],
    }));

    res.json({ movies: result, hasMore: page < TOTAL_PAGES });
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

router.get("/:id/trailer", async (req, res) => {
  try {
    const movie = await getMovieById(req.params.id);
    const query = encodeURIComponent(
      `${movie.Series_Title} ${movie.Released_Year} official trailer`,
    );
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=1&key=${process.env.YOUTUBE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return res.json({ videoId: null });
    }

    res.json({ videoId: data.items[0].id.videoId });
  } catch {
    res.status(500).json({ error: err.message });
  }
});

// GET /films/:id — single movie detail
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const movie = await getMovieById(id);

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
      if (action === "like") removeAction(omdbId, "dislike");
      if (action === "dislike") removeAction(omdbId, "like");
      saveAction(omdbId, action);
      console.log("saved!");
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

const router = require('express').Router()
const { getRecommendations, seedEmbeddings } = require('../controllers/recommendationsController')

// GET /api/recommendations/:id — get similar movies for a given TMDB movie id
router.get('/:id', getRecommendations)

// POST /api/recommendations/seed — pre-compute embeddings for top movies
// Call once: curl -X POST http://localhost:5000/api/recommendations/seed -H "Content-Type: application/json" -d '{"pages":5}'
router.post('/seed', seedEmbeddings)

module.exports = router
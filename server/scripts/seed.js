/**
 * Run once to pre-compute embeddings for top omdb movies:
 *   node scripts/seed.js
 *
 * Or pass number of pages (20 movies each):
 *   node scripts/seed.js 10
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const fs = require('fs')
const path = require('path')

const dataDir = path.join(__dirname, '../data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir)

const { getTopMovies, getMovieTextForEmbedding } = require('../services/omdb')
const { embed } = require('../services/embeddings')
const { saveEmbedding, hasEmbedding } = require('../db/sqlite')

async function seed() {
  const pages = parseInt(process.argv[2]) || 5 // default 5 pages = ~100 movies
  console.log(`Seeding embeddings for ${pages} pages of top movies...`)
  let total = 0

  for (let page = 1; page <= pages; page++) {
    console.log(`\nFetching page ${page}/${pages} from OMDb...`)
    const movies = await getTopMovies(page)

    for (const movie of movies) {
      if (hasEmbedding(movie.id)) {
        console.log(`  [skip] ${movie.Series_Title}`)
        continue
      }
      try {
        const text = await getMovieTextForEmbedding(movie.id, movie.Overview)
        const vector = await embed(text)
        saveEmbedding(movie, vector)
        total++
        console.log(`  [${total}] ${movie.Series_Title}`)
      } catch (e) {
        console.warn(`  [error] ${movie.Series_Title}: ${e.message}`)
      }
    }
  }

  console.log(`\nDone! Embedded ${total} movies.`)
  process.exit(0)
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})
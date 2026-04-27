const OMDB_BASE = 'http://www.omdbapi.com'
const API_KEY = process.env.OMDB_API_KEY

async function omdbFetch(params = {}) {
  const url = new URL(OMDB_BASE)
  url.searchParams.append('apikey', API_KEY)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.append(k, v)
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`OMDb error: ${res.status}`)
  const data = await res.json()
  if (data.Response === 'False') throw new Error(`OMDb: ${data.Error}`)
  return data
}

// Search movies by title — returns list
async function searchMovies(query, page = 1) {
  const data = await omdbFetch({ s: query, type: 'movie', page })
  if (!data.Search) return []
  // OMDb search returns basic info, fetch full details for each
  const full = await Promise.all(
    data.Search.slice(0, 10).map(m => getMovieById(m.imdbID).catch(() => null))
  )
  return full.filter(Boolean)
}

// Get single movie by IMDb ID (e.g. 'tt0111161')
async function getMovieById(imdbId) {
  const data = await omdbFetch({ i: imdbId, plot: 'full' })
  return normalizeMovie(data)
}

// Get movie by title (for seeding from your existing DB)
async function getMovieByTitle(title, year) {
  const params = { t: title, plot: 'full', type: 'movie' }
  if (year && year !== 'N/A') params.y = year
  const data = await omdbFetch(params)
  return normalizeMovie(data)
}

// Search by title and return top result
async function searchTopResult(query) {
  const data = await omdbFetch({ s: query, type: 'movie' })
  if (!data.Search || !data.Search.length) return null
  return getMovieById(data.Search[0].imdbID)
}

// Get paginated list — OMDb doesn't have a "top movies" endpoint
// so we use a curated list of popular IMDb IDs
async function getTopMovies(page = 1) {
  const TOP_IMDB_IDS = [
    'tt0111161','tt0068646','tt0071562','tt0468569','tt0050083',
    'tt0108052','tt0167260','tt0110912','tt0060196','tt0137523',
    'tt0120737','tt0109830','tt0167261','tt0080684','tt1375666',
    'tt0133093','tt0099685','tt0073486','tt0047478','tt0114369',
    'tt0317248','tt0102926','tt0076759','tt0120689','tt0816692',
    'tt0114814','tt0245429','tt6751668','tt0118799','tt0120586',
    'tt0407887','tt0103064','tt2582802','tt0054215','tt0172495',
    'tt0110413','tt0482571','tt0120815','tt0034583','tt0056058',
    'tt0027977','tt1853728','tt0253474','tt0021749','tt0364569',
    'tt0062622','tt0038650','tt2106476','tt0361748','tt0435761',
    'tt0052357','tt0082971','tt1675434','tt0057012','tt0088763',
    'tt0986264','tt0095327','tt4154796','tt0078788','tt0078748',
    'tt0081505','tt0910970','tt0405094','tt0209144','tt1745960',
    'tt0180093','tt0169547','tt0264464','tt0457430','tt0087843',
    'tt0055630','tt0093058','tt4154756','tt0119698','tt0114709',
    'tt0022100','tt2267998','tt0053125','tt0071853','tt0032553',
    'tt1130884','tt0045152','tt0372784','tt0112573','tt0338013',
    'tt0198781','tt0112641','tt0089881','tt0066921','tt1187043',
    'tt0042876','tt0105236','tt0040522','tt0041959','tt0056172',
  ]
  const perPage = 20
  const start = (page - 1) * perPage
  const ids = TOP_IMDB_IDS.slice(start, start + perPage)
  if (!ids.length) return []

  const movies = await Promise.all(
    ids.map(id => getMovieById(id).catch(() => null))
  )
  return movies.filter(Boolean)
}

// Get rich text for embedding: plot + genres + director
async function getMovieTextForEmbedding(imdbId, overview) {
  // OMDb already returns full plot in getMovieById, so we just use what we have
  return overview || ''
}

// Normalize OMDb response to our app format
function normalizeMovie(m) {
  return {
    id: m.imdbID,           // use IMDb ID as unique identifier
    Series_Title: m.Title,
    Released_Year: m.Year ? m.Year.slice(0, 4) : 'N/A',
    IMDB_Rating: m.imdbRating || 'N/A',
    Overview: m.Plot || '',
    Genre: m.Genre || '',
    Poster_Link: m.Poster && m.Poster !== 'N/A' ? m.Poster : null,
    No_of_Votes: m.imdbVotes || '0',
    Director: m.Director || '',
    Actors: m.Actors || '',
    Runtime: m.Runtime || '',
    Certificate: m.Rated || '',
    genres: m.Genre ? m.Genre.split(',').map(g => g.trim()) : [],
  }
}

module.exports = {
  getTopMovies,
  getMovieById,
  getMovieByTitle,
  searchMovies,
  searchTopResult,
  getMovieTextForEmbedding,
  normalizeMovie
}
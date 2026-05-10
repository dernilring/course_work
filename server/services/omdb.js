const OMDB_BASE = "http://www.omdbapi.com";
const API_KEY = process.env.OMDB_API_KEY;

async function omdbFetch(params = {}) {
  const url = new URL(OMDB_BASE);
  url.searchParams.append("apikey", API_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.append(k, v);
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`OMDb error: ${res.status}`);
  const data = await res.json();
  if (data.Response === "False") throw new Error(`OMDb: ${data.Error}`);
  return data;
}

async function searchMovies(query, page = 1) {
  const data = await omdbFetch({ s: query, type: "movie", page });
  if (!data.Search) return [];

  const full = await Promise.all(
    data.Search.slice(0, 10).map((m) =>
      getMovieById(m.imdbID).catch(() => null),
    ),
  );
  return full.filter(Boolean);
}

async function getMovieById(imdbId) {
  const data = await omdbFetch({ i: imdbId, plot: "full" });
  return normalizeMovie(data);
}

async function getMovieByTitle(title, year) {
  const params = { t: title, plot: "full", type: "movie" };
  if (year && year !== "N/A") params.y = year;
  const data = await omdbFetch(params);
  return normalizeMovie(data);
}

async function searchTopResult(query) {
  const data = await omdbFetch({ s: query, type: "movie" });
  if (!data.Search || !data.Search.length) return null;
  return getMovieById(data.Search[0].imdbID);
}

async function getTopMovies(page = 1, reverseChunk = false) {
  const TOP_IMDB_IDS = [... new Set(["tt0137523",
"tt0021749",
"tt0110357",
"tt0076759",
"tt0264464",
"tt0088763",
"tt0167261",
"tt0120586",
"tt0172495",
"tt0108052",
"tt0468569",
"tt0119217",
"tt0482571",
"tt0338013",
"tt1375670",
"tt0120338",
"tt0119488",
"tt0038650",
"tt0413300",
"tt0159369",
"tt0071562",
"tt0099685",
"tt0120382",
"tt0045152",
"tt1853728",
"tt0234215",
"tt0120737",
"tt0083658",
"tt0102926",
"tt0080684",
"tt0112471",
"tt0209144",
"tt0052357",
"tt0111161",
"tt0109830",
"tt0032553",
"tt1745960",
"tt0361748",
"tt0097576",
"tt0120689",
"tt0103064",
"tt0110912",
"tt0057565",
"tt0082971",
"tt0942385",
"tt0266543",
"tt0047296",
"tt1375666",
"tt0068646",
"tt4154756",
"tt0119698",
"tt0133093",
"tt0477348",
"tt2582802",
"tt0180093",
"tt0361862",
"tt0848228",
"tt0107048",
"tt0120915",
"tt1856101",
"tt0057012",
"tt0405094",
"tt0073486",
"tt0087544",
"tt0382932",
"tt0034583",
"tt0993846",
"tt0137523",
"tt0478970",
"tt0120363",
"tt0119488",
"tt1375664",
"tt0167260",
"tt0120755",
"tt2294629",
"tt1276104",
"tt0947798",
"tt2096673",
"tt0245429",
"tt0407887",
"tt1049413",
"tt0325980",
"tt0816692",
"tt0325980",
"tt0208092",
"tt0120338",
"tt0110413",
"tt0050825",
"tt0114369",
"tt2015381",
"tt1305806",
"tt0066921",
"tt0266543",
"tt0105236",
"tt0078748",
"tt0120737",
"tt0081505",
"tt1285016",
"tt2395427",
"tt0078788",
"tt0234215",
"tt0090605",
"tt1853728",
"tt0120586",
"tt0053291",
"tt0120382",
"tt0167261",
"tt1375670",
"tt0110357",
"tt3783958",
"tt0119116",
"tt0093773",
"tt0034583",
"tt1411697",
"tt0119698",
"tt0395169",
"tt0242653",
"tt0097576",
"tt1895587",
"tt1276104",
"tt0993846",
"tt0057012",
"tt0088763",
"tt1856101",
"tt0062622",
"tt0073486",
"tt0110912",
"tt0102926",
"tt0482571",
"tt0361748",
"tt0338013"
])

  ];
  const perPage = 20;
  const start = (page - 1) * perPage;
  const ids = TOP_IMDB_IDS.slice(start, start + perPage);

  console.log(
    "getTopMovies: page=",
    page,
    "ids count=",
    ids.length,
    "ids=",
    ids.slice(0, 3),
  );

  if (!ids.length) return [];

  const movies = await Promise.all(
    ids.map((id) => getMovieById(id).catch(() => null)),
  );

  const filtered = movies.filter(Boolean);

  return reverseChunk ? filtered.reverse() : filtered;
}

async function getMovieTextForEmbedding(imdbId, overview) {
 const movie = await getMovieById(imdbId)
  return `${movie.Series_Title}. Genre: ${movie.Genre}. ${overview || ''}`.trim()
}

function normalizeMovie(m) {
  return {
    id: m.imdbID,
    Series_Title: m.Title,
    Released_Year: m.Year ? m.Year.slice(0, 4) : "N/A",
    IMDB_Rating: m.imdbRating || "N/A",
    Overview: m.Plot || "",
    Genre: m.Genre || "",
    Poster_Link: m.Poster && m.Poster !== "N/A" ? m.Poster : null,
    No_of_Votes: m.imdbVotes || "0",
    Director: m.Director || "",
    Actors: m.Actors || "",
    Runtime: m.Runtime || "",
    Certificate: m.Rated || "",
    genres: m.Genre ? m.Genre.split(",").map((g) => g.trim()) : [],
  };
}

module.exports = {
  getTopMovies,
  getMovieById,
  getMovieByTitle,
  searchMovies,
  searchTopResult,
  getMovieTextForEmbedding,
  normalizeMovie,
};

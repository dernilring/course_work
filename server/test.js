fetch('https://api.themoviedb.org/3/movie/top_rated?api_key=c51697b2f8c203932e31667881d05d73')
  .then(r => r.json())
  .then(d => console.log('OK:', d.results[0].title))
  .catch(e => console.error('ОШИБКА:', e.cause))
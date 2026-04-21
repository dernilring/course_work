import React, { useState, useEffect , useRef} from "react";
import Film from "./film";
import "./App.css";
import { fetchRecommendations } from "./api/recommendations";

export default function App() {
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [films, setFilms] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  const fetchFilms = async (pageNum) => {
    const res = await fetch(`/films?page=${pageNum}&limit=20`);
    const data = await res.json();
    if (data.length < 20) setHasMore(false);
    setFilms((prev) => [...prev, ...data]);
  };
  useEffect(() => {
    fetchFilms(1);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prev) => prev + 1);
      }
    });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore]);

  useEffect(
    (page) => {
      if (page > 1) fetchFilms(page);
    },
    [page],
  );
  const handleFilmClick = async (film) => {
    console.log("клик на фильм:", film.Series_Title, "id:", film.id);
    setSelectedFilm(film);
    setRecommendations([]);
    const recs = await fetchRecommendations(film.id);
    console.log(
      "новые рекомендации:",
      recs.map((r) => r.Series_Title),
    );
    setRecommendations(recs);
  };
  return (
    <div className="page">
      <h1 className="page_title">IMDB Top 1000</h1>
      <div className="films-grid">
        {selectedFilm && (
          <div className="recommended">
            <h2>Похожие на {selectedFilm.Series_Title}</h2>
            {recommendations.map((film) => (
              <Film
                key={`rec-${film.id}`}
                film={film}
                onClick={handleFilmClick}
              />
            ))}
          </div>
        )}

        {films.map((film) => (
          <Film key={`main-${film.id}`} film={film} onClick={handleFilmClick} />
        ))}
        {hasMore && <div ref={loaderRef} style={{ height: '20px' }} />}
      </div>
    </div>
  );
}

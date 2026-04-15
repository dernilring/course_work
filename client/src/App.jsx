import React, { useState, useEffect } from "react";
import Film from "./film";
import "./App.css";
import { fetchRecommendations } from "./api/recommendations";

export default function App() {
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [films, setFilms] = useState([]);

  useEffect(() => {
    fetch("/films")
      .then((res) => res.json())
      .then((data) => setFilms(data));
  }, []);

  // const handleFilmClick = async (selectedFilm) => {
  //   setSelectedFilm(selectedFilm);
  //   setRecommendations([]);
  //   const recs = await fetchRecommendations(selectedFilm.id);
  //   console.log("рекомендации:", recs); // ← что приходит
  //   console.log("id фильма:", selectedFilm.id);
  //   setRecommendations(recs);
  // };

const handleFilmClick = async (film) => {
  console.log("клик на фильм:", film.Series_Title, "id:", film.id);
  setSelectedFilm(film);
  setRecommendations([]);
  const recs = await fetchRecommendations(film.id);
  console.log("новые рекомендации:", recs.map(r => r.Series_Title));
  setRecommendations(recs);
};
  return (
    <div className="page">
      <h1 className="page__title">IMDB Top 1000</h1>
      <div className="films-grid">
        {/* {films.map((film) => (
          <Film key={film.id} film={film} onClick={handleFilmClick} />
        ))}

        {selectedFilm && (
          <div>
            <h2>Похожие на {selectedFilm.Series_Title}</h2>
            {recommendations.map((film) => (
              <Film key={film.id} film={film} onClick={handleFilmClick} />
            ))}
          </div>
        )} */}
        {selectedFilm && (
  <div>
    <h2>Похожие на {selectedFilm.Series_Title}</h2>
    {recommendations.map(film => (
      <Film key={`rec-${film.id}`} film={film} onClick={handleFilmClick} />
    ))}
  </div>
)}

{films.map(film => (
  <Film key={`main-${film.id}`} film={film} onClick={handleFilmClick} />
))}
      </div>
    </div>
  );
}

import React from "react";
import "./SelectedFilm.css";

export default function SelectedFilm({ film }) {
  return (
    <div className="sel-card">
      <div className="sel-card__poster-wrap">
        <img
          className="sel-card__poster"
          src={film.Poster_Link}
          alt={film.Series_Title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/200x300?text=No+Image";
          }}
        />
        <div className="sel-card__rating-badge">{film.IMDB_Rating}</div>
      </div>
      <div className="sel-card__info">
        <h3 className="sel-card__title">{film.Series_Title}</h3>
        <p className="sel-card__genre">{film.Genre}</p>
        <p className="sel-card__meta">{film.Released_Year} · {film.Runtime}</p>
      </div>
    </div>
  );
}
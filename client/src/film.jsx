import React, { useState, useEffect } from "react";
import "./film.css";

export default function Film({ film, onClick }) {
  return (
    <div className="film-card" onClick={() => onClick(film)}>
      <img
        className="film-card__poster"
        src={film.Poster_Link}
        alt={film.Series_Title}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://placehold.co/67x98?text=No+Image";
        }}
      />
      <div className="film-card__info">
        <h2 className="film-card__title">{film.Series_Title}</h2>
        <p className="film-card__genre">{film.Genre}</p>
        <p className="film-card__rating">{film.IMDB_Rating}</p>
        <p className="film-card__meta">
          {film.Released_Year} · {film.Runtime}
        </p>
        <p className="film-card__meta">Meta: {film.Meta_score}</p>
      </div>
    </div>
  );
}

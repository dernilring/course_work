import React, { useState, useEffect } from "react";

export default function Film({film}) {

  const [selectedFilm, setSelectedFilm] = useState({});

   const handleSetSelectedFilm = (film) => {
    setSelectedFilm(film);
  };

  return (
    <div>
       <div key={Date.now()} onClick={handleSetSelectedFilm} />;
        <img src={film.Poster_Link} alt={film.Poster_Link} />;
        <p> {film.Series_Title}</p>;
        <p> {film.Genre}</p>;
        <p> {film.IMDB_Rating}</p>;
        <p> {film.Meta_score} </p>;
        <p> {film.Released_Year}</p>;
        <p> {film.Runtime}</p>;
    </div>
  )
}

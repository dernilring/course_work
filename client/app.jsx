import React, { useState, useEffect } from "react";
import Film from "./film";

// создай useState для films (массив) и selectedFilm (объект)
// в useEffect сделай fetch на http://localhost:5000/api/films
// сохрани результат через setFilms()
// отрисуй карточки через .map() — постер, название, жанр, рейтинг
// при клике на карточку — setSelectedFilm(film)

export default function App() {
  const [films, setFilms] = useState([]);
  

  useEffect(() => {
    fetch("http://localhost:5000/films")
      .then((res) => res.json())
      .then((data) => setFilms(data))
  },[]);

 
  return (
    <div>
      {films.map((film) => {
       return <Film/>
      })}
    </div>
  );
}

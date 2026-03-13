import React, { useState, useEffect } from "react";
import Film from "./film";
import "./App.css"


export default function App() {
  const [films, setFilms] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/films")
      .then((res) => res.json())
      .then((data) => setFilms(data));
  }, []);

  return (
    <div className="page">
      <h1 className="page__title">IMDB Top 1000</h1>
      <div className="films-grid">
      {films.map((film, index) => (
        <Film key={index} film={film} />
      ))}
      </div>
    </div>
  );
}

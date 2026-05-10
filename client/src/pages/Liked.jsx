import React, { useState, useEffect } from "react";
import { getActions, saveActions } from "../utils/storage";
import SelectedFilm from "./SelectedFilm";
import { useNavigate } from "react-router-dom";
import "./Pages.css";

export default function Liked() {
  const [likedFilms, setLikedFilms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/films/actions/all")
      .then(res => res.json())
      .then(allActions => {
        const likedIds = allActions
          .filter(a => a.action === "like")
          .map(a => a.tmdb_id);

        return Promise.all(
          likedIds.map(id =>
            fetch(`http://localhost:5000/films/${id}`)
              .then(r => r.json())
              .catch(() => null)
          )
        );
      })
      .then(films => setLikedFilms(films.filter(Boolean)))
      .catch(console.warn);
  }, []);

  const clearAll = () => {
    likedFilms.forEach((film) => {
      fetch(`http://localhost:5000/films/${film.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like", active: false }),
      }).catch(console.warn);
    });
    setLikedFilms([]);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-left-group">
          <button className="page-back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h2 className="page-title">Liked ({likedFilms.length})</h2>
        </div>
        {likedFilms.length > 0 && (
          <button onClick={clearAll} className="page-clear-button">
            Clear all
          </button>
        )}
      </div>

      {likedFilms.length === 0 && (
        <p className="page-empty-message">No liked films</p>
      )}

      <div className="page-films-grid">
        {likedFilms.map((film) => (
          <SelectedFilm key={film.id} film={film} />
        ))}
      </div>
    </div>
  );
}
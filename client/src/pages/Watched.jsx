import React, { useState, useEffect } from "react";
import { getActions, saveActions } from "../utils/storage";
import SelectedFilm from "./SelectedFilm";
import { useNavigate } from "react-router-dom";
import "./Pages.css";

export default function Watched() {
  const [watchedFilms, setWatchedFilms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/films/actions/all")
      .then(res => res.json())
      .then(allActions => {
        const watchedIds = allActions
          .filter(a => a.action === "watched")
          .map(a => a.tmdb_id);

        return Promise.all(
          watchedIds.map(id =>
            fetch(`http://localhost:5000/films/${id}`)
              .then(r => r.json())
              .catch(() => null)
          )
        );
      })
      .then(films => setWatchedFilms(films.filter(Boolean)))
      .catch(console.warn);
  }, []);

  const clearAll = () => {
    watchedFilms.forEach((film) => {
      fetch(`http://localhost:5000/films/${film.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "watched", active: false }),
      }).catch(console.warn);
    });
    setWatchedFilms([]);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-left-group">
          <button className="page-back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h2 className="page-title">Watched ({watchedFilms.length})</h2>
        </div>
        {watchedFilms.length > 0 && (
          <button onClick={clearAll} className="page-clear-button">
            Clear all
          </button>
        )}
      </div>

      {watchedFilms.length === 0 && (
        <p className="page-empty-message">No watched films</p>
      )}

      <div className="page-films-grid">
        {watchedFilms.map((film) => (
          <SelectedFilm key={film.id} film={film} />
        ))}
      </div>
    </div>
  );
}
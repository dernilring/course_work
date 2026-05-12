import React, { useState, useEffect } from "react";
import { getActions, saveActions } from "../utils/storage";
import SelectedFilm from "./SelectedFilm";
import { useNavigate } from "react-router-dom";
import "./Pages.css";
import API_URL from '../api/config'

export default function Disliked() {
  const [dislikedFilms, setDislikedFilms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/films/actions/all`)
      .then(res => res.json())
      .then(allActions => {
        const dislikedIds = allActions
          .filter(a => a.action === "dislike")
          .map(a => a.tmdb_id);

        return Promise.all(
          dislikedIds.map(id =>
            fetch(`${API_URL}/films/${id}`)
              .then(r => r.json())
              .catch(() => null)
          )
        );
      })
      .then(films => setDislikedFilms(films.filter(Boolean)))
      .catch(console.warn);
  }, []);

  const clearAll = () => {
    dislikedFilms.forEach((film) => {
      fetch(`${API_URL}/films/${film.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dislike", active: false }),
      }).catch(console.warn);
    });
    setDislikedFilms([]);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-left-group">
          <button className="page-back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <button className="page-back-button" onClick={() => navigate("/")}>
            ← Home
          </button>
          <h2 className="page-title">Disliked ({dislikedFilms.length})</h2>
        </div>
        {dislikedFilms.length > 0 && (
          <button onClick={clearAll} className="page-clear-button">
            Clear all
          </button>
        )}
      </div>

      {dislikedFilms.length === 0 && (
        <p className="page-empty-message">No disliked films</p>
      )}

      <div className="page-films-grid">
        {dislikedFilms.map((film) => (
          <SelectedFilm key={film.id} film={film} />
        ))}
      </div>
    </div>
  );
}
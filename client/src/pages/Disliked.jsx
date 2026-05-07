import React, { useState } from "react";
import { useFilms } from "../context/FilmContext";
import { getActions, saveActions } from "../utils/storage";
import SelectedFilm from "./SelectedFilm";
import { useNavigate } from "react-router-dom";
import "./Pages.css"; 

export default function Disliked() {
  const { films } = useFilms();
  const [actions, setLocalActions] = useState(getActions());
  const navigate = useNavigate();

  const dislikedFilms = films.filter((film) => actions[film.id]?.disliked);

  const clearAll = () => {
    const allActions = getActions();
    Object.keys(allActions).forEach((id) => {
      if (allActions[id].disliked) allActions[id].disliked = false;
    });
    saveActions(allActions);
    setLocalActions({ ...allActions });

    dislikedFilms.forEach((film) => {
      fetch(`http://localhost:5000/films/${film.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dislike", active: false }),
      }).catch(console.warn);
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-left-group">
          <button className="page-back-button" onClick={() => navigate('/')}>
            ← Back
          </button>
          <h2 className="page-title">
            Disliked ({dislikedFilms.length})
          </h2>
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
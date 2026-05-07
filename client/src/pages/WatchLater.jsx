import React, { useState } from "react";
import { useFilms } from "../context/FilmContext";
import { getActions, saveActions } from "../utils/storage";
import SelectedFilm from "./SelectedFilm";
import { useNavigate } from "react-router-dom";
import "./Pages.css";

export default function WatchLater() {
  const { films } = useFilms();
  const [actions, setLocalActions] = useState(getActions());
  const navigate = useNavigate();
  const watchlistFilms = films.filter((film) => actions[film.id]?.watchlist);

  const clearAll = () => {
    const allActions = getActions();
    Object.keys(allActions).forEach((id) => {
      if (allActions[id].watchlist) allActions[id].watchlist = false;
    });
    saveActions(allActions);
    setLocalActions({ ...allActions });

    watchlistFilms.forEach((film) => {
      fetch(`http://localhost:5000/films/${film.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "watchlist", active: false }),
      }).catch(console.warn);
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-left-group">
          <button className="page-back-button" onClick={() => navigate("/")}>
            ← Back
          </button>
          <h2 className="page-title">Watch later : ({watchlistFilms.length})</h2>
        </div>
        {watchlistFilms.length > 0 && (
          <button onClick={clearAll} className="page-clear-button">
            Clear all
          </button>
        )}
      </div>

      {watchlistFilms.length === 0 && (
        <p className="page-empty-message">no watch later films</p>
      )}

      <div className="page-films-grid">
        {watchlistFilms.map((film) => (
          <SelectedFilm key={film.id} film={film} />
        ))}
      </div>
    </div>
  );
}
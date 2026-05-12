import React, { useState, useEffect } from "react";
import { getActions, saveActions } from "../utils/storage";
import SelectedFilm from "./SelectedFilm";
import { useNavigate } from "react-router-dom";
import "./Pages.css";
import API_URL from '../api/config'

export default function WatchList() {
  const [watchListFilms, setWatchListFilms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/films/actions/all`)
      .then(res => res.json())
      .then(allActions => {
        const watchListIds = allActions
          .filter(a => a.action === "watchlist")
          .map(a => a.tmdb_id);

        return Promise.all(
          watchListIds.map(id =>
            fetch(`${API_URL}/films/${id}`)
              .then(r => r.json())
              .catch(() => null)
          )
        );
      })
      .then(films => setWatchListFilms(films.filter(Boolean)))
      .catch(console.warn);
  }, []);

  const clearAll = () => {
    watchListFilms.forEach((film) => {
      fetch(`${API_URL}/films/${film.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "watchlist", active: false }),
      }).catch(console.warn);
    });
    setwatchListFilms([]);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-left-group">
          <button className="page-back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h2 className="page-title">WatchList ({watchListFilms.length})</h2>
        </div>
        {watchListFilms.length > 0 && (
          <button onClick={clearAll} className="page-clear-button">
            Clear all
          </button>
        )}
      </div>

      {watchListFilms.length === 0 && (
        <p className="page-empty-message">No watchList films</p>
      )}

      <div className="page-films-grid">
        {watchListFilms.map((film) => (
          <SelectedFilm key={film.id} film={film} />
        ))}
      </div>
    </div>
  );
}
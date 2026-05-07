import React, { useState, useEffect } from "react";
import "./film.css";
import {
  getActions,
  saveActions,
  getHistory,
  saveHistory,
} from "./utils/storage.js";
import { useNavigate } from "react-router-dom";

export default function Film({ film, onClick, onHistoryChange, reason }) {
  const [actions, setActions] = useState(getActions());
  const currentAction = actions[film.id] || {};
  const navigate = useNavigate()

  const updateAction = async (action) => {
    const allActions = getActions();
    const prev = allActions[film.id] || {};
    const updated = {
      ...prev,
      [action]: !prev[action],
    };
    if (action === "liked") updated.disliked = false;
    if (action === "disliked") updated.liked = false;
    if (action === "watched") updated.planned = false;
    if (action === "planned") updated.watched = false;

    allActions[film.id] = updated;
    saveActions({ ...allActions });
    setActions({ ...allActions });

    const actionMap = {
      liked: "like",
      disliked: "dislike",
      watched: "watched",
      planned: "watchlist",
    };

    try {
      await fetch(`http://localhost:5000/films/${film.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionMap[action],
          active: updated[action],
        }),
      });
    } catch (e) {
      console.warn("Не удалось сохранить действие на сервере:", e);
    }
  };

  const updateHistory = () => {
    let history = getHistory();
    history = history.filter((id) => id !== film.id);
    history.unshift(film.id);
    history = history.slice(0, 10);
    saveHistory(history);
    console.log("сохранено:", JSON.parse(localStorage.getItem("history")));
  };

  const handleClick = () => {
    console.log("handleClick вызван, film.id:", film.id);
    updateHistory();
    console.log("после updateHistory:", localStorage.getItem("history"));
    onClick(film);
  };

  return (
    <div className="film-card">
      {reason && (
        <div className="film-card__why" data-tooltip={reason}>
          ?
        </div>
      )}
      <img
        className="film-card__poster"
        src={film.Poster_Link}
        alt={film.Series_Title}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://placehold.co/67x98?text=No+Image";
        }}
        onClick={handleClick}
      />
      <div className="film-card__info" onClick={handleClick}>
        <h2 className="film-card__title">{film.Series_Title}</h2>
        <p className="film-card__genre">{film.Genre}</p>
        <p className="film-card__rating">{film.IMDB_Rating}</p>
        <p className="film-card__meta">
          {film.Released_Year} · {film.Runtime}
        </p>
      </div>
      <div className="film-buttons">
        <button
          className={currentAction.planned ? "active" : ""}
          onClick={(e) => {
            e.stopPropagation();
            updateAction("watchlist");
          }}
        >
          Watch later
        </button>
        <button
        className={currentAction.watched ? "active" : ""}
          onClick={(e) => {
            e.stopPropagation();
            updateAction("watched");
          }}
        >
          Watched
        </button>
        <button
        className={currentAction.liked ? "active" : ""}
          onClick={(e) => {
            e.stopPropagation();
            updateAction("liked");
          }}
        >
          Like
        </button>
        <button
        className={currentAction.disliked ? "active" : ""}
          onClick={(e) => {
            e.stopPropagation();
            updateAction("disliked");
          }}
        >
          Dislike
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
           navigate(`/film/${film.id}`)
          }}
        >
          ▶ Trailer
        </button>
      </div>
    </div>
  );
}

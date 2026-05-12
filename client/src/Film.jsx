import React, { useState, useEffect } from "react";
import "./Film.css";
import {
  getActions,
  saveActions,
  getHistory,
  saveHistory,
} from "./utils/storage.js";
import { useNavigate } from "react-router-dom";
import API_URL from '../src/api/config.js'

export default function Film({
  film,
  onClick,
  onHistoryChange,
  actions,
  onAction,
  reason,
}) {
  const currentAction = actions[film.id] || {};
  const navigate = useNavigate();

  const updateAction = async (action) => {
    const allActions = getActions();
    const prev = allActions[film.id] || {};
    const isActive = !prev[action];
    onAction(film.id, action);
    const actionMap = {
      liked: "like",
      disliked: "dislike",
      watched: "watched",
      planned: "watchlist",
    };
    try {
      await fetch(`${API_URL}/films/${film.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionMap[action],
          active: isActive,
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
  const convertRating = (film) => {
    const map = {
      G: "0+",
      PG: "6+",
      "PG-13": "13+",
      R: "17+",
      "NC-17": "18+",
      "TV-Y": "0+",
      "TV-Y7": "7+",
      "TV-G": "0+",
      "TV-PG": "6+",
      "TV-14": "14+",
      "TV-MA": "18+",
      "Not Rated": null,
      Unrated: null,
      Approved: null,
      Passed: null,
    };
    return map[film] || null;
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
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {film.Certificate && film.Certificate !== "N/A" && (
            <span className="film-card__certificate">
              {convertRating(film.Certificate)}
            </span>
          )}
        </div>
        <p className="film-card__meta">
          {film.Released_Year} · {film.Runtime}
        </p>
      </div>
      <div className="film-buttons">
        <button
          className={currentAction.planned ? "active" : ""}
          onClick={(e) => {
            e.stopPropagation();
            updateAction("planned");
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
            navigate(`/film/${film.id}`);
          }}
        >
          ▶ Trailer
        </button>
      </div>
    </div>
  );
}

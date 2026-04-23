import React, { useState, useEffect } from "react";
import "./film.css";
import {
  getActions,
  getHistory,
  saveActions,
  saveHistory,
} from "./utils/storage";

export default function Film({ film, onClick, onHistoryChange }) {
  const [actions, setActions] = useState(getActions());
  const currentAction = actions[film.id] || {};

  const updateAction = (action) => {
    const allActions = getActions();
    const prev = allActions[film.id] || {};

    const updated = {
      ...prev,
      [action]: !prev[action],
    };
    if (action === "liked") {
      updated.disliked = false;
    }
    if (action === "disliked") {
      updated.liked = false;
    }
    if (action === "watched") {
      updated.planned = false;
    }
    if (action === "planned") {
      updated.watched = false;
    }

    allActions[film.id] = updated;
    saveActions({ ...allActions });
    setActions({...allActions})
  };

  const updateHistory = () => {
  let history = getHistory();
 history = history.filter((id) => Number(id) !== Number(film.id));
history.unshift(Number(film.id));
  history = history.slice(0, 10);
  saveHistory(history);
  console.log("сохранено:", JSON.parse(localStorage.getItem("history"))); // проверка
};
 
 const handleClick = () => {
  console.log("handleClick вызван, film.id:", film.id);
  updateHistory();
  console.log("после updateHistory:", localStorage.getItem("history"));
  onClick(film);
};


  return (
    <div className="film-card">
      <img
        className="film-card__poster"
        src={film.Poster_Link}
        alt={film.Series_Title}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://placehold.co/67x98?text=No+Image";
        }}
        onClick={ handleClick} />
      <div className="film-card__info"  onClick={ handleClick}>
        <h2 className="film-card__title">{film.Series_Title}</h2>
        <p className="film-card__genre">{film.Genre}</p>
        <p className="film-card__rating">{film.IMDB_Rating}</p>
        <p className="film-card__meta">
          {film.Released_Year} · {film.Runtime}
        </p>
        <p className="film-card__meta">Meta: {film.Meta_score}</p>
      </div>
     <div className="film-buttons">
  <button onClick={(e) => { e.stopPropagation(); updateAction("planned"); }}>Планирую</button>
  <button onClick={(e) => { e.stopPropagation(); updateAction("watched"); }}>Смотрел</button>
  <button onClick={(e) => { e.stopPropagation(); updateAction("liked"); }}>Лайк</button>
  <button onClick={(e) => { e.stopPropagation(); updateAction("disliked"); }}>Дизлайк</button>
</div>
    </div>
  );
}

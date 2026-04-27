
import React, { useState, useEffect, useRef } from "react";
import { useFilms } from "../context/FilmContext";
import { getActions } from "../utils/storage";
import Film from "../Film";

export default function WatchLater() {  
  const { films } = useFilms();
  const actions = getActions();

  const watchedLaterFilms = films.filter((film) => actions[film.id]?.planned);

  return (  
    <div>
      {watchedLaterFilms.map((film) => (
        <Film key={film.id} film={film} />
      ))}
    </div>
  );
}
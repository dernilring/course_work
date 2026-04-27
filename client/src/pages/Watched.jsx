import React, { useState, useEffect, useRef } from "react";
import { useFilms } from "../context/FilmContext";
import { getActions } from "../utils/storage";
import Film from "../Film";

export default function Watched() {
 const { films } = useFilms();
  const actions = getActions();

  const watchedFilms = films.filter((film) => actions[film.id]?.watched);

    
  return (
  <div>
     {watchedFilms.map((film) => (
            <Film key={film.id} film={film} />
      ))}
  </div>
  );
}

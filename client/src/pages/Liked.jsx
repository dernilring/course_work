import React, { useState, useEffect, useRef } from "react";
import { useFilms } from "../context/FilmContext";
import { getActions } from "../utils/storage";
import Film from "../Film";


export default function Liked() {
  const { films } = useFilms();
  const actions = getActions();

  const likedFilms = films.filter((film) => actions[film.id]?.liked);

  return (
    <div>
      {likedFilms.map((film) => (
        <Film key={film.id} film={film} />
      ))}
    </div>
  );
}

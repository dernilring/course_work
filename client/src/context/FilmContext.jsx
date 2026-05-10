import React, { createContext, useState, useContext } from "react";

const FilmContext = createContext();

export function FilmProvider({ children }) {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [films, setFilms] = useState([]);

  const [selectedFilm, setSelectedFilm] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [filmHistory, setFilmHistory] = useState([]);

  const addFilms = (newFilmsParams) => {
    if (!Array.isArray(newFilmsParams)) return;
    setFilms((prev) => {
      const existingIds = new Set(prev.map((film) => film.id));
      const uniqueNewFilms = newFilmsParams.filter(
        (film) => !existingIds.has(film.id),
      );
      return [...prev, ...uniqueNewFilms];
    });
  };
  const resetFilms = () => {
    setFilms([]);
    setPage(1);
    setHasMore(true);
  };
  return (
    <FilmContext.Provider
      value={{
        films,
        addFilms,
        resetFilms,
        page,
        setPage,
        hasMore,
        setHasMore,
        selectedFilm,
        setSelectedFilm,
        recommendations,
        setRecommendations,
        filmHistory,
        setFilmHistory,
      }}
    >
      {children}
    </FilmContext.Provider>
  );
}

export const useFilms = () => useContext(FilmContext);

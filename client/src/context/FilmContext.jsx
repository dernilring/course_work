import React, { createContext, useState , useContext} from "react";

const FilmContext = createContext();

export function FilmProvider({ children }) {
  
  const [films, setFilms] = useState([]);

  const addFilms = (newFilmsParams) => {
    if (!Array.isArray(newFilmsParams)) return;
    setFilms((prev) => {
      const existingIds = new Set(prev.map((film) => film.id));
      const uniqueNewFilms = newFilmsParams.filter((film) => !existingIds.has(film.id));
      return [...prev, ...uniqueNewFilms];
    });
  };
  const resetFilms = () => setFilms([]);
  return(
    <FilmContext.Provider value ={{films, addFilms, resetFilms}}>
        {children}
    </FilmContext.Provider>
  )
}

export const useFilms = () => useContext(FilmContext)

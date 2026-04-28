import React, { useState, useEffect, useRef } from "react";
import Film from "../Film.jsx";
import "./Home.css";
import { fetchRecommendations } from "../api/recommendations.js";
import { getHistory } from "../utils/storage.js";
import { useFilms } from "../context/FilmContext.jsx";
import { useMemo } from "react";
import Filters from "./Filters.jsx";

export default function Home() {
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const { films, addFilms } = useFilms();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(null);
  const [history, setHistory] = useState(getHistory());
  const topRef = useRef(null);
  
  const [filters, setFilters] = useState({
    genre: '',
    minRating: 0,
    sort: 'default',
    search: ''  
  });

  const fetchFilms = async (pageNum) => {
    setLoading(true);
    console.log("загружаем страницу:", pageNum);
    console.log("fetchFilms вызван с pageNum:", pageNum);

    const url = `/films?page=${pageNum}&limit=20`;
    console.log("URL запроса:", url);

    const res = await fetch(url);
    const data = await res.json();

    if (data.length < 20) setHasMore(false);

    addFilms(data);
    setLoading(false);
  };
  
  useEffect(() => {
    fetchFilms(1);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        console.log(
          "observer:",
          entries[0].isIntersecting,
          "loading:",
          loading,
          "hasMore:",
          hasMore,
        );
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 },
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  useEffect(() => {
    if (page > 1) fetchFilms(page);
  }, [page]);

  const handleFilmClick = async (film) => {
    console.log("клик на фильм:", film.Series_Title, "id:", film.id);
    setSelectedFilm(film);
    setRecommendations([]);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
    const recs = await fetchRecommendations(film.id);
    console.log(
      "новые рекомендации:",
      recs.map((r) => r.Series_Title),
    );
    setRecommendations(recs);
  };

  const refreshHistory = () => {
    setHistory(getHistory());
  };

  const clearHistory = () => {
    localStorage.removeItem("history");
  };

  const filteredFilms = useMemo(() => {
    let result = [...films];

    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      result = result.filter(film => 
        film.Series_Title && 
        film.Series_Title.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.genre) {
      result = result.filter(
        (f) =>
          f.Genre &&
          f.Genre.toLowerCase().includes(filters.genre.toLowerCase()),
      );
    }

    if (filters.minRating > 0) {
      result = result.filter(
        (f) => parseFloat(f.IMDB_Rating) >= parseFloat(filters.minRating),
      );
    }

    if (filters.sort === "rating_desc") {
      result.sort(
        (a, b) => parseFloat(b.IMDB_Rating) - parseFloat(a.IMDB_Rating),
      );
    } else if (filters.sort === "rating_asc") {
      result.sort(
        (a, b) => parseFloat(a.IMDB_Rating) - parseFloat(b.IMDB_Rating),
      );
    } else if (filters.sort === "year_desc") {
      result.sort(
        (a, b) => parseInt(b.Released_Year) - parseInt(a.Released_Year),
      );
    } else if (filters.sort === "year_asc") {
      result.sort(
        (a, b) => parseInt(a.Released_Year) - parseInt(b.Released_Year),
      );
    }

    return result;
  }, [films, filters]);

  return (
    <div className="page">
      <div ref={topRef} />
      <h1 className="page_title">IMDB Top 1000</h1>
      
      {/* Передаем filters и onChange */}
      <Filters filters={filters} onChange={setFilters} />
      
      <div className="films-grid">
        {selectedFilm && (
          <div className="recommended">
            <h2>Похожие на {selectedFilm.Series_Title}</h2>
            {recommendations.map((film) => (
              <Film
                key={`rec-${film.id}`}
                film={film}
                onClick={handleFilmClick}
                onHistoryChange={refreshHistory}
              />
            ))}
          </div>
        )}
        
        {filteredFilms.length === 0 && !loading && (
          <p className="no-results">Нет фильмов по выбранным фильтрам</p>
        )}
        
       
        {filteredFilms.map((film) => (
          <Film key={`main-${film.id}`} film={film} onClick={handleFilmClick} />
        ))}
      </div>
      
      {hasMore && <div ref={loaderRef} style={{ height: "20px" }} />}
      {loading && <p style={{ textAlign: 'center', color: '#888' }}>Загрузка...</p>}
    </div>
  );
}
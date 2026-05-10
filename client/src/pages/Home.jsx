import React, { useState, useEffect, useRef, useMemo } from "react";
import Film from "../Film.jsx";
import "./Home.css";
import { fetchRecommendations } from "../api/recommendations.js";
import { getActions, getHistory, saveActions } from "../utils/storage.js";
import { useFilms } from "../context/FilmContext.jsx";
import Filters from "./Filters.jsx";

export default function Home() {
  //const [selectedFilm, setSelectedFilm] = useState(null);
  //const [recommendations, setRecommendations] = useState([]);
  const { films, addFilms, resetFilms, page, setPage, hasMore, setHasMore , selectedFilm, setSelectedFilm, recommendations, setRecommendations, filmHistory, setFilmHistory
} =
    useFilms();
  // const [page, setPage] = useState(1);
  // const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(null);
  const [history, setHistory] = useState(getHistory());
  const topRef = useRef(null);
  const [actions, setActions] = useState(getActions);
  //const [filmHistory, setFilmHistory] = useState([]);

  const [filters, setFilters] = useState({
    genre: "",
    minRating: 0,
    sort: "default",
    search: "",
  });

  const sortRef = useRef(filters.sort);

  const fetchFilms = async (pageNum, sort) => {
    const currentSort = sort ?? sortRef.current;
    setLoading(true);
    const url = `/films?page=${pageNum}&limit=20&sort=${currentSort}`;
    const res = await fetch(url);
    const data = await res.json();

    const movies = Array.isArray(data) ? data : data.movies || [];
    const hasMoreFromServer = Array.isArray(data)
      ? movies.length >= 20
      : data.hasMore;

    console.log("Загружено фильмов:", movies.length);

    if (!hasMoreFromServer) setHasMore(false);
    addFilms(movies);
    setLoading(false);
  };

  useEffect(() => {
    fetchFilms(1);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
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

  const handleFiltersChange = (newFilters) => {
    const sortChanged = newFilters.sort !== filters.sort;
    setFilters(newFilters);
    sortRef.current = newFilters.sort;

    if (sortChanged) {
      resetFilms();
      setPage(1);
      setHasMore(true);
      fetchFilms(1, newFilters.sort);
    }
  };

  const handleFilmClick = async (film) => {
    if (selectedFilm) {
      setFilmHistory((prev) => [...prev, selectedFilm]);
    }
    setSelectedFilm(film);
    setRecommendations([]);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
    const recs = await fetchRecommendations(film.id);
    console.log("recs:", recs);
    setRecommendations(recs);
  };

  const handleBack = () => {
    if (filmHistory.length === 0) return;
    const prev = filmHistory[filmHistory.length - 1];
    setFilmHistory((h) => h.slice(0, -1));
    setSelectedFilm(prev);

    fetchRecommendations(prev.id).then(setRecommendations);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const refreshHistory = () => setHistory(getHistory());

  const filteredFilms = useMemo(() => {
    let result = [...films];

    if (filters.search?.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      result = result.filter((film) =>
        film.Series_Title?.toLowerCase().includes(searchTerm),
      );
    }

    if (filters.genre) {
      result = result.filter((f) =>
        f.Genre?.toLowerCase().includes(filters.genre.toLowerCase()),
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

  const handleAction = (filmId, action) => {
    const allActions = getActions();
    const prev = allActions[filmId] || {};
    const updated = {
      ...prev,
      [action]: !prev[action],
    };
    if (action === "liked") updated.disliked = false;
    if (action === "disliked") updated.liked = false;
    if (action === "watched") updated.planned = false;
    if (action === "planned") updated.watched = false;

    allActions[filmId] = updated;
    saveActions({ ...allActions });
    setActions({ ...allActions });
  };

  return (
    <div className="page">
      <div ref={topRef} />
      <h1 className="page_title">FilmMatch</h1>

      <Filters filters={filters} onChange={handleFiltersChange} />

      <div className="films-grid">
        {selectedFilm && (
          <div className="recommended">
            {filmHistory.length > 0 && (
              <button onClick={handleBack} className="prev-button">
                ← Back to {filmHistory[filmHistory.length - 1]?.Series_Title}
              </button>
            )}
            <h2>Similar to {selectedFilm.Series_Title}</h2>
            <button
              onClick={() => {
                setSelectedFilm(null);
                setRecommendations([]);
                setFilmHistory([]);
              }}
              className="reset-button"
            >
              Reset recommendations
            </button>
            <div className="recommended-grid">
              {recommendations.map((film) => (
                <Film
                  key={`rec-${film.id}`}
                  film={film}
                  onClick={handleFilmClick}
                  onHistoryChange={refreshHistory}
                  actions={actions}
                  onAction={handleAction}
                  reason={film.reason}
                />
              ))}
            </div>
          </div>
        )}

        {filteredFilms.length === 0 && !loading && (
          <p className="no-results">Film is not found</p>
        )}

        {filteredFilms.map((film) => (
          <Film
            key={`main-${film.id}`}
            film={film}
            onClick={handleFilmClick}
            actions={actions}
            onAction={handleAction}
          />
        ))}
      </div>

      {hasMore && <div ref={loaderRef} style={{ height: "20px" }} />}
      {loading && (
        <p style={{ textAlign: "center", color: "#888" }}>Loading...</p>
      )}
    </div>
  );
}

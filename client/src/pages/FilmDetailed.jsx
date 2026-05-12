import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./FilmDetailed.css";
import { useFilms } from "../context/FilmContext";
import API_URL from '../api/config'
export default function FilmDetailed() {
  const { id } = useParams();
  const { films } = useFilms();
  const [film, setFilm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoId, setVideoId] = useState(null);
  const navigate = useNavigate()

  useEffect(() => {
    const loadFilm = async () => {
      const cached = films.find((film) => film.id === id);
      if (cached) {
        setFilm(cached);
        const trailerRes = await fetch(
          `${API_URL}/films/${id}/trailer`,
        );
        const trailerData = await trailerRes.json();
        setVideoId(trailerData.videoId);
        setLoading(false);
        return;
      }
      const [filmRes, trailerRes] = await Promise.all([
        fetch(`${API_URL}/films/${id}`),
        fetch(`${API_URL}/films/${id}/trailer`),
      ]);

      const filmData = await filmRes.json();
      const trailerData = await trailerRes.json();
      setFilm(filmData);
      setVideoId(trailerData.videoId);
      setLoading(false);
    };
    loadFilm()
  }, [id, films]);
  if (loading) return <div className="filmpage__loading">Loading...</div>;
  if (!film) return <div className="filmpage__loading">Film is not found</div>;
  return (
    <div className="filmpage">
      <button className="filmpage__back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="filmpage__hero">
        <img
          className="filmpage__poster"
          src={film.Poster_Link}
          alt={film.Series_Title}
          onError={(e) => {
            e.target.src = "https://placehold.co/300x450?text=No+Image";
          }}
        />

        <div className="filmpage__info">
          <h1 className="filmpage__title">{film.Series_Title}</h1>
          <div className="filmpage__meta">
            <span className="filmpage__rating">{film.IMDB_Rating}</span>
            <span>{film.Released_Year}</span>
            <span>{film.Runtime}</span>
            <span>{film.Certificate}</span>
          </div>
          <p className="filmpage__genre">{film.Genre}</p>
          <p className="filmpage__overview">{film.Overview}</p>
          <p className="filmpage__director">
            <strong>Director:</strong> {film.Director}
          </p>
          <p className="filmpage__actors">
            <strong>Actors:</strong> {film.Actors}
          </p>
          <p className="filmpage__votes">
            <strong>Votes IMDb:</strong> {film.No_of_Votes}
          </p>
        </div>
      </div>

      <div className="filmpage__trailer">
        <h2>Trailer</h2>
        {videoId ? (
          <iframe
            width="100%"
            height="500"
            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <p className="filmpage__no-trailer">Trailer is not found</p>
        )}
      </div>
    </div>
  );
}

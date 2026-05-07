import { useState , useEffect} from "react";
import React from "react";
import "./Filters.css";
//import { search } from "../../../server/routes/films";

const GENRES = [
  "All",
  "Action",
  "Adventure",
  "Animation",
  "Biography",
  "Comedy",
  "Crime",
  "Drama",
  "Fantasy",
  "History",
  "Horror",
  "Music",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "War",
  "Western",
];

export default function Filters({ filters, onChange }) {
  const [searchInput, setSearchInput] = useState(filters.search || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onChange({ ...filters, search: searchInput });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, filters, onChange]);

   const handleSearchChange = (e) => {
    setSearchInput(e.target.value); 
  };
  const handleGenre = (genre) => {
    onChange({ ...filters, genre: genre === "All" ? "" : genre });
  };

  const handleRating = (e) => {
    onChange({ ...filters, minRating: e.target.value });
  };

  const handleSort = (e) => {
    onChange({ ...filters, sort: e.target.value });
  };

  const handleReset = () => {
    setSearchInput('')
    onChange({ genre: "", minRating: 0, sort: "default", search: "" });
    
  };
 
  const isActive =
    filters.genre ||
    filters.minRating > 0 ||
    filters.sort !== "default" ||
    searchInput;

  return (
    <div className="filters">
      <div className="filters_title">
        <input
          type="text"
          placeholder="Search for :"
          value={searchInput}
          onChange={handleSearchChange}
         className="filters_search-input"
        />
      </div>

      <div className="filters__genres">
        {GENRES.map((genre) => (
          <button
            key={genre}
            className={`filters__genre-btn ${
              (genre === "All" && !filters.genre) || filters.genre === genre
                ? "filters__genre-btn--active"
                : ""
            }`}
            onClick={() => handleGenre(genre)}
          >
            {genre}
          </button>
        ))}
      </div>

      <div className="filters__row">
        <div className="filters__rating">
          <label>
            Min Rating: <strong>{filters.minRating}</strong>
          </label>
          <input
            type="range"
            min="0"
            max="9"
            step="0.5"
            value={filters.minRating}
            onChange={handleRating}
          />
        </div>

        <select
          className="filters__sort"
          value={filters.sort}
          onChange={handleSort}
        >
          <option value="default">Sort: Default</option>
          <option value="rating_desc">Rating: High to Low</option>
          <option value="rating_asc">Rating: Low to High</option>
          <option value="year_desc">Year: Newest first</option>
          <option value="year_asc">Year: Oldest first</option>
        </select>

        {isActive && (
          <button className="filters__reset" onClick={handleReset}>
            Reset filters
          </button>
        )}
      </div>
    </div>
  );
}

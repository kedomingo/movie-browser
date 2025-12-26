"use client";

import { useState, useEffect } from "react";
import { languages } from "@/lib/languages";
import { countries } from "@/lib/countries";
import { getMovieGenres, getTVGenres, Genre } from "@/lib/genres";

interface SearchComponentProps {
  onSearch: (filters: {
    query?: string;
    kind?: "movie" | "tv";
    language?: string;
    country?: string;
    genre?: string;
    year?: string;
  }) => void;
  onReset: () => void;
  initialFilters?: {
    query?: string;
    kind?: "movie" | "tv";
    language?: string;
    country?: string;
    genre?: string;
    year?: string;
  };
}

export default function SearchComponent({
  onSearch,
  onReset,
  initialFilters = {},
}: SearchComponentProps) {
  const [searchQuery, setSearchQuery] = useState<string>(initialFilters.query || "");
  const [kind, setKind] = useState<"movie" | "tv" | "">(initialFilters.kind || "");
  const [language, setLanguage] = useState<string>(initialFilters.language || "");
  const [country, setCountry] = useState<string>(initialFilters.country || "");
  const [genre, setGenre] = useState<string>(initialFilters.genre || "");
  const [year, setYear] = useState<string>(initialFilters.year || "");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [movieGenres, setMovieGenres] = useState<Genre[]>([]);
  const [tvGenres, setTVGenres] = useState<Genre[]>([]);
  const [isLoadingGenres, setIsLoadingGenres] = useState(false);

  useEffect(() => {
    async function loadGenres() {
      setIsLoadingGenres(true);
      try {
        const [movies, tv] = await Promise.all([
          getMovieGenres(),
          getTVGenres(),
        ]);
        setMovieGenres(movies);
        setTVGenres(tv);
      } catch (error) {
        console.error("Error loading genres:", error);
      } finally {
        setIsLoadingGenres(false);
      }
    }
    loadGenres();
  }, []);

  useEffect(() => {
    setSearchQuery(initialFilters.query || "");
    setKind(initialFilters.kind || "");
    setLanguage(initialFilters.language || "");
    setCountry(initialFilters.country || "");
    setGenre(initialFilters.genre || "");
    setYear(initialFilters.year || "");
    // Show advanced if any advanced filter is set
    if (initialFilters.language || initialFilters.country || initialFilters.year) {
      setShowAdvanced(true);
    }
  }, [initialFilters]);

  const handleSearch = () => {
    onSearch({
      query: searchQuery || undefined,
      kind: kind || undefined,
      language: language || undefined,
      country: country || undefined,
      genre: genre || undefined,
      year: year || undefined,
    });
  };

  const handleReset = () => {
    setSearchQuery("");
    setKind("");
    setLanguage("");
    setCountry("");
    setGenre("");
    setYear("");
    setShowAdvanced(false);
    onReset();
  };

  const currentGenres = kind === "movie" ? movieGenres : kind === "tv" ? tvGenres : [];

  return (
    <div className="flex flex-col gap-4 rounded-lg bg-gray-800 p-4 shadow-sm">
      <div className="flex flex-col gap-3">

        <div className="flex flex-col gap-2">
          <label htmlFor="kind" className="text-sm font-medium text-gray-300">
            Kind
          </label>
          <select
            id="kind"
            value={kind}
            onChange={(e) => {
              setKind(e.target.value as "movie" | "tv" | "");
              setGenre(""); // Reset genre when kind changes
            }}
            className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="movie">Movie</option>
            <option value="tv">TV</option>
          </select>
        </div>

          <div className="flex flex-col gap-2">
              <label htmlFor="search" className="text-sm font-medium text-gray-300">
                  Search
              </label>
              <input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                      if (e.key === "Enter") {
                          handleSearch();
                      }
                  }}
                  placeholder="Search movies and TV shows..."
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
          </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="genre" className="text-sm font-medium text-gray-300">
            Genre
          </label>
          <select
            id="genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            disabled={!kind || isLoadingGenres}
            className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All Genres</option>
            {isLoadingGenres ? (
              <option>Loading genres...</option>
            ) : (
              currentGenres.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Advanced Filters Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-400 hover:text-blue-300 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
        >
          {showAdvanced ? "Hide Advanced" : "Show Advanced"}
        </button>

        {/* Advanced Filters */}
        {showAdvanced && (
          <>
            <div className="flex flex-col gap-2">
              <label htmlFor="year" className="text-sm font-medium text-gray-300">
                Year
              </label>
              <select
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="2020s">2020s</option>
                <option value="2000s">2000s</option>
                <option value="1990s">1990s</option>
                <option value="1980s">1980s</option>
                <option value="1970s">1970s</option>
                <option value="earlier">Earlier</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="language" className="text-sm font-medium text-gray-300">
                Language
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Languages</option>
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="country" className="text-sm font-medium text-gray-300">
                Country
              </label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Countries</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSearch}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
        >
          Search
        </button>
        <button
          onClick={handleReset}
          className="rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}


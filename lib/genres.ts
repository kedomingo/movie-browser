"use client";

export interface Genre {
  id: number;
  name: string;
}

let movieGenresCache: Genre[] | null = null;
let tvGenresCache: Genre[] | null = null;

export async function getMovieGenres(): Promise<Genre[]> {
  if (movieGenresCache) {
    return movieGenresCache;
  }

  const response = await fetch("/api/genres/movies");
  if (!response.ok) {
    throw new Error("Failed to fetch movie genres");
  }
  const data = await response.json();
  movieGenresCache = data.genres;
  return data.genres;
}

export async function getTVGenres(): Promise<Genre[]> {
  if (tvGenresCache) {
    return tvGenresCache;
  }

  const response = await fetch("/api/genres/tv");
  if (!response.ok) {
    throw new Error("Failed to fetch TV genres");
  }
  const data = await response.json();
  tvGenresCache = data.genres;
  return data.genres;
}


export interface Movie {
  id: number | string; // Can be number (from TMDB) or string (obfuscated)
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  media_type?: "movie" | "tv";
}

export interface TVShow {
  id: number | string; // Can be number (from TMDB) or string (obfuscated)
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  media_type?: "movie" | "tv";
}

export type MediaItem = Movie | TVShow;

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface SearchFilters {
  query?: string;
  language?: string;
  country?: string;
  page?: number;
}


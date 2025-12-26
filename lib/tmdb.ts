const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const TMDB_IMAGE_BASE_URL_ORIGINAL = "https://image.tmdb.org/t/p/original";

export const getImageUrl = (posterPath: string | null, size: string = "w500"): string => {
  if (!posterPath) {
    return "/placeholder-poster.png";
  }
  return `${TMDB_IMAGE_BASE_URL}/${size}${posterPath}`;
};

export const getBackdropUrl = (backdropPath: string | null): string => {
  if (!backdropPath) {
    return "";
  }
  return `${TMDB_IMAGE_BASE_URL_ORIGINAL}${backdropPath}`;
};

export const fetchTrendingMovies = async (page: number = 1) => {
  const response = await fetch(
    `/api/trending/movies?page=${page}`,
    {
      next: { revalidate: 3600 }, // Revalidate every hour
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch trending movies");
  }

  return response.json();
};

export const searchMovies = async (filters: {
  query?: string;
  language?: string;
  country?: string;
  genre?: string;
  year?: string;
  page?: number;
}) => {
  const params = new URLSearchParams({
    page: String(filters.page || 1),
  });

  if (filters.query) {
    params.append("query", filters.query);
  }

  if (filters.language) {
    params.append("language", filters.language);
  }

  if (filters.country) {
    params.append("country", filters.country);
  }

  if (filters.genre) {
    params.append("genre", filters.genre);
  }

  if (filters.year) {
    params.append("year", filters.year);
  }

  const response = await fetch(
    `/api/search/movies?${params.toString()}`,
    {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    }
  );

  if (!response.ok) {
    throw new Error("Failed to search movies");
  }

  return response.json();
};

export const searchTVShows = async (filters: {
  query?: string;
  language?: string;
  country?: string;
  genre?: string;
  year?: string;
  page?: number;
}) => {
  const params = new URLSearchParams({
    page: String(filters.page || 1),
  });

  if (filters.query) {
    params.append("query", filters.query);
  }

  if (filters.language) {
    params.append("language", filters.language);
  }

  if (filters.country) {
    params.append("country", filters.country);
  }

  if (filters.genre) {
    params.append("genre", filters.genre);
  }

  if (filters.year) {
    params.append("year", filters.year);
  }

  const response = await fetch(
    `/api/search/tv?${params.toString()}`,
    {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    }
  );

  if (!response.ok) {
    throw new Error("Failed to search TV shows");
  }

  return response.json();
};


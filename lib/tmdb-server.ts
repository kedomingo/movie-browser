const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;

const getHeaders = () => ({
  Authorization: `Bearer ${TMDB_API_KEY}`,
  "Content-Type": "application/json",
});

export async function getMovieDetails(id: string) {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB API key is not configured");
  }

  const response = await fetch(`${TMDB_BASE_URL}/movie/${id}`, {
    headers: getHeaders(),
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch movie details");
  }

  return response.json();
}

export async function getTVDetails(id: string) {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB API key is not configured");
  }

  const response = await fetch(`${TMDB_BASE_URL}/tv/${id}`, {
    headers: getHeaders(),
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch TV details");
  }

  return response.json();
}

export async function getTVSeasonEpisodes(id: string, seasonNumber: number) {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB API key is not configured");
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/tv/${id}/season/${seasonNumber}`,
    {
      headers: getHeaders(),
      next: { revalidate: 3600 },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch TV season episodes");
  }

  return response.json();
}


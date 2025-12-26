const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const ID_SECRET = process.env.ID_SECRET || "";

if (!TMDB_API_KEY) {
  throw new Error("TMDB_API_KEY is not defined in environment variables.");
}

if (!ID_SECRET) {
  throw new Error("ID_SECRET is not defined in environment variables.");
}

// XOR encryption/decryption for IDs
function xorEncrypt(id: number, secret: string): string {
  const idStr = id.toString();
  const encryptedBytes: number[] = [];
  for (let i = 0; i < idStr.length; i++) {
    const charCode = idStr.charCodeAt(i);
    const secretChar = secret.charCodeAt(i % secret.length);
    const encryptedChar = charCode ^ secretChar;
    encryptedBytes.push(encryptedChar);
  }
  // Convert to base64url for safe URL encoding
  return Buffer.from(encryptedBytes).toString("base64url");
}

function xorDecrypt(encryptedId: string, secret: string): number {
  try {
    const encryptedBytes = Buffer.from(encryptedId, "base64url");
    let decrypted = "";
    for (let i = 0; i < encryptedBytes.length; i++) {
      const encryptedChar = encryptedBytes[i];
      const secretChar = secret.charCodeAt(i % secret.length);
      const decryptedChar = encryptedChar ^ secretChar;
      decrypted += String.fromCharCode(decryptedChar);
    }
    return parseInt(decrypted, 10);
  } catch (error) {
    throw new Error("Invalid encrypted ID format");
  }
}

// Obfuscate a TMDB ID
export function obfuscateId(id: number): string {
  return xorEncrypt(id, ID_SECRET);
}

// Deobfuscate an obfuscated ID back to TMDB ID
export function deobfuscateId(encryptedId: string): number {
  return xorDecrypt(encryptedId, ID_SECRET);
}

// Recursively obfuscate IDs in an object
function obfuscateIdsInObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => obfuscateIdsInObject(item));
  }
  if (obj && typeof obj === "object") {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === "id" && typeof value === "number") {
        result[key] = obfuscateId(value);
      } else if (
        (key === "movie_id" || key === "tv_id" || key === "series_id") &&
        typeof value === "number"
      ) {
        result[key] = obfuscateId(value);
      } else if (key === "genres") { // RECURSIVELY OBFUSCATE EXCEPT GENRES
        result[key] = value;
      } else if (key !== "genres") { // RECURSIVELY OBFUSCATE EXCEPT GENRES
        result[key] = obfuscateIdsInObject(value);
      }
    }
    return result;
  }
  return obj;
}

// Make a request to TMDB API
async function makeRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${TMDB_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${TMDB_API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  return response;
}

// TMDB Client class
export class TMDBClient {
  // Get trending movies
  async getTrendingMovies(page: number = 1, timeWindow: "day" | "week" = "week") {
    const response = await makeRequest(
      `/trending/movie/${timeWindow}?page=${page}`,
      {
        next: { revalidate: 3600 },
      }
    );
    const data = await response.json();
    return obfuscateIdsInObject(data);
  }

  // Search movies
  async searchMovies(params: {
    query?: string;
    language?: string;
    page?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.query) searchParams.set("query", params.query);
    if (params.language) searchParams.set("language", params.language);

    const response = await makeRequest(
      `/search/movie?${searchParams.toString()}`,
      {
        next: { revalidate: 300 },
      }
    );
    const data = await response.json();
    return obfuscateIdsInObject(data);
  }

  // Discover movies
  async discoverMovies(params: {
    page?: number;
    with_original_language?: string;
    with_origin_country?: string;
    with_genres?: string;
    "release_date.gte"?: string;
    "release_date.lte"?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.with_original_language)
      searchParams.set("with_original_language", params.with_original_language);
    if (params.with_origin_country)
      searchParams.set("with_origin_country", params.with_origin_country);
    if (params.with_genres) searchParams.set("with_genres", params.with_genres);
    if (params["release_date.gte"])
      searchParams.set("release_date.gte", params["release_date.gte"]);
    if (params["release_date.lte"])
      searchParams.set("release_date.lte", params["release_date.lte"]);

    const response = await makeRequest(
      `/discover/movie?${searchParams.toString()}`,
      {
        next: { revalidate: 300 },
      }
    );
    const data = await response.json();
    return obfuscateIdsInObject(data);
  }

  // Get movie details
  async getMovieDetails(encryptedId: string) {
    const id = deobfuscateId(encryptedId);
    const response = await makeRequest(`/movie/${id}`, {
      next: { revalidate: 3600 },
    });
    const data = await response.json();
    return obfuscateIdsInObject(data);
  }

  // Search TV shows
  async searchTVShows(params: {
    query?: string;
    language?: string;
    page?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.query) searchParams.set("query", params.query);
    if (params.language) searchParams.set("language", params.language);

    const response = await makeRequest(`/search/tv?${searchParams.toString()}`, {
      next: { revalidate: 300 },
    });
    const data = await response.json();
    return obfuscateIdsInObject(data);
  }

  // Discover TV shows
  async discoverTVShows(params: {
    page?: number;
    with_original_language?: string;
    with_origin_country?: string;
    with_genres?: string;
    "first_air_date.gte"?: string;
    "first_air_date.lte"?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.with_original_language)
      searchParams.set("with_original_language", params.with_original_language);
    if (params.with_origin_country)
      searchParams.set("with_origin_country", params.with_origin_country);
    if (params.with_genres) searchParams.set("with_genres", params.with_genres);
    if (params["first_air_date.gte"])
      searchParams.set("first_air_date.gte", params["first_air_date.gte"]);
    if (params["first_air_date.lte"])
      searchParams.set("first_air_date.lte", params["first_air_date.lte"]);

    const response = await makeRequest(`/discover/tv?${searchParams.toString()}`, {
      next: { revalidate: 300 },
    });
    const data = await response.json();
    return obfuscateIdsInObject(data);
  }

  // Get TV show details
  async getTVDetails(encryptedId: string) {
    const id = deobfuscateId(encryptedId);
    const response = await makeRequest(`/tv/${id}`, {
      next: { revalidate: 3600 },
    });
    const data = await response.json();
    return obfuscateIdsInObject(data);
  }

  // Get TV season details
  async getTVSeasonDetails(encryptedId: string, seasonNumber: number) {
    const id = deobfuscateId(encryptedId);
    const response = await makeRequest(`/tv/${id}/season/${seasonNumber}`, {
      next: { revalidate: 3600 },
    });
    const data = await response.json();
    return obfuscateIdsInObject(data);
  }

  // Get movie genres
  async getMovieGenres() {
    const response = await makeRequest("/genre/movie/list", {
      next: { revalidate: 86400 },
    });
    const data = await response.json();
    return obfuscateIdsInObject(data);
    // return data; // Genres don't need ID obfuscation
  }

  // Get TV genres
  async getTVGenres() {
    const response = await makeRequest("/genre/tv/list", {
      next: { revalidate: 86400 },
    });
    const data = await response.json();
    return obfuscateIdsInObject(data);
    // return data; // Genres don't need ID obfuscation
  }
}

// Export a singleton instance
export const tmdbClient = new TMDBClient();


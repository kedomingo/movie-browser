import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;

export async function GET(request: NextRequest) {
  if (!TMDB_API_KEY) {
    return NextResponse.json(
      { error: "TMDB API key is not configured" },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get("page") || "1";
  const query = searchParams.get("query");
  const language = searchParams.get("language");
  const country = searchParams.get("country");
  const genre = searchParams.get("genre");

  try {
    // If there's a query, use the search endpoint
    if (query) {
      const params = new URLSearchParams({
        page,
        query,
      });

      if (language) {
        params.append("language", language);
      }

      const response = await fetch(
        `${TMDB_BASE_URL}/search/movie?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${TMDB_API_KEY}`,
            "Content-Type": "application/json",
          },
          next: { revalidate: 300 }, // Revalidate every 5 minutes
        }
      );

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    }

    // Otherwise, use the discover endpoint for filtering
    const params = new URLSearchParams({
      page,
    });

    if (language) {
      params.append("with_original_language", language);
    }

    if (country) {
      params.append("with_origin_country", country);
    }

    if (genre) {
      params.append("with_genres", genre);
    }

    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${TMDB_API_KEY}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 300 }, // Revalidate every 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error searching movies:", error);
    return NextResponse.json(
      { error: "Failed to search movies" },
      { status: 500 }
    );
  }
}


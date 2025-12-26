import { NextResponse } from "next/server";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;

export async function GET() {
  if (!TMDB_API_KEY) {
    return NextResponse.json(
      { error: "TMDB API key is not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${TMDB_BASE_URL}/genre/movie/list`, {
      headers: {
        Authorization: `Bearer ${TMDB_API_KEY}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 86400 }, // Revalidate once per day
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching movie genres:", error);
    return NextResponse.json(
      { error: "Failed to fetch movie genres" },
      { status: 500 }
    );
  }
}


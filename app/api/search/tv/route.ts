import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIdentifier } from "@/lib/rateLimit";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;

export async function GET(request: NextRequest) {
  // Rate limiting
  const identifier = getClientIdentifier(request);
  const limit = rateLimit(identifier);

  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((limit.resetTime - Date.now()) / 1000)),
          "X-RateLimit-Limit": "25",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(limit.resetTime),
        },
      }
    );
  }

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
  const year = searchParams.get("year");

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
        `${TMDB_BASE_URL}/search/tv?${params.toString()}`,
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
      return NextResponse.json(data, {
        headers: {
          "X-RateLimit-Limit": "25",
          "X-RateLimit-Remaining": String(limit.remaining),
          "X-RateLimit-Reset": String(limit.resetTime),
        },
      });
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

    // Handle year filter (for TV, use first_air_date)
    if (year) {
      const { getYearRange } = await import("@/lib/yearRanges");
      const yearRange = getYearRange(year);
      if (yearRange.gte) {
        params.append("first_air_date.gte", yearRange.gte);
      }
      if (yearRange.lte) {
        params.append("first_air_date.lte", yearRange.lte);
      }
    }

    const response = await fetch(
      `${TMDB_BASE_URL}/discover/tv?${params.toString()}`,
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
    return NextResponse.json(data, {
      headers: {
        "X-RateLimit-Limit": "25",
        "X-RateLimit-Remaining": String(limit.remaining),
        "X-RateLimit-Reset": String(limit.resetTime),
      },
    });
  } catch (error) {
    console.error("Error searching TV shows:", error);
    return NextResponse.json(
      { error: "Failed to search TV shows" },
      { status: 500 }
    );
  }
}


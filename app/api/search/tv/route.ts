import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIdentifier } from "@/lib/rateLimit";
import { tmdbClient } from "@/lib/tmdb-client";
import { getYearRange } from "@/lib/yearRanges";

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

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const query = searchParams.get("query");
  const language = searchParams.get("language");
  const country = searchParams.get("country");
  const genre = searchParams.get("genre");
  const year = searchParams.get("year");

  try {
    let data;

    // If there's a query, use the search endpoint
    if (query) {
      data = await tmdbClient.searchTVShows({
        query,
        language: language || undefined,
        page,
      });
    } else {
      // Otherwise, use the discover endpoint for filtering
      const discoverParams: any = {
        page,
      };

      if (language) {
        discoverParams.with_original_language = language;
      }

      if (country) {
        discoverParams.with_origin_country = country;
      }

      if (genre) {
        discoverParams.with_genres = genre;
      }

      // Handle year filter (for TV, use first_air_date)
      if (year) {
        const yearRange = getYearRange(year);
        if (yearRange.gte) {
          discoverParams["first_air_date.gte"] = yearRange.gte;
        }
        if (yearRange.lte) {
          discoverParams["first_air_date.lte"] = yearRange.lte;
        }
      }

      data = await tmdbClient.discoverTVShows(discoverParams);
    }

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


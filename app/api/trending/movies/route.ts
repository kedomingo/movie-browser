import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIdentifier } from "@/lib/rateLimit";
import { tmdbClient } from "@/lib/tmdb-client";

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

  try {
    const data = await tmdbClient.getTrendingMovies(page, "week");
    return NextResponse.json(data, {
      headers: {
        "X-RateLimit-Limit": "25",
        "X-RateLimit-Remaining": String(limit.remaining),
        "X-RateLimit-Reset": String(limit.resetTime),
      },
    });
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending movies" },
      { status: 500 }
    );
  }
}


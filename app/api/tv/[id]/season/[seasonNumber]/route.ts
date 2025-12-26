import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIdentifier } from "@/lib/rateLimit";
import { tmdbClient } from "@/lib/tmdb-client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; seasonNumber: string }> }
) {
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

  const { id, seasonNumber } = await params;
  // Extract the encrypted ID from the slug (format: encryptedId-slug)
  const encryptedId = id.split("-")[0];
  const seasonNum = parseInt(seasonNumber, 10);

  try {
    const data = await tmdbClient.getTVSeasonDetails(encryptedId, seasonNum);
    return NextResponse.json(data, {
      headers: {
        "X-RateLimit-Limit": "25",
        "X-RateLimit-Remaining": String(limit.remaining),
        "X-RateLimit-Reset": String(limit.resetTime),
      },
    });
  } catch (error) {
    console.error("Error fetching TV season details:", error);
    return NextResponse.json(
      { error: "Failed to fetch TV season details" },
      { status: 500 }
    );
  }
}


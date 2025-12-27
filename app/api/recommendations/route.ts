import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIdentifier } from "@/lib/rateLimit";
import { obfuscateIdsInObject } from "@/lib/tmdb-client";
import { supabase } from "@/lib/supabase";
import { createHash } from "crypto";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const CACHE_DURATION_HOURS = 24 * 365; // 1 year

// Create a cache key from query and kind
function createCacheKey(query: string, kind: string): string {
  const combined = `${query}:${kind}`;
  return createHash("sha256").update(combined).digest("hex");
}

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
          "Retry-After": String(
            Math.ceil((limit.resetTime - Date.now()) / 1000),
          ),
          "X-RateLimit-Limit": "25",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(limit.resetTime),
        },
      },
    );
  }

  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured" },
      { status: 500 },
    );
  }

  if (!TMDB_API_KEY) {
    return NextResponse.json(
      { error: "TMDB API key is not configured" },
      { status: 500 },
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");
  const kind = searchParams.get("kind");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required (e.g., 'Nobody 2021')" },
      { status: 400 },
    );
  }
  if (!kind) {
    return NextResponse.json(
      { error: "Kind parameter is required (e.g., 'movie', 'tv')" },
      { status: 400 },
    );
  }

  try {
    // Check Supabase cache first
    const cacheKey = createCacheKey(query, kind);
    const now = new Date().toISOString();
    const expiresAt = new Date(
      Date.now() + CACHE_DURATION_HOURS * 60 * 60 * 1000,
    ).toISOString();

    if (supabase) {
      try {
        const { data: cachedData, error: cacheError } = await supabase
          .from("recommendations_cache")
          .select("*")
          .eq("id", cacheKey)
          .gt("expires_at", now)
          .single();

        if (!cacheError && cachedData) {
          console.log("Supabase cache hit");
          // Return cached results
          return NextResponse.json(
            {
              recommendations: cachedData.recommendations,
              count: cachedData.recommendations?.length || 0,
            },
            {
              headers: {
                "X-RateLimit-Limit": "25",
                "X-RateLimit-Remaining": String(limit.remaining),
                "X-RateLimit-Reset": String(limit.resetTime),
                "Cache-Control":
                  "public, s-maxage=3600, stale-while-revalidate=3600",
                "X-Cache": "HIT",
              },
            },
          );
        }
      } catch (supabaseError) {
        console.error("Error checking Supabase cache:", supabaseError);
        // Continue to fetch from OpenAI if cache check fails
      }
    }

    console.log("Supabase cache miss");

    // Extract year from query (e.g., "Nobody (2021)" -> 2021)
    const yearMatch = query.match(/\((\d{4})\)/);
    const queryYear = yearMatch ? parseInt(yearMatch[1], 10) : null;
    const currentYear = new Date().getFullYear();

    // Use gpt-5-nano if the year matches current year, otherwise use gpt-4o-mini
    const model = queryYear === currentYear ? "gpt-4.1-mini" : "gpt-4o-mini";

    // Step 1: Query OpenAI for recommendations
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "user",
              content: `Recommend ${kind === "tv" ? "TV shows" : "Movies"} similar to ${query}. Prioritize thematic similarity before genre. Format output as title,year released with one show per line - nothing else!`,
            },
          ],
          ...(model === "gpt-4.1-mini" ? {} : { temperature: 0.7 }),
        }),
      },
    );

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      console.error("OpenAI API error:", errorData);
      return NextResponse.json(
        {
          error: "Failed to get recommendations from OpenAI",
          details: errorData,
        },
        { status: 500 },
      );
    }

    const openaiData = await openaiResponse.json();
    const recommendationsText = openaiData.choices?.[0]?.message?.content || "";

    console.log(recommendationsText);

    // Step 2: Parse the OpenAI response
    const recommendations = recommendationsText
      .split("\n")
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
      .map((line: string) => {
        // Parse "title,year" format
        const parts = line.split(",");
        if (parts.length >= 2) {
          const title = parts.slice(0, -1).join(",").trim(); // Handle titles with commas
          const year = parseInt(parts[parts.length - 1].trim(), 10);
          return { title, year: isNaN(year) ? undefined : year };
        }
        return null;
      })
      .filter(
        (item: { title: string; year?: number } | null) => item !== null,
      ) as {
      title: string;
      year?: number;
    }[];

    // Step 3: Search TMDB for each recommendation
    const results = await Promise.all(
      recommendations.map(async (rec) => {
        try {
          const searchParams = new URLSearchParams();
          searchParams.set("query", rec.title);
          if (rec.year) {
            searchParams.set("year", rec.year.toString());
          }

          const response = await fetch(
            `${TMDB_BASE_URL}/search/${kind}?${searchParams.toString()}`,
            {
              headers: {
                Authorization: `Bearer ${TMDB_API_KEY}`,
                "Content-Type": "application/json",
              },
            },
          );

          if (!response.ok) {
            console.error(
              `TMDB search failed for ${rec.title}:`,
              response.status,
            );
            return null;
          }

          const data = await response.json();
          if (data.results && data.results.length > 0) {
            // Return the first result
            return data.results[0];
          }
          return null;
        } catch (error) {
          console.error(`Error searching TMDB for ${rec.title}:`, error);
          return null;
        }
      }),
    );

    // Filter out null results
    const validResults = results.filter((result) => result !== null);

    // Obfuscate IDs in the results
    const obfuscatedResults = validResults.map((result) =>
      obfuscateIdsInObject(result),
    );

    // Save to Supabase cache
    if (supabase) {
      try {
        await supabase.from("recommendations_cache").upsert(
          {
            id: cacheKey,
            query: query,
            kind: kind as "movie" | "tv",
            recommendations: obfuscatedResults,
            created_at: now,
            expires_at: expiresAt,
          },
          {
            onConflict: "id",
          },
        );
      } catch (supabaseError) {
        console.error("Error saving to Supabase cache:", supabaseError);
        // Continue even if cache save fails
      }
    }

    return NextResponse.json(
      {
        recommendations: obfuscatedResults,
        count: obfuscatedResults.length,
      },
      {
        headers: {
          "X-RateLimit-Limit": "25",
          "X-RateLimit-Remaining": String(limit.remaining),
          "X-RateLimit-Reset": String(limit.resetTime),
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=3600",
          "X-Cache": "MISS",
        },
      },
    );
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return NextResponse.json(
      {
        error: "Failed to get recommendations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

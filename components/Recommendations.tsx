"use client";

import { useState, useEffect } from "react";
import { MediaItem } from "@/types/tmdb";
import MediaGrid from "./MediaGrid";

interface RecommendationsProps {
  kind: "movie" | "tv";
  query: string; // e.g., "Nobody 2021"
  tmdbId: string; // Obfuscated TMDB ID
}

interface CachedRecommendationEntry {
  expiry: number;
  id: string;
  kind: "movie" | "tv";
  recommendations: MediaItem[];
}

interface RecommendationsCache {
  [tmdbId: string]: CachedRecommendationEntry;
}

const CACHE_KEY = "tmdb-recommendations";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 day in milliseconds

// Clean up expired entries from cache
function cleanupCache(): RecommendationsCache {
  if (typeof window === "undefined") return {};

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return {};

    const cache: RecommendationsCache = JSON.parse(cached);
    const now = Date.now();
    const cleaned: RecommendationsCache = {};

    // Keep only entries that haven't expired
    for (const [id, entry] of Object.entries(cache)) {
      if (now < entry.expiry) {
        cleaned[id] = entry;
      }
    }

    // Update localStorage with cleaned cache
    localStorage.setItem(CACHE_KEY, JSON.stringify(cleaned));

    return cleaned;
  } catch (error) {
    console.error("Error cleaning cache:", error);
    return {};
  }
}

export default function Recommendations({
  kind,
  query,
  tmdbId,
}: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clean up expired entries on component load
    cleanupCache();
  }, []);

  useEffect(() => {
    async function fetchRecommendations() {
      if (!query || !tmdbId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch from API
        const response = await fetch(
          `/api/recommendations?query=${encodeURIComponent(query)}&kind=${kind}`,
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch recommendations");
        }

        const data = await response.json();

        // Convert TMDB movie results to MediaItem format
        const allMediaItems: MediaItem[] = data.recommendations.map(
          (movie: any) => ({
            id: movie.id as string,
            title: movie.title || movie.original_title || movie.name,
            poster_path: movie.poster_path,
            backdrop_path: movie.backdrop_path,
            overview: movie.overview,
            release_date: movie.release_date,
            vote_average: movie.vote_average || 0,
            vote_count: movie.vote_count || 0,
            media_type: "movie",
            original_language: movie.original_language || "",
          }),
        );

        // Remove duplicates based on ID
        const seenIds = new Set<string | number>();
        const mediaItems: MediaItem[] = allMediaItems.filter((item) => {
          if (seenIds.has(item.id)) {
            return false;
          }
          seenIds.add(item.id);
          return true;
        });

        setRecommendations(mediaItems);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load recommendations",
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecommendations();
  }, [query, tmdbId]);

  if (error) {
    return null; // Silently fail - don't show error to user
  }

  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-bold text-white">Similar Shows</h2>
        <MediaGrid
          items={[]}
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}}
          isLoading={true}
        />
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-2xl font-bold text-white">Similar Shows</h2>
      <MediaGrid
        items={recommendations}
        currentPage={1}
        totalPages={1}
        onPageChange={() => {}}
        isLoading={false}
        kind={kind}
      />
    </div>
  );
}

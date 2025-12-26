"use client";

import { MediaItem } from "@/types/tmdb";
import WatchLaterButton from "./WatchLaterButton";

interface MovieTitleWithWatchLaterProps {
  title: string;
  movie: {
    id: number | string;
    original_title: string;
    poster_path?: string | null;
    backdrop_path: string | null;
    overview: string;
    release_date: string;
    vote_average: number;
    vote_count: number;
    original_language: string;
  };
}

export default function MovieTitleWithWatchLater({
  title,
  movie,
}: MovieTitleWithWatchLaterProps) {
  // Convert movie details to MediaItem format
  const mediaItem: MediaItem = {
    id: movie.id,
    title: movie.original_title,
    poster_path: movie.poster_path || null,
    backdrop_path: movie.backdrop_path,
    overview: movie.overview,
    release_date: movie.release_date,
    vote_average: movie.vote_average,
    vote_count: movie.vote_count,
    media_type: "movie",
    original_language: movie.original_language,
  };

  return (
    <div className="flex items-start justify-between gap-4">
      <h1 className="flex-1 text-4xl font-bold text-white sm:text-5xl md:text-6xl">
        {title}
      </h1>
      <div className="flex-shrink-0">
        <WatchLaterButton item={mediaItem} />
      </div>
    </div>
  );
}


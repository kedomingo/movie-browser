"use client";

import { useState, useEffect } from "react";
import { MediaItem } from "@/types/tmdb";
import { addToWatchList, removeFromWatchList, isInWatchList } from "@/lib/watchList";

interface WatchLaterButtonProps {
  item: MediaItem;
}

export default function WatchLaterButton({ item }: WatchLaterButtonProps) {
  const [isWatched, setIsWatched] = useState(false);

  useEffect(() => {
    setIsWatched(isInWatchList(item.id));
  }, [item.id]);

  const handleToggle = () => {
    if (isWatched) {
      removeFromWatchList(item.id);
      setIsWatched(false);
    } else {
      addToWatchList(item);
      setIsWatched(true);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        isWatched
          ? "bg-blue-600 text-white hover:bg-blue-700"
          : "bg-green-600 text-white hover:bg-green-700"
      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900`}
    >
      {isWatched ? "Remove from watch list" : "Watch Later"}
    </button>
  );
}


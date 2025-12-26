"use client";

import { MediaItem } from "@/types/tmdb";
import MovieCard from "./MovieCard";

interface MediaGridProps {
  items: MediaItem[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export default function MediaGrid({
  items,
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: MediaGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="aspect-[2/3] w-full animate-pulse rounded-lg bg-gray-700" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-700" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-700" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-400">No results found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 md:grid-cols-5  gap-4">
        {items.map((item) => (
          <MovieCard key={item.id} item={item} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}


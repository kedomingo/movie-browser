"use client";

import { MovieDetails } from "@/app/movie/[id]/page";
import { useState } from "react";

interface CollapsibleOverviewProps {
  movie: MovieDetails;
}

export default function CollapsibleOverview({
  movie,
}: CollapsibleOverviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative">
      <div
        className={`relative overflow-hidden transition-all duration-300 ${
          isExpanded ? "max-h-none" : "max-h-[3.5rem]"
        }`}
      >
        <div className="flex flex-col gap-2">
          <p className="text-lg text-gray-300 leading-relaxed">
            {movie.overview}
          </p>

          {movie.release_date && (
            <div>
              <span className="font-semibold">Release Date: </span>
              <span>{new Date(movie.release_date).toLocaleDateString()}</span>
            </div>
          )}
          {movie.budget > 0 && (
            <div>
              <span className="font-semibold">Budget: </span>
              <span>
                ${new Intl.NumberFormat("en-US").format(movie.budget)}
              </span>
            </div>
          )}
          {movie.revenue > 0 && (
            <div>
              <span className="font-semibold">Revenue: </span>
              <span>
                ${new Intl.NumberFormat("en-US").format(movie.revenue)}
              </span>
            </div>
          )}

          <a
            target="_blank"
            className="underline"
            href={`https://www.rottentomatoes.com/search?search=${encodeURIComponent(movie.original_title)}`}
          >
            Rotten tomatoes
          </a>
        </div>
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent pointer-events-none" />
        )}
      </div>
      {!isExpanded && (
        <div className="mt-2 flex items-center justify-center">
          <button
            onClick={() => setIsExpanded(true)}
            className="text-sm text-blue-400 hover:text-blue-300 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
          >
            Show more
          </button>
        </div>
      )}
      {isExpanded && (
        <div className="mt-2 flex items-center justify-center">
          <button
            onClick={() => setIsExpanded(false)}
            className="text-sm text-blue-400 hover:text-blue-300 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
          >
            Show less
          </button>
        </div>
      )}
    </div>
  );
}

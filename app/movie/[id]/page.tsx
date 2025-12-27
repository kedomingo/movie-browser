import Image from "next/image";
import { getBackdropUrl } from "@/lib/tmdb";
import GenreBadge from "@/components/GenreBadge";
import MediaPlayer from "@/components/MediaPlayer";
import MovieTitleWithWatchLater from "@/components/MovieTitleWithWatchLater";
import CollapsibleOverview from "@/components/CollapsibleOverview";
import CollapsibleCast from "@/components/CollapsibleCast";
import Recommendations from "@/components/Recommendations";

interface CastMember {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  cast_id: number;
  character: string;
  credit_id: string;
  order: number;
}

export interface MovieDetails {
  id: number;
  original_title: string;
  title: string;
  overview: string;
  poster_path?: string | null;
  backdrop_path: string | null;
  genres: Array<{ id: number; name: string }>;
  release_date: string;
  budget: number;
  revenue: number;
  original_language: string;
  vote_average: number;
  vote_count: number;
  credits?: {
    cast: CastMember[];
  };
}

async function getMovieDetails(encryptedId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/movies/${encryptedId}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch movie details");
  }

  return response.json();
}

export default async function MovieDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idWithSlug } = await params;
  // Extract the encrypted ID (before the first hyphen)
  const encryptedId = idWithSlug.split("-")[0];
  const movie = await getMovieDetails(encryptedId);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Backdrop background */}
      <div className="fixed inset-0 z-0">
        {movie.backdrop_path && (
          <div className="relative w-full h-full">
            <Image
              src={getBackdropUrl(movie.backdrop_path)}
              alt={movie.original_title}
              fill
              className="object-cover opacity-20"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gray-900/60" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          {/* Title with Watch Later button */}
          <MovieTitleWithWatchLater movie={movie} />

          {/* Details */}
          <div className="flex flex-col gap-4">
            {/* Overview */}
            {movie.overview && <CollapsibleOverview movie={movie} />}

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre: { id: number; name: string }) => (
                  <GenreBadge
                    key={genre.id}
                    id={genre.id}
                    name={genre.name}
                    mediaType="movie"
                  />
                ))}
              </div>
            )}

            {/* Release date and rating */}
            <div className="flex flex-wrap items-center gap-4 text-gray-300">
              {movie.original_language && (
                <div>
                  <span className="font-semibold">
                    {movie.original_language}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <span className="font-semibold">Rating: </span>
                <span className="text-yellow-400">★</span>
                <span>
                  {movie.vote_average.toFixed(1)} ({movie.vote_count})
                </span>
              </div>

              {(movie.vote_average >= 6.5 &&
                movie.vote_count >= 200 &&
                movie.revenue > movie.budget * 3) ||
              movie.revenue > movie.budget * 4 ? (
                <>Likely Excellent</>
              ) : (movie.vote_average >= 6 && movie.vote_count >= 100) ||
                movie.revenue > movie.budget * 2 ? (
                <>Potential: Likely good</>
              ) : movie.vote_average < 5 ||
                movie.vote_count < 100 ||
                movie.revenue < movie.budget * 2 ? (
                <>Potential: Likely bad</>
              ) : (
                <></>
              )}
            </div>
          </div>

          {/* Media Player */}
          <MediaPlayer
            mediaType="movie"
            mediaId={encryptedId}
            language={undefined}
          />

          {/* Cast Section */}
          {movie.credits?.cast && <CollapsibleCast cast={movie.credits.cast} />}

          {/* Recommendations */}
          <Recommendations
            kind="movie"
            query={`${movie.title} (${new Date(movie.release_date).getFullYear()})`}
            tmdbId={encryptedId}
          />
        </div>
      </div>
    </div>
  );
}

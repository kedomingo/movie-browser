import Image from "next/image";
import { getBackdropUrl } from "@/lib/tmdb";
import GenreBadge from "@/components/GenreBadge";
import MediaPlayer from "@/components/MediaPlayer";

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

interface MovieDetails {
  id: number;
  original_title: string;
  overview: string;
  backdrop_path: string | null;
  genres: Array<{ id: number; name: string }>;
  release_date: string;
  vote_average: number;
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
          {/* Title */}
          <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">
            {movie.original_title}
          </h1>

          {/* Details */}
          <div className="flex flex-col gap-4">
            {/* Overview */}
            {movie.overview && (
              <p className="text-lg text-gray-300 leading-relaxed">
                {movie.overview}
              </p>
            )}

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
              {movie.release_date && (
                <div>
                  <span className="font-semibold">Release Date: </span>
                  <span>{new Date(movie.release_date).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <span className="font-semibold">Rating: </span>
                <span className="text-yellow-400">★</span>
                <span>{movie.vote_average.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Media Player */}
          <MediaPlayer
            mediaType="movie"
            mediaId={encryptedId}
            language={undefined}
          />

          {/* Cast Section */}
          {movie.credits?.cast && (
            <div className="mt-8">
              <h2 className="mb-4 text-2xl font-bold text-white">Top 10 Cast</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                {movie.credits.cast
                  .filter((member:CastMember) => member.known_for_department === "Acting")
                  .slice(0, 10)
                  .map((member:CastMember) => (
                    <div
                      key={member.id}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="relative h-20 w-20 overflow-hidden rounded-full">
                        {member.profile_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w185${member.profile_path}`}
                            alt={member.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-700 text-gray-400">
                            <span className="text-xs">No Photo</span>
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-white">
                          {member.name}
                        </p>
                        <p className="text-xs text-gray-400">{member.character}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


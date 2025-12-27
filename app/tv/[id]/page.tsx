"use client";

import Header from "@/components/Header";
import { useState, useEffect } from "react";
import Image from "next/image";
import { getBackdropUrl } from "@/lib/tmdb";
import GenreBadge from "@/components/GenreBadge";
import MediaPlayer from "@/components/MediaPlayer";
import WatchLaterButton from "@/components/WatchLaterButton";
import { MediaItem } from "@/types/tmdb";
import CollapsibleOverview from "@/components/CollapsibleOverview";
import Recommendations from "@/components/Recommendations";

interface TVDetails {
  id: number;
  name: string;
  original_name?: string;
  overview: string;
  poster_path?: string | null;
  backdrop_path: string | null;
  genres: Array<{ id: number; name: string }>;
  first_air_date: string;
  vote_average: number;
  vote_count?: number;
  original_language?: string;
  seasons: Array<{
    id: number;
    season_number: number;
    name: string;
    episode_count: number;
  }>;
}

interface Episode {
  id: number;
  episode_number: number;
  name: string;
  overview?: string;
  air_date?: string;
}

async function getTVDetails(encryptedId: string): Promise<TVDetails> {
  const response = await fetch(`/api/tv/${encryptedId}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch TV details");
  }

  return response.json();
}

async function getSeasonEpisodes(
  encryptedId: string,
  seasonNumber: number,
): Promise<Episode[]> {
  const response = await fetch(
    `/api/tv/${encryptedId}/season/${seasonNumber}`,
    {
      next: { revalidate: 3600 },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch season episodes");
  }

  const data = await response.json();
  return data.episodes || [];
}

export default function TVDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [tvShow, setTVShow] = useState<TVDetails | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [tvId, setTvId] = useState<string | null>(null);

  // Load saved episode from localStorage
  const loadSavedEpisode = (id: string) => {
    try {
      const saved = localStorage.getItem(`tv-${id}-last-watched`);
      if (saved) {
        const { seasonNumber, episodeNumber } = JSON.parse(saved);
        return { seasonNumber, episodeNumber };
      }
    } catch (error) {
      console.error("Error loading saved episode:", error);
    }
    return null;
  };

  // Save episode to localStorage
  const saveEpisode = (
    id: string,
    seasonNumber: number,
    episodeNumber: number,
  ) => {
    try {
      localStorage.setItem(
        `tv-${id}-last-watched`,
        JSON.stringify({ seasonNumber, episodeNumber }),
      );
    } catch (error) {
      console.error("Error saving episode:", error);
    }
  };

  useEffect(() => {
    async function loadTVDetails() {
      try {
        const { id: idWithSlug } = await params;
        // Extract the encrypted ID (before the first hyphen)
        const encryptedId = idWithSlug.split("-")[0];
        setTvId(encryptedId);
        const data = await getTVDetails(encryptedId);
        setTVShow(data);

        // Try to load saved episode
        const saved = loadSavedEpisode(encryptedId);
        if (saved && data.seasons) {
          const season = data.seasons.find(
            (s) => s.season_number === saved.seasonNumber,
          );
          if (season) {
            setSelectedSeason(saved.seasonNumber);
            setSelectedEpisode(saved.episodeNumber);
          } else if (data.seasons.length > 0) {
            setSelectedSeason(data.seasons[0].season_number);
          }
        } else if (data.seasons && data.seasons.length > 0) {
          setSelectedSeason(data.seasons[0].season_number);
        }
      } catch (error) {
        console.error("Error loading TV details:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadTVDetails();
  }, [params]);

  useEffect(() => {
    async function loadEpisodes() {
      if (!tvShow || selectedSeason === null || !tvId) return;

      setIsLoadingEpisodes(true);
      try {
        const episodeData = await getSeasonEpisodes(tvId, selectedSeason);
        setEpisodes(episodeData);

        // If we have a saved episode and it's in this season, select it
        if (selectedEpisode !== null) {
          const episode = episodeData.find(
            (e) => e.episode_number === selectedEpisode,
          );
          if (!episode) {
            // Episode not found in this season, auto-select first episode
            if (episodeData.length > 0) {
              const firstEpisode = episodeData[0].episode_number;
              setSelectedEpisode(firstEpisode);
              saveEpisode(tvId, selectedSeason, firstEpisode);
            } else {
              setSelectedEpisode(null);
            }
          }
        } else {
          // No episode selected, auto-select first episode
          if (episodeData.length > 0) {
            const firstEpisode = episodeData[0].episode_number;
            setSelectedEpisode(firstEpisode);
            saveEpisode(tvId, selectedSeason, firstEpisode);
          }
        }
      } catch (error) {
        console.error("Error loading episodes:", error);
        setEpisodes([]);
        setSelectedEpisode(null);
      } finally {
        setIsLoadingEpisodes(false);
      }
    }

    loadEpisodes();
  }, [tvShow, selectedSeason, tvId]);

  if (isLoading || !tvShow) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  const displayName = tvShow.name;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-900">
        {/* Backdrop background */}
        <div className="fixed inset-0 z-0">
          {tvShow.backdrop_path && (
            <div className="relative w-full h-full">
              <Image
                src={getBackdropUrl(tvShow.backdrop_path)}
                alt={displayName}
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
            <div className="flex flex-col items-start justify-between gap-3">
              <div>
                <h1 className="flex-1 text-4xl font-bold text-white sm:text-5xl md:text-6xl">
                  {displayName}
                </h1>
                {tvShow.original_name &&
                  tvShow.original_name !== tvShow.name && (
                    <h3>{tvShow.original_name}</h3>
                  )}
              </div>
              {tvShow && (
                <div className="flex-shrink-0">
                  <WatchLaterButton
                    item={
                      {
                        id: tvShow.id,
                        name: tvShow.name,
                        poster_path: tvShow.poster_path || tvShow.backdrop_path,
                        backdrop_path: tvShow.backdrop_path,
                        overview: tvShow.overview,
                        first_air_date: tvShow.first_air_date,
                        vote_average: tvShow.vote_average,
                        vote_count: tvShow.vote_count || 0,
                        media_type: "tv",
                        original_language: tvShow.original_language || "",
                      } as MediaItem
                    }
                  />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col gap-4">
              {/* Overview */}
              {tvShow.overview && (
                <CollapsibleOverview
                  tv={{
                    overview: tvShow.overview,
                    name: tvShow.name,
                    original_name: tvShow.original_name,
                  }}
                />
              )}

              {/* Genres */}
              {tvShow.genres && tvShow.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tvShow.genres.map((genre: { id: number; name: string }) => (
                    <GenreBadge
                      key={genre.id}
                      id={genre.id}
                      name={genre.name}
                      mediaType="tv"
                    />
                  ))}
                </div>
              )}

              {/* First air date and rating */}
              <div className="flex flex-wrap items-center gap-4 text-gray-300">
                {tvShow.first_air_date && (
                  <div>
                    <span className="font-semibold">First Air Date: </span>
                    <span>
                      {new Date(tvShow.first_air_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <span className="font-semibold">Rating: </span>
                  <span className="text-yellow-400">★</span>
                  <span>{tvShow.vote_average.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Season and Episode dropdowns */}
            {tvShow.seasons && tvShow.seasons.length > 0 && (
              <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                  <label
                    htmlFor="season"
                    className="mb-2 block text-sm font-medium text-gray-300"
                  >
                    Season
                  </label>
                  <select
                    id="season"
                    value={selectedSeason || ""}
                    onChange={(e) => {
                      const seasonNumber = Number(e.target.value);
                      setSelectedSeason(seasonNumber);
                      // Clear episode selection when season changes
                      // The loadEpisodes useEffect will auto-select the first episode
                      setSelectedEpisode(null);
                    }}
                    className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {tvShow.seasons.map((season) => (
                      <option key={season.id} value={season.season_number}>
                        {season.name} ({season.episode_count} episodes)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label
                    htmlFor="episode"
                    className="mb-2 block text-sm font-medium text-gray-300"
                  >
                    Episode
                  </label>
                  <select
                    id="episode"
                    value={selectedEpisode || ""}
                    onChange={(e) => {
                      const episodeNumber = Number(e.target.value);
                      setSelectedEpisode(episodeNumber);
                      // Save to localStorage
                      if (tvId && selectedSeason !== null) {
                        saveEpisode(tvId, selectedSeason, episodeNumber);
                      }
                    }}
                    disabled={isLoadingEpisodes || episodes.length === 0}
                    className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingEpisodes ? (
                      <option>Loading episodes...</option>
                    ) : episodes.length === 0 ? (
                      <option>No episodes available</option>
                    ) : (
                      episodes.map((episode) => (
                        <option key={episode.id} value={episode.episode_number}>
                          Episode {episode.episode_number}: {episode.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            )}

            {/* Media Player */}
            <MediaPlayer
              mediaType="tv"
              mediaId={tvId || ""}
              seasonId={selectedSeason === null ? undefined : selectedSeason}
              episodeId={selectedEpisode === null ? undefined : selectedEpisode}
              mediaName={displayName}
            />

            {/* Episode Details */}
            {selectedEpisode !== null &&
              episodes.length > 0 &&
              (() => {
                const selectedEpisodeData = episodes.find(
                  (ep) => ep.episode_number === selectedEpisode,
                );
                return selectedEpisodeData ? (
                  <div className="mt-6 flex flex-col gap-3 rounded-lg bg-gray-800/50 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-lg font-semibold text-white">
                        Episode {selectedEpisodeData.episode_number}:{" "}
                        {selectedEpisodeData.name}
                      </h3>
                      {selectedEpisodeData.air_date && (
                        <p className="text-sm text-gray-400">
                          Aired:{" "}
                          {new Date(
                            selectedEpisodeData.air_date,
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {selectedEpisodeData.overview && (
                      <p className="text-gray-300 leading-relaxed">
                        {selectedEpisodeData.overview}
                      </p>
                    )}
                  </div>
                ) : null;
              })()}

            {/* Recommendations */}
            {tvShow && tvId && (
              <Recommendations
                kind="tv"
                query={`${tvShow.name} (${new Date(tvShow.first_air_date).getFullYear()})`}
                tmdbId={tvId}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

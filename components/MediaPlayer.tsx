"use client";

import { useState, useEffect } from "react";
import {
  MediaProvider,
  MOVIE_PROVIDERS,
  OK_PROVIDERS,
  TV_PROVIDERS,
} from "@/lib/mediaplayer";

interface MediaPlayerProps {
  mediaType: "movie" | "tv";
  mediaId: string;
  seasonId?: number;
  episodeId?: number;
  mediaName?: string;
  language?: string;
}

export default function MediaPlayer({
  mediaType,
  mediaId,
  seasonId,
  episodeId,
  mediaName,
  language,
}: MediaPlayerProps) {
  const [selectedProvider, setSelectedProvider] = useState<MediaProvider | "">(
    "",
  );
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [dlUrl, setDlUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const providers = mediaType === "movie" ? MOVIE_PROVIDERS : TV_PROVIDERS;

  useEffect(() => {
    // Reset when media changes
    setEmbedUrl(null);
    setError(null);
    setSelectedProvider("");

    if (isDownloading) {
      handleDownload(true);
    }

    // Auto-select vidsrcxyz provider after reset
    const canAutoLoad =
      mediaType === "movie" ||
      (seasonId !== undefined && episodeId !== undefined);

    if (canAutoLoad && providers.includes("vidsrcxyz")) {
      // Use setTimeout to ensure state reset completes first
      const timer = setTimeout(() => {
        handleProviderChange("vidsrcxyz");
      }, 100);

      return () => clearTimeout(timer);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaId, seasonId, episodeId, mediaType]);

  const handleProviderChange = async (provider: MediaProvider) => {
    setSelectedProvider(provider);
    setIsLoading(true);
    setError(null);
    setEmbedUrl(null);

    try {
      // Build query parameters
      const params = new URLSearchParams({
        type: mediaType,
        id: mediaId,
        provider: provider,
      });

      if (language) {
        params.append("language", language);
      }

      if (mediaType === "tv") {
        if (seasonId === undefined || episodeId === undefined) {
          throw new Error("Season and episode are required for TV shows");
        }
        params.append("seasonId", seasonId.toString());
        params.append("episodeId", episodeId.toString());
        if (mediaName) {
          params.append("mediaName", mediaName);
        }
      }

      // Call the API endpoint which handles deobfuscation
      const response = await fetch(`/api/media/embed?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to load media player");
      }

      const data = await response.json();
      setEmbedUrl(data.embedUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load media player",
      );
      console.error("Error loading media:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (isForce: boolean = false) => {
    if (isDownloading && !isForce) {
      setIsDownloading(false);
      return;
    }
    try {
      // Build query parameters
      const params = new URLSearchParams({
        type: mediaType,
        id: mediaId,
      });

      if (mediaType === "tv") {
        if (seasonId === undefined || episodeId === undefined) {
          throw new Error("Season and episode are required for TV shows");
        }
        params.append("seasonId", seasonId.toString());
        params.append("episodeId", episodeId.toString());
      }

      // Call the API endpoint which handles deobfuscation
      const response = await fetch(`/api/media/dl?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to load media player");
      }

      const data = await response.json();
      setDlUrl(data.embedUrl);
      setIsDownloading(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load media player",
      );
      console.error("Error loading media:", err);
    }
  };

  // Check if we can show the player
  const canShowPlayer =
    mediaType === "movie" ||
    (seasonId !== undefined && episodeId !== undefined);

  return (
    <div className="mt-8 flex flex-col gap-4">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-600 bg-gray-800/50 p-12">
          <p className="text-gray-400">Loading player...</p>
        </div>
      )}
      {/* Error State */}
      {error && !isLoading && (
        <div className="rounded-lg border-2 border-red-600 bg-red-900/20 p-4 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      )}
      {/* Media Player */}
      {!isDownloading && embedUrl && !isLoading && !error && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
          <iframe
            src={embedUrl}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Media Player"
          />
        </div>
      )}
      {isDownloading && dlUrl && (
        <iframe
          src={dlUrl}
          height="400"
          className="h-[500px] w-full overscroll-y-auto"
          scrolling="yes"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          title="Media Player"
        />
      )}
      {/* Placeholder when no provider selected */}
      {!selectedProvider && !isLoading && !error && (
        <div className="rounded-lg border-2 border-dashed border-gray-600 bg-gray-800/50 p-12 text-center">
          <p className="text-gray-400">Select a provider to watch media</p>
        </div>
      )}
      {/* Provider Dropdown */}
      <div className="flex items-center justify-between md:justify-start gap-2">
        <div className="">
          <label
            htmlFor="provider"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Server
          </label>
        </div>
        <div className="">
          <select
            id="provider"
            value={selectedProvider}
            onChange={(e) => {
              if (e.target.value) {
                handleProviderChange(e.target.value as MediaProvider);
              } else {
                setSelectedProvider("");
                setEmbedUrl(null);
                setError(null);
              }
            }}
            disabled={!canShowPlayer || isLoading}
            className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {!canShowPlayer
                ? "Select season and episode first"
                : "Choose a provider..."}
            </option>
            {providers.map((provider) => (
              <option key={provider} value={provider}>
                {provider.charAt(0).toUpperCase() + provider.slice(1)}
                {OK_PROVIDERS.has(provider) ? " (Usually good)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          {/*<button*/}
          {/*  onClick={() => handleDownload()}*/}
          {/*  className={`bg-green-600 text-white hover:bg-green-700 cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900`}*/}
          {/*>*/}
          {/*  {!isDownloading ? "Download" : "Back"}*/}
          {/*</button>*/}
        </div>
      </div>
      Disclaimer: Pop-up ads are triggered by these providers. To improve your
      experience, use Firefox and install the Ublock Origin firefox addon
    </div>
  );
}

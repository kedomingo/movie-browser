"use client";

import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SearchComponent from "@/components/SearchComponent";
import MediaGrid from "@/components/MediaGrid";
import MobileTip from "@/components/MobileTip";
import { MediaItem, TMDBResponse } from "@/types/tmdb";
import { fetchTrendingMovies, searchMovies, searchTVShows } from "@/lib/tmdb";
import { getWatchList, WatchListItem } from "@/lib/watchList";

type ViewMode = "trending" | "search" | "watchlist";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>("trending");
  const [trendingMovies, setTrendingMovies] = useState<MediaItem[]>([]);
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [watchListItems, setWatchListItems] = useState<MediaItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState<{
    query?: string;
    kind?: "movie" | "tv";
    language?: string;
    country?: string;
    genre?: string;
    year?: string;
    sort?: string;
  }>({ kind: "movie" });

  // Initialize from URL params
  useEffect(() => {
    const query = searchParams.get("query") || undefined;
    const kind = (searchParams.get("kind") as "movie" | "tv") || undefined;
    const language = searchParams.get("language") || undefined;
    const country = searchParams.get("country") || undefined;
    const genre = searchParams.get("genre") || undefined;
    const year = searchParams.get("year") || undefined;
    const sort = searchParams.get("sort") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);

    const filters = {
      query,
      kind,
      language,
      country,
      genre,
      year,
      sort,
    };

    // Check if we have any search filters
    const hasFilters =
      query || kind || language || country || genre || year || sort;

    if (hasFilters) {
      setViewMode("search");
      setSearchFilters(filters);
      setCurrentPage(page);
      // Trigger search
      performSearch(filters, page);
    } else {
      setViewMode("trending");
      setCurrentPage(page);
      loadTrendingMovies(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const loadTrendingMovies = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const data: TMDBResponse<MediaItem> = await fetchTrendingMovies(page);
      setTrendingMovies(data.results);
      setTotalPages(data.total_pages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching trending movies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateURL = (filters: typeof searchFilters, page: number = 1) => {
    const params = new URLSearchParams();
    if (filters.query) params.set("query", filters.query);
    if (filters.kind) params.set("kind", filters.kind);
    if (filters.language) params.set("language", filters.language);
    if (filters.country) params.set("country", filters.country);
    if (filters.genre) params.set("genre", filters.genre);
    if (filters.year) params.set("year", filters.year);
    if (filters.sort) params.set("sort", filters.sort);
    if (page > 1) params.set("page", page.toString());

    const newUrl = params.toString() ? `/?${params.toString()}` : "/";
    router.push(newUrl, { scroll: false });
  };

  // Handle pagination for trending movies
  const handleTrendingPageChange = async (page: number) => {
    updateURL({}, page);
    await loadTrendingMovies(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const performSearch = async (
    filters: typeof searchFilters,
    page: number = 1,
  ) => {
    setIsLoading(true);
    try {
      let moviesData: TMDBResponse<MediaItem> | null = null;
      let tvData: TMDBResponse<MediaItem> | null = null;

      // If kind is specified, only search that type
      if (filters.kind === "movie") {
        moviesData = await searchMovies({ ...filters, page });
      } else if (filters.kind === "tv") {
        tvData = await searchTVShows({ ...filters, page });
      } else {
        // Search both if no kind specified
        [moviesData, tvData] = await Promise.all([
          searchMovies({ ...filters, page }),
          searchTVShows({ ...filters, page }),
        ]);
      }

      // Combine results
      const combinedResults: MediaItem[] = [];
      if (moviesData) {
        combinedResults.push(
          ...moviesData.results.map((item: MediaItem) => ({
            ...item,
            media_type: "movie" as const,
          })),
        );
      }
      if (tvData) {
        combinedResults.push(
          ...tvData.results.map((item: MediaItem) => ({
            ...item,
            media_type: "tv" as const,
          })),
        );
      }

      setSearchResults(combinedResults);
      // Use the maximum total pages from both results
      const maxPages = Math.max(
        moviesData?.total_pages || 0,
        tvData?.total_pages || 0,
      );
      setTotalPages(maxPages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = async (filters: typeof searchFilters) => {
    setViewMode("search");
    setSearchFilters(filters);
    updateURL(filters, 1);
    await performSearch(filters, 1);
  };

  // Handle pagination for search results
  const handleSearchPageChange = async (page: number) => {
    updateURL(searchFilters, page);
    await performSearch(searchFilters, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle reset
  const handleReset = () => {
    router.push("/");
    setViewMode("trending");
    setSearchResults([]);
    setSearchFilters({});
    setCurrentPage(1);
    loadTrendingMovies(1);
  };

  // Handle watch list view
  // const handleWatchList = () => {
  //   const items = getWatchList();
  //   // Convert WatchListItem[] to MediaItem[]
  //   const mediaItems: MediaItem[] = items.map((item) => {
  //     const { addedAt, ...mediaItem } = item;
  //     return mediaItem as MediaItem;
  //   });
  //   setWatchListItems(mediaItems);
  //   setViewMode("watchlist");
  //   setCurrentPage(1);
  //   setTotalPages(1);
  // };
  //
  // // Reload watch list when it might have changed (e.g., after adding/removing)
  // useEffect(() => {
  //   if (viewMode === "watchlist") {
  //     const items = getWatchList();
  //     const mediaItems: MediaItem[] = items.map((item) => {
  //       const { addedAt, ...mediaItem } = item;
  //       return mediaItem as MediaItem;
  //     });
  //     setWatchListItems(mediaItems);
  //   }
  // }, [viewMode]);

  const currentItems =
    viewMode === "trending"
      ? trendingMovies
      : viewMode === "watchlist"
        ? watchListItems
        : searchResults;
  const handlePageChange =
    viewMode === "trending"
      ? handleTrendingPageChange
      : viewMode === "watchlist"
        ? () => {} // Watch list doesn't need pagination
        : handleSearchPageChange;

  const [oldViewMode, setOldViewMode] = useState<ViewMode>(viewMode);
  const [isSearch, setSearch] = useState(false);
  // const watchListItems = getWatchList();
  useEffect(() => {
    setWatchListItems(getWatchList());
  }, []);

  return (
    <>
      <Header
        onClickWatchList={() => {
          // Toggle old
          if (viewMode === "watchlist") {
            setViewMode(oldViewMode);
          } else {
            setOldViewMode(viewMode);
            setViewMode("watchlist");
          }
        }}
        onClickSearch={() => setSearch(!isSearch)}
      />
      <div className="min-h-screen bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <MobileTip />

          {/*<div className="mb-4">*/}
          {/*  <button*/}
          {/*    onClick={handleWatchList}*/}
          {/*    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${*/}
          {/*      viewMode === "watchlist"*/}
          {/*        ? "bg-green-600 text-white hover:bg-green-700"*/}
          {/*        : "bg-gray-700 text-gray-300 hover:bg-gray-600"*/}
          {/*    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900`}*/}
          {/*  >*/}
          {/*    My Watch List*/}
          {/*  </button>*/}
          {/*</div>*/}

          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              isSearch
                ? "mb-6 max-h-[2000px] opacity-100"
                : "mb-0 max-h-0 opacity-0"
            }`}
          >
            <SearchComponent
              onSearch={handleSearch}
              onReset={handleReset}
              initialFilters={searchFilters}
            />
          </div>

          <div>
            {viewMode === "trending" && (
              <h2 className="mb-4 text-xl font-semibold text-gray-200">
                Trending movies this week
              </h2>
            )}
            {viewMode === "search" && (
              <h2 className="mb-4 text-xl font-semibold text-gray-200">
                Search Results -{" "}
                {searchFilters.kind === "tv" ? "TV shows" : "Movies"}
                {(searchFilters.query ?? "") !== ""
                  ? ` with title "${searchFilters.query}" `
                  : ""}
              </h2>
            )}
            {viewMode === "watchlist" && (
              <h2 className="mb-4 text-xl font-semibold text-gray-200">
                My Watch List ({watchListItems.length}{" "}
                {watchListItems.length === 1 ? "item" : "items"})
              </h2>
            )}

            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                viewMode !== "watchlist" ? "opacity-100 relative" : "opacity-0 absolute"
              }`}
            >
              <MediaGrid
                items={currentItems}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isLoading={isLoading}
              />
            </div>
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                viewMode === "watchlist" ? "opacity-100 relative" : "opacity-0 absolute"
              }`}
            >
              <MediaGrid
                items={watchListItems}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isLoading={false}
              />
            </div>
            {/*{viewMode !== "watchlist" && (*/}
            {/*)}*/}

            {/*{viewMode === "watchlist" && (*/}
            {/*)}*/}
          </div>
        </div>
      </div>
    </>
  );
}

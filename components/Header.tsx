"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  onClickWatchList: () => void;
  onClickSearch: () => void;
};

export default function Header({ onClickWatchList, onClickSearch }: Props) {
  const router = useRouter();

  const [viewMode, setViewMode] = useState("");
  const [isSearch, setSearch] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/75">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex justify-start items-center">
            <button
              onClick={() => router.push("/")}
              className=" uppercase text-2xl font-bold text-green-200 hover:text-blue-400 transition-colors cursor-pointer"
            >
              <img width="150" src="/logo3.png" alt="Logo" />
            </button>

            <p className="hidden md:block">because watching should be simple</p>
          </div>
          <div className=" flex items-center justify-end gap-4">
            <button
              onClick={() => {
                setSearch(!isSearch);
                onClickSearch();
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isSearch
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900`}
            >
              {isSearch ? "Close Search" : "Search"}
            </button>
            <button
              onClick={() => {
                setViewMode(viewMode === "watchlist" ? "" : "watchlist");
                onClickWatchList();
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === "watchlist"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900`}
            >
              My Watch List
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

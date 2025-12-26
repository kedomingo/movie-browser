"use client";

import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/75">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="text-2xl font-bold text-white hover:text-blue-400 transition-colors cursor-pointer"
          >
            Pira Movies & TV
          </button>
          <a
            href="https://ko-fi.com/pppira"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
          >
              <img src="/coffee.png" width="24"/>
            <span>Buy me a coffee</span>
          </a>
        </div>
      </div>
    </header>
  );
}


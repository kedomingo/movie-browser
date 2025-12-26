"use client";

import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/75">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.push("/")}
          className="text-2xl font-bold text-white hover:text-blue-400 transition-colors"
        >
          Pira Movies & TV
        </button>
      </div>
    </header>
  );
}


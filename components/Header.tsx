"use client";

import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/75">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="font-serif  uppercase text-2xl font-bold text-green-200 hover:text-blue-400 transition-colors cursor-pointer"
          >
            <img width="150" src="/logo3.png" alt="Logo" />
          </button>
        </div>
      </div>
    </header>
  );
}


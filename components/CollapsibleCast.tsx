"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

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

interface CollapsibleCastProps {
  cast: CastMember[];
}

export default function CollapsibleCast({ cast }: CollapsibleCastProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint in Tailwind
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Filter to only acting roles and get top 10
  const actingCast = cast
    .filter((member) => member.known_for_department === "Acting")
    .slice(0, 10);

  // On mobile: show first 2 when collapsed, all when expanded
  // On desktop: always show all
  const visibleCast = isMobile && !isExpanded ? actingCast.slice(0, 2) : actingCast;

  if (actingCast.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-2xl font-bold text-white">Top 10 Cast</h2>
      <div className="relative">
        <div
          className={`grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 transition-all duration-300 ${
            isExpanded ? "max-h-none" : "max-h-[20rem] overflow-hidden"
          }`}
        >
          {visibleCast.map((member: CastMember) => (
              <div
                key={member.id}
                className="relative flex flex-col items-center gap-2"
              >
                {isMobile && !isExpanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent pointer-events-none" />
                )}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://www.google.com/search?udm=2&q=${encodeURIComponent(member.name)}`}
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
              </a>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">
                  {member.name}
                </p>
                <p className="text-xs text-gray-400">{member.character}</p>
              </div>
            </div>
          ))}
        </div>
        {isMobile && !isExpanded && actingCast.length > 2 && (
          <div className="mt-4 flex items-center justify-center">
            <button
              onClick={() => setIsExpanded(true)}
              className="text-sm text-white hover:text-blue-300 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
            >
              Show more
            </button>
          </div>
        )}
        {isMobile && isExpanded && actingCast.length > 2 && (
          <div className="mt-4 flex items-center justify-center">
            <button
              onClick={() => setIsExpanded(false)}
              className="text-sm text-blue-400 hover:text-blue-300 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
            >
              Show less
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

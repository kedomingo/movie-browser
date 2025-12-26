"use client";

import { useRouter } from "next/navigation";

interface GenreBadgeProps {
  id: number;
  name: string;
  mediaType: "movie" | "tv";
}

export default function GenreBadge({ id, name, mediaType }: GenreBadgeProps) {
  const router = useRouter();

  const handleClick = () => {
    const params = new URLSearchParams();
    params.set("kind", mediaType);
    params.set("genre", id.toString());
    router.push(`/?${params.toString()}`);
  };

  return (
    <button
      onClick={handleClick}
      className="rounded-full bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 transition-colors cursor-pointer"
    >
      {name}
    </button>
  );
}


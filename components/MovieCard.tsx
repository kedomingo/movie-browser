"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { MediaItem } from "@/types/tmdb";
import { getImageUrl } from "@/lib/tmdb";
import { slugify } from "@/lib/utils";

interface MovieCardProps {
  item: MediaItem;
  kind?: "movie" | "tv";
}

export default function MovieCard({ item, kind }: MovieCardProps) {
  const router = useRouter();
  const title = "title" in item ? item.title : item.name;

  if (typeof title === "undefined") {
    return "problem" + JSON.stringify(item);
  }

  const date = "release_date" in item ? item.release_date : item.first_air_date;
  const year = date ? new Date(date).getFullYear() : "N/A";
  const mediaType = kind ?? ("title" in item ? "movie" : "tv");
  const voteAverage = item.vote_average?.toFixed(1) || "N/A";
  const slug = slugify(title);

  const handleClick = () => {
    router.push(`/${mediaType}/${item.id}-${slug}`);
  };

  return (
    <div className="flex flex-col gap-2 cursor-pointer" onClick={handleClick}>
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-gray-700">
        <Image
          src={getImageUrl(item.poster_path)}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-100">
          {title}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {year} ({item.original_language})
          </p>
          <div className="flex items-center gap-1">
            <span className="text-xs text-yellow-400">★</span>
            <span className="text-xs text-gray-300">{voteAverage}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

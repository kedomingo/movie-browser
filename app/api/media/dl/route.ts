import { deobfuscateId } from "@/lib/tmdb-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mediaType = searchParams.get("type") as "movie" | "tv" | null;
  const encryptedId = searchParams.get("id");

  const seasonId = searchParams.get("seasonId");
  const episodeId = searchParams.get("episodeId");
  const mediaName = searchParams.get("mediaName");
  const language = searchParams.get("language");

  if (!mediaType || !encryptedId) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 },
    );
  }

  try {
    // Deobfuscate the ID
    const realId = deobfuscateId(encryptedId).toString();

    let downloadUrl: string;

    if (mediaType === "movie") {
      downloadUrl = `https://dl.vidsrc.vip/movie/${realId}`;
    } else {
      if (!seasonId || !episodeId) {
        return NextResponse.json(
          { error: "Season and episode are required for TV shows" },
          { status: 400 },
        );
      }
      downloadUrl = `https://dl.vidsrc.vip/tv/${realId}/${seasonId}/${episodeId}`;
    }

    return NextResponse.json({ embedUrl: downloadUrl });
  } catch (error) {
    console.error("Error getting embed URL:", error);
    return NextResponse.json(
      {
        error: "Failed to get embed URL",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}

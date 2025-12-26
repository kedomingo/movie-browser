export type MediaProvider =
  | "vidsrc"
  | "vidsrc2"
  | "vidsrcxyz"
  | "vidsrcpro"
  | "flicky"
  | "flickyanime"
  | "embedsoap"
  | "autoembed"
  | "smashystream"
  | "anime"
  | "2animesub"
  | "2embed"
  | "nontonGo"
  | "nontonGoAlt"
  | "AdminHiHi"
  | "vidlink"
  | "vidlinkdub"
  | "vidsrcnl"
  | "vidsrc.rip"
  | "vidbinge"
  | "moviesapi"
  | "moviee"
  | "multiembed"
  | "multiembedvip"
  | "embedsu"
  | "vidsrcicu"
  | "filmxy"
  | "cinescrape";

export const OK_PROVIDERS: Set<MediaProvider> = new Set([
    "vidsrcxyz",
    "vidsrc",
    "vidlink",
    "vidsrcicu",
    "autoembed",
    "2embed",
    "smashystream",
    "multiembed",
])

export const MOVIE_PROVIDERS: MediaProvider[] = [
    "vidsrcxyz",
    "vidsrc",
    "vidlink",
    "vidsrcicu",
    "autoembed",
    "2embed",
    "smashystream",
    "multiembed",
  "vidsrc2",
  "flicky",
  "embedsoap",
  "anime",
  "2animesub",
  "nontonGo",
  "AdminHiHi",
  "vidlinkdub",
  "vidsrcnl",
  "vidsrc.rip",
  "vidbinge",
  "moviesapi",
  "moviee",
  "embedsu",
  "multiembedvip",
  "filmxy",
  "cinescrape",
];

export const TV_PROVIDERS: MediaProvider[] = [
    "vidsrcxyz",
    "vidsrc",
    "vidlink",
    "vidsrcicu",
    "autoembed",
    "2embed",
    "smashystream",
    "multiembed",
  "flicky",
  "flickyanime",
  "embedsoap",
  "anime",
  "nontonGo",
  "nontonGoAlt",
  "2animesub",
  "AdminHiHi",
  "moviesapi",
  "vidlinkdub",
  "vidsrcnl",
  "vidsrc.rip",
  "vidbinge",
  "moviee",
  "multiembedvip",
  "embedsu",
  "cinescrape",
];

export async function getMovieEmbedUrl(
  mediaId: string,
  provider: MediaProvider,
  language?: string | null
): Promise<string> {
  const primaryColor = "#FFFFFF";
  const secondaryColor = "#FFFFFF";
  const iconColor = "#FFFFFF";

  switch (provider) {
    case "vidsrc":
      return `https://vidsrc.cc/v2/embed/movie/${mediaId}?autoPlay=true`;
    case "vidsrc2":
      return `https://vidsrc2.to/embed/movie/${mediaId}`;
    case "filmxy": {
      if (!language) {
        throw new Error("Language is required for filmxy provider");
      }
      const languageCode = language.toLowerCase();
      const url = `https://cinescrape.com/global/${languageCode}/${mediaId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      const filmxyData = await response.json();
      const m3u8Link = filmxyData.streamData.data.link;
      if (!m3u8Link) throw new Error("No m3u8 link found");
      return m3u8Link;
    }
    case "vidsrcxyz":
      return `https://vidsrc.xyz/embed/movie/${mediaId}`;
    case "flicky":
      return `https://flicky.host/embed/movie/?id=${mediaId}`;
    case "embedsoap":
      return `https://www.embedsoap.com/embed/movie/?id=${mediaId}`;
    case "autoembed":
      return `https://player.autoembed.cc/embed/movie/${mediaId}`;
    case "smashystream":
      return `https://player.smashy.stream/movie/${mediaId}`;
    case "anime":
      return `https://anime.autoembed.cc/embed/${mediaId}-episode-1`;
    case "2animesub":
      return `https://2anime.xyz/embed/${mediaId}-episode-1`;
    case "2embed":
      return `https://www.2embed.cc/embed/${mediaId}`;
    case "nontonGo":
      return `https://www.NontonGo.win/embed/movie/${mediaId}`;
    case "AdminHiHi":
      const movieSlug = mediaId.replace(/\s+/g, "-");
      return `https://embed.anicdn.top/v/${movieSlug}-dub/1.html`;
    case "vidlink":
      return `https://vidlink.pro/movie/${mediaId}?primaryColor=${primaryColor}&secondaryColor=${secondaryColor}&iconColor=${iconColor}&autoplay=false`;
    case "vidlinkdub":
      return `https://vidlink.pro/movie/${mediaId}?player=jw&multiLang=true&primaryColor=${primaryColor}&secondaryColor=${secondaryColor}&iconColor=${iconColor}`;
    case "vidsrcnl":
      return `https://player.vidsrc.nl/embed/movie/${mediaId}`;
    case "vidsrc.rip":
      return `https://vidsrc.rip/embed/movie/${mediaId}`;
    case "vidbinge":
      return `https://vidbinge.dev/embed/movie/${mediaId}`;
    case "moviesapi":
      return `https://moviesapi.club/movie/${mediaId}`;
    case "moviee":
      return `https://moviee.tv/embed/movie/${mediaId}`;
    case "multiembed":
      return `https://multiembed.mov/?video_id=${mediaId}&tmdb=1`;
    case "embedsu":
      return `https://embed.su/embed/movie/${mediaId}`;
    case "multiembedvip":
      return `https://multiembed.mov/directstream.php?video_id=${mediaId}&tmdb=1`;
    case "vidsrcicu":
      return `https://vidsrc.icu/embed/movie/${mediaId}`;
    case "cinescrape": {
      const randomDelay = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;
      await new Promise((resolve) => setTimeout(resolve, randomDelay));

      const cinescrapeResponse = await fetch(
        `https://scraper.cinescrape.com/movie/${mediaId}`
      );
      if (!cinescrapeResponse.ok)
        throw new Error("Network response was not ok");
      const responseData = await cinescrapeResponse.json();

      const cinescrapeData = responseData.data;

      const movieSource = cinescrapeData.find(
        (source: any) => source.quality === "2160p" || source.quality === "1080p"
      );

      if (movieSource && movieSource.metadata && movieSource.metadata.baseUrl) {
        let streamUrl = movieSource.metadata.baseUrl + ".mpd";

        const urlObj = new URL(streamUrl);
        urlObj.protocol = "https:";
        streamUrl = urlObj.toString();

        return streamUrl;
      } else {
        throw new Error("No suitable 2160p or 1080p stream link found");
      }
    }
    default:
      throw new Error("Provider not recognized.");
  }
}

export async function getTvEmbedUrl(
  mediaId: string,
  seasonId: number,
  episodeId: number,
  provider: MediaProvider,
  mediaName?: string
): Promise<string> {
  const primaryColor = "#FFFFFF";
  const secondaryColor = "#FFFFFF";
  const iconColor = "#ffffff";

  switch (provider) {
    case "vidsrc":
      return `https://vidsrc.cc/v2/embed/tv/${mediaId}/${seasonId}/${episodeId}?autoPlay=true&autoNext=true`;
    case "vidsrcpro":
      return `https://vidsrc.pro/embed/tv/${mediaId}/${seasonId}/${episodeId}`;
    case "flicky":
      return `https://flicky.host/embed/tv/?id=${mediaId}/${seasonId}/${episodeId}`;
    case "flickyanime":
      return `https://flicky.host/embed/anime/?id=${mediaId}/${seasonId}/${episodeId}`;
    case "vidsrcxyz":
      return `https://vidsrc.xyz/embed/tv/${mediaId}?season=${seasonId}&episode=${episodeId}`;
    case "embedsoap":
      return `https://www.embedsoap.com/embed/tv/?id=${mediaId}&s=${seasonId}&e=${episodeId}`;
    case "autoembed":
      return `https://player.autoembed.cc/embed/tv/${mediaId}/${seasonId}/${episodeId}`;
    case "smashystream":
      return `https://player.smashy.stream/tv/${mediaId}?s=${seasonId}&e=${episodeId}`;
    case "anime":
      const animeSlug = mediaName
        ? mediaName.replace(/\s+/g, "-").toLowerCase()
        : mediaId;
      return `https://anime.autoembed.cc/embed/${animeSlug}-episode-${episodeId}`;
    case "nontonGo":
      return `https://www.NontonGo.win/embed/tv/${mediaId}/${seasonId}/${episodeId}`;
    case "nontonGoAlt":
      return `https://www.NontonGo.win/embed/tv/?id=${mediaId}&s=${seasonId}&e=${episodeId}`;
    case "2animesub":
      const animeSubSlug = mediaName
        ? mediaName.replace(/\s+/g, "-").toLowerCase()
        : mediaId;
      return `https://2anime.xyz/embed/${animeSubSlug}-episode-${episodeId}`;
    case "2embed":
      return `https://www.2embed.skin/embedtv/${mediaId}&s=${seasonId}&e=${episodeId}`;
    case "AdminHiHi":
      const tvSlug = mediaName ? mediaName.replace(/\s+/g, "-") : mediaId;
      return `https://embed.anicdn.top/v/${tvSlug}-dub/${episodeId}.html`;
    case "moviesapi":
      return `https://moviesapi.club/tv/${mediaId}/${seasonId}/${episodeId}`;
    case "vidlink":
      return `https://vidlink.pro/tv/${mediaId}/${seasonId}/${episodeId}?primaryColor=${primaryColor}&secondaryColor=${secondaryColor}&iconColor=${iconColor}&nextbutton=true&autoplay=false`;
    case "vidlinkdub":
      return `https://vidlink.pro/tv/${mediaId}/${seasonId}/${episodeId}?player=jw&multiLang=true`;
    case "vidsrcnl":
      return `https://player.vidsrc.nl/embed/tv/${mediaId}/${seasonId}/${episodeId}`;
    case "vidsrc.rip":
      return `https://vidsrc.rip/embed/tv/${mediaId}/${seasonId}/${episodeId}`;
    case "vidbinge":
      return `https://vidbinge.dev/embed/tv/${mediaId}/${seasonId}/${episodeId}`;
    case "moviee":
      return `https://moviee.tv/embed/tv/${mediaId}?seasion=${seasonId}&episode=${episodeId}`;
    case "multiembed":
      return `https://multiembed.mov/?video_id=${mediaId}&tmdb=1&s=${seasonId}&e=${episodeId}`;
    case "multiembedvip":
      return `https://multiembed.mov/directstream.php?video_id=${mediaId}&tmdb=1&s=${seasonId}&e=${episodeId}`;
    case "vidsrcicu":
      return `https://vidsrc.icu/embed/tv/${mediaId}/${seasonId}/${episodeId}`;
    case "embedsu":
      return `https://embed.su/embed/tv/${mediaId}/${seasonId}/${episodeId}`;
    case "cinescrape":
      const randomDelay = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;
      await new Promise((resolve) => setTimeout(resolve, randomDelay));

      const response = await fetch(
        `https://scraper.cinescrape.com/tvshow/${mediaId}/${seasonId}/${episodeId}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();

      if (!data || data.length === 0)
        throw new Error("No video data available");

      const qualityOrder = ["2160p", "1080p", "720p", "360p"];
      let selectedSource = null;

      for (const quality of qualityOrder) {
        selectedSource = data.find((source: any) => source.quality === quality);
        if (selectedSource) break;
      }

      if (
        selectedSource &&
        selectedSource.metadata &&
        selectedSource.metadata.baseUrl
      ) {
        let streamUrl = selectedSource.metadata.baseUrl + ".mpd";

        const urlObj = new URL(streamUrl);
        urlObj.protocol = "https:";
        streamUrl = urlObj.toString();

        return streamUrl;
      } else {
        throw new Error("No suitable video source found");
      }
    default:
      throw new Error("Provider not recognized.");
  }
}


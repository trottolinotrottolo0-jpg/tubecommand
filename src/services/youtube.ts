const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE = "https://www.googleapis.com/youtube/v3";

export interface ChannelStats {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  subscribers: number;
  views: number;
  videoCount: number;
  handle: string;
}

export interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
  publishedAt: string;
  duration: string;
}

export interface SearchResult {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  publishedAt: string;
  viewCount?: number;
}

async function get(endpoint: string, params: Record<string, string>) {
  const url = new URL(`${BASE}/${endpoint}`);
  url.searchParams.set("key", API_KEY);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "YouTube API error");
  }
  return res.json();
}

export async function getChannelByHandle(handle: string): Promise<ChannelStats> {
  // Try forHandle first (new API)
  const data = await get("channels", {
    part: "snippet,statistics",
    forHandle: handle.replace("@", ""),
    maxResults: "1",
  });
  if (!data.items?.length) throw new Error(`Channel not found: ${handle}`);
  const ch = data.items[0];
  return {
    id: ch.id,
    handle,
    title: ch.snippet.title,
    description: ch.snippet.description,
    thumbnail: ch.snippet.thumbnails?.medium?.url || ch.snippet.thumbnails?.default?.url,
    subscribers: parseInt(ch.statistics.subscriberCount || "0"),
    views: parseInt(ch.statistics.viewCount || "0"),
    videoCount: parseInt(ch.statistics.videoCount || "0"),
  };
}

export async function getChannelVideos(channelId: string, maxResults = 20): Promise<VideoItem[]> {
  // Try uploads playlist first
  try {
    const chData = await get("channels", {
      part: "contentDetails",
      id: channelId,
    });
    const uploadsId = chData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (uploadsId) {
      const plData = await get("playlistItems", {
        part: "snippet",
        playlistId: uploadsId,
        maxResults: String(maxResults),
      });

      if (plData.items?.length) {
        const videoIds = plData.items.map((i: any) => i.snippet.resourceId.videoId).join(",");
        const statsData = await get("videos", {
          part: "statistics,contentDetails,snippet",
          id: videoIds,
        });
        return statsData.items.map((v: any) => ({
          id: v.id,
          title: v.snippet.title,
          thumbnail: v.snippet.thumbnails?.medium?.url || v.snippet.thumbnails?.default?.url,
          views: parseInt(v.statistics.viewCount || "0"),
          likes: parseInt(v.statistics.likeCount || "0"),
          comments: parseInt(v.statistics.commentCount || "0"),
          publishedAt: v.snippet.publishedAt,
          duration: v.contentDetails.duration,
        }));
      }
    }
  } catch {
    // fall through to search fallback
  }

  // Fallback: search videos by channelId
  const searchData = await get("search", {
    part: "snippet",
    channelId,
    type: "video",
    order: "date",
    maxResults: String(maxResults),
  });

  if (!searchData.items?.length) return [];

  const videoIds = searchData.items.map((i: any) => i.id.videoId).join(",");
  const statsData = await get("videos", {
    part: "statistics,contentDetails,snippet",
    id: videoIds,
  });

  return statsData.items.map((v: any) => ({
    id: v.id,
    title: v.snippet.title,
    thumbnail: v.snippet.thumbnails?.medium?.url || v.snippet.thumbnails?.default?.url,
    views: parseInt(v.statistics.viewCount || "0"),
    likes: parseInt(v.statistics.likeCount || "0"),
    comments: parseInt(v.statistics.commentCount || "0"),
    publishedAt: v.snippet.publishedAt,
    duration: v.contentDetails?.duration || "",
  }));
}

export async function searchYouTube(
  query: string,
  maxResults = 10,
  options: { videoDuration?: "short" | "medium" | "long"; order?: "viewCount" | "date" | "relevance"; channelId?: string } = {}
): Promise<SearchResult[]> {
  const params: Record<string, string> = {
    part: "snippet",
    q: query,
    type: "video",
    order: options.order || "viewCount",
    maxResults: String(maxResults),
  };
  if (options.videoDuration) params.videoDuration = options.videoDuration;
  if (options.channelId) params.channelId = options.channelId;

  const data = await get("search", params);

  const videoIds = data.items.map((i: any) => i.id.videoId).join(",");
  let viewMap: Record<string, number> = {};
  if (videoIds) {
    const statsData = await get("videos", { part: "statistics", id: videoIds });
    statsData.items.forEach((v: any) => {
      viewMap[v.id] = parseInt(v.statistics.viewCount || "0");
    });
  }

  return data.items.map((i: any) => ({
    id: i.id.videoId,
    title: i.snippet.title,
    channelTitle: i.snippet.channelTitle,
    thumbnail: i.snippet.thumbnails?.medium?.url,
    publishedAt: i.snippet.publishedAt,
    viewCount: viewMap[i.id.videoId] || 0,
  }));
}

export async function getCompetitorChannel(handle: string) {
  return getChannelByHandle(handle);
}

export async function getTrendingVideos(regionCode = "IT", categoryId?: string): Promise<VideoItem[]> {
  const params: Record<string, string> = {
    part: "snippet,statistics",
    chart: "mostPopular",
    regionCode,
    maxResults: "20",
  };
  if (categoryId) params.videoCategoryId = categoryId;
  const data = await get("videos", params);
  return data.items.map((v: any) => ({
    id: v.id,
    title: v.snippet.title,
    thumbnail: v.snippet.thumbnails?.medium?.url,
    views: parseInt(v.statistics.viewCount || "0"),
    likes: parseInt(v.statistics.likeCount || "0"),
    comments: parseInt(v.statistics.commentCount || "0"),
    publishedAt: v.snippet.publishedAt,
    duration: v.contentDetails?.duration || "",
  }));
}

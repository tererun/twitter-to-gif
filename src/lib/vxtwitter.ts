import type { VXTwitterResponse } from "@/types/vxtwitter";

export function extractTweetId(url: string): string | null {
  const patterns = [
    /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/,
    /(?:vxtwitter\.com|fxtwitter\.com)\/\w+\/status\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

export async function fetchTweetInfo(
  tweetUrl: string
): Promise<VXTwitterResponse> {
  const tweetId = extractTweetId(tweetUrl);
  if (!tweetId) {
    throw new Error("Invalid tweet URL");
  }

  const apiUrl = `https://api.vxtwitter.com/Twitter/status/${tweetId}`;
  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch tweet: ${response.statusText}`);
  }

  return response.json();
}

export function getVideoMedia(response: VXTwitterResponse) {
  return response.media_extended.filter((media) => media.type === "video");
}

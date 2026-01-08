export interface MediaSize {
  width: number;
  height: number;
}

export interface MediaExtended {
  altText?: string;
  duration_millis?: number;
  size: MediaSize;
  thumbnail_url: string;
  type: "image" | "video";
  url: string;
}

export interface VXTwitterResponse {
  date: string;
  date_epoch: number;
  hashtags: string[];
  likes: number;
  mediaURLs: string[];
  media_extended: MediaExtended[];
  replies: number;
  retweets: number;
  text: string;
  tweetID: string;
  tweetURL: string;
  user_name: string;
  user_screen_name: string;
}

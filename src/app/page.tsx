"use client";

import { useState, useRef, useCallback } from "react";
import { fetchTweetInfo, getVideoMedia } from "@/lib/vxtwitter";
import { convertVideoToGif, downloadBlob } from "@/lib/gif-converter";
import {
  StepIndicator,
  Timeline,
  MediaSelector,
  VideoPreview,
  Confetti,
} from "@/components";
import type { MediaExtended } from "@/types/vxtwitter";

type Status = "idle" | "loading" | "converting" | "done" | "error";
type Step = 1 | 2 | 3;

const STEP_TITLES = ["Enter Tweet URL", "Edit & Convert", "Download"];
const THUMBNAIL_COUNT = 10;

export default function Home() {
  const [tweetUrl, setTweetUrl] = useState("");
  const [media, setMedia] = useState<MediaExtended[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaExtended | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [gifBlob, setGifBlob] = useState<Blob | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFetchTweet = async () => {
    if (!tweetUrl.trim()) return;

    setStatus("loading");
    setError("");
    setMedia([]);
    setSelectedMedia(null);
    setGifBlob(null);

    try {
      const tweetInfo = await fetchTweetInfo(tweetUrl);
      const videoMedia = getVideoMedia(tweetInfo);

      if (videoMedia.length === 0) {
        setError("No video or GIF found in this tweet");
        setStatus("error");
        return;
      }

      setMedia(videoMedia);
      if (videoMedia.length === 1) {
        setSelectedMedia(videoMedia[0]);
        setStartTime(0);
        const dur = videoMedia[0].duration_millis
          ? videoMedia[0].duration_millis / 1000
          : 10;
        setEndTime(dur);
        setDuration(dur);
      }
      setStatus("idle");
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tweet");
      setStatus("error");
    }
  };

  const handleSelectMedia = (m: MediaExtended) => {
    setSelectedMedia(m);
    setStartTime(0);
    const dur = m.duration_millis ? m.duration_millis / 1000 : 10;
    setEndTime(dur);
    setDuration(dur);
    setThumbnails([]);
    setGifBlob(null);
  };

  const generateThumbnails = useCallback(
    async (video: HTMLVideoElement, dur: number) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const thumbs: string[] = [];

      const scale = 100 / video.videoWidth;
      canvas.width = 100;
      canvas.height = Math.floor(video.videoHeight * scale);

      for (let i = 0; i < THUMBNAIL_COUNT; i++) {
        const time = (dur / THUMBNAIL_COUNT) * i;
        video.currentTime = time;
        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            video.removeEventListener("seeked", onSeeked);
            resolve();
          };
          video.addEventListener("seeked", onSeeked);
        });
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        thumbs.push(canvas.toDataURL("image/jpeg", 0.5));
      }

      video.currentTime = 0;
      setThumbnails(thumbs);
    },
    []
  );

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      if (dur && isFinite(dur)) {
        setDuration(dur);
        setEndTime(dur);
        generateThumbnails(videoRef.current, dur);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (videoRef.current) {
      if (!videoRef.current.paused) {
        videoRef.current.pause();
      }
      videoRef.current.currentTime = time;
    }
  };

  const getProxyUrl = (url: string) => {
    return `/api/proxy?url=${encodeURIComponent(url)}`;
  };

  const handleConvert = async () => {
    if (!selectedMedia) return;

    setStatus("converting");
    setProgress(0);
    setGifBlob(null);

    try {
      const proxyUrl = getProxyUrl(selectedMedia.url);
      const blob = await convertVideoToGif(proxyUrl, {
        startTime: startTime > 0 ? startTime : undefined,
        endTime: endTime > 0 ? endTime : undefined,
        maxWidth: Math.min(selectedMedia.size.width, 480),
        fps: 10,
        onProgress: (p) => setProgress(Math.round(p * 100)),
      });

      setGifBlob(blob);
      setStatus("done");
      setStep(3);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert");
      setStatus("error");
    }
  };

  const handleReset = () => {
    setTweetUrl("");
    setMedia([]);
    setSelectedMedia(null);
    setStatus("idle");
    setError("");
    setProgress(0);
    setStartTime(0);
    setEndTime(0);
    setDuration(0);
    setCurrentTime(0);
    setThumbnails([]);
    setGifBlob(null);
    setStep(1);
  };

  const handleDownload = () => {
    if (gifBlob) {
      const timestamp = Date.now();
      downloadBlob(gifBlob, `tweet-${timestamp}.gif`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      {showConfetti && <Confetti />}

      <main className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">
          Twitter to GIF
        </h1>

        <StepIndicator currentStep={step} titles={STEP_TITLES} />

        {error && (
          <div className="p-4 mb-6 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Step 1: URL Input */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={tweetUrl}
                onChange={(e) => setTweetUrl(e.target.value)}
                placeholder="https://twitter.com/user/status/123456789"
                className="flex-1 px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === "Enter" && handleFetchTweet()}
              />
              <button
                onClick={handleFetchTweet}
                disabled={status === "loading"}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "loading" ? "Loading..." : "Fetch"}
              </button>
            </div>
            <p className="text-sm text-zinc-500">
              Paste a Twitter/X URL containing a video or GIF
            </p>
          </div>
        )}

        {/* Step 2: Edit & Convert */}
        {step === 2 && (
          <div className="space-y-6">
            <MediaSelector
              media={media}
              selectedMedia={selectedMedia}
              onSelect={handleSelectMedia}
            />

            {selectedMedia && (
              <>
                <VideoPreview
                  ref={videoRef}
                  src={getProxyUrl(selectedMedia.url)}
                  onLoadedMetadata={handleVideoLoaded}
                  onTimeUpdate={handleTimeUpdate}
                />

                <Timeline
                  thumbnails={thumbnails}
                  duration={duration}
                  currentTime={currentTime}
                  startTime={startTime}
                  endTime={endTime}
                  onStartTimeChange={setStartTime}
                  onEndTimeChange={setEndTime}
                  onSeek={handleSeek}
                />

                {status === "converting" && (
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="px-4 py-3 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConvert}
                    disabled={status === "converting"}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === "converting"
                      ? `Converting... ${progress}%`
                      : "Convert to GIF"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 3: Result */}
        {step === 3 && gifBlob && (
          <div className="space-y-6">
            <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src={URL.createObjectURL(gifBlob)}
                alt="Generated GIF"
                className="max-w-full max-h-full object-contain"
              />
            </div>

            <div className="text-center text-sm text-zinc-400">
              {(gifBlob.size / 1024).toFixed(0)} KB
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-3 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                New GIF
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Download GIF
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

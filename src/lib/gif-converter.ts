import GIFEncoder from "gif-encoder-2";

export interface ConvertOptions {
  startTime?: number;
  endTime?: number;
  maxWidth?: number;
  fps?: number;
  onProgress?: (progress: number) => void;
}

export async function convertVideoToGif(
  videoUrl: string,
  options: ConvertOptions = {}
): Promise<Blob> {
  const { startTime = 0, endTime, maxWidth = 480, fps = 10, onProgress } = options;

  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = async () => {
      try {
        const duration = endTime ?? video.duration;
        const totalFrames = Math.floor((duration - startTime) * fps);
        
        const scale = Math.min(1, maxWidth / video.videoWidth);
        const width = Math.floor(video.videoWidth * scale);
        const height = Math.floor(video.videoHeight * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;

        const encoder = new GIFEncoder(width, height, "neuquant", true);
        encoder.setDelay(1000 / fps);
        encoder.start();

        video.currentTime = startTime;
        await waitForSeek(video);

        let frameCount = 0;
        const frameInterval = 1 / fps;

        while (video.currentTime < duration && frameCount < totalFrames) {
          ctx.drawImage(video, 0, 0, width, height);
          encoder.addFrame(ctx);
          
          frameCount++;
          if (onProgress) {
            onProgress(frameCount / totalFrames);
          }

          video.currentTime += frameInterval;
          await waitForSeek(video);
        }

        encoder.finish();
        const buffer = encoder.out.getData();
        resolve(new Blob([new Uint8Array(buffer)], { type: "image/gif" }));
      } catch (err) {
        reject(err);
      }
    };

    video.onerror = () => reject(new Error("Failed to load video"));
    video.src = videoUrl;
  });
}

function waitForSeek(video: HTMLVideoElement): Promise<void> {
  return new Promise((resolve) => {
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      resolve();
    };
    video.addEventListener("seeked", onSeeked);
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

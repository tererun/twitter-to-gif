"use client";

import { forwardRef } from "react";

type Props = {
  src: string;
  onLoadedMetadata: () => void;
  onTimeUpdate: () => void;
};

export const VideoPreview = forwardRef<HTMLVideoElement, Props>(
  function VideoPreview({ src, onLoadedMetadata, onTimeUpdate }, ref) {
    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
        <video
          ref={ref}
          src={src}
          controls
          onLoadedMetadata={onLoadedMetadata}
          onTimeUpdate={onTimeUpdate}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    );
  }
);

"use client";

import { useRef, useEffect } from "react";

type Props = {
  thumbnails: string[];
  duration: number;
  currentTime: number;
  startTime: number;
  endTime: number;
  onStartTimeChange: (time: number) => void;
  onEndTimeChange: (time: number) => void;
  onSeek: (time: number) => void;
};

export function Timeline({
  thumbnails,
  duration,
  currentTime,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  onSeek,
}: Props) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<"start" | "end" | "playhead" | null>(null);
  const startTimeRef = useRef(startTime);
  const endTimeRef = useRef(endTime);

  startTimeRef.current = startTime;
  endTimeRef.current = endTime;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !timelineRef.current || duration === 0)
        return;

      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const clampedX = Math.max(0, Math.min(x, rect.width));
      const time = (clampedX / rect.width) * duration;

      if (isDraggingRef.current === "start") {
        const newStart = Math.max(0, Math.min(time, endTimeRef.current - 0.1));
        onStartTimeChange(newStart);
        onSeek(newStart);
      } else if (isDraggingRef.current === "end") {
        const newEnd = Math.min(duration, Math.max(time, startTimeRef.current + 0.1));
        onEndTimeChange(newEnd);
        onSeek(newEnd);
      } else if (isDraggingRef.current === "playhead") {
        const clampedTime = Math.max(startTimeRef.current, Math.min(time, endTimeRef.current));
        onSeek(clampedTime);
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [duration, onStartTimeChange, onEndTimeChange, onSeek]);

  const handleMouseDown = (e: React.MouseEvent, type: "start" | "end") => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = type;
  };

  const handleTimelineMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!timelineRef.current || duration === 0) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clampedX = Math.max(0, Math.min(x, rect.width));
    const time = (clampedX / rect.width) * duration;

    const clampedTime = Math.max(startTimeRef.current, Math.min(time, endTimeRef.current));
    onSeek(clampedTime);
    isDraggingRef.current = "playhead";
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-zinc-500">
        <span>{startTime.toFixed(2)}s</span>
        <span>{endTime.toFixed(2)}s</span>
      </div>

      <div
        ref={timelineRef}
        className="relative h-16 bg-zinc-900 rounded-lg overflow-hidden select-none cursor-pointer"
        onMouseDown={handleTimelineMouseDown}
      >
        {/* Thumbnail strip */}
        <div className="absolute inset-0 flex">
          {thumbnails.length > 0 ? (
            thumbnails.map((thumb, i) => (
              <div key={i} className="flex-1 h-full">
                <img
                  src={thumb}
                  alt=""
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
            ))
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
              Loading thumbnails...
            </div>
          )}
        </div>

        {/* Darkened areas */}
        <div
          className="absolute inset-y-0 left-0 bg-black/60"
          style={{ width: `${(startTime / duration) * 100}%` }}
        />
        <div
          className="absolute inset-y-0 right-0 bg-black/60"
          style={{ width: `${((duration - endTime) / duration) * 100}%` }}
        />

        {/* Selection box */}
        <div
          className="absolute inset-y-0 border-2 border-yellow-400 box-border"
          style={{
            left: `${(startTime / duration) * 100}%`,
            right: `${((duration - endTime) / duration) * 100}%`,
          }}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-3 -ml-1.5 cursor-ew-resize flex items-center justify-center"
            onMouseDown={(e) => handleMouseDown(e, "start")}
          >
            <div className="w-2 h-8 bg-yellow-400 rounded-full" />
          </div>
          <div
            className="absolute right-0 top-0 bottom-0 w-3 -mr-1.5 cursor-ew-resize flex items-center justify-center"
            onMouseDown={(e) => handleMouseDown(e, "end")}
          >
            <div className="w-2 h-8 bg-yellow-400 rounded-full" />
          </div>
        </div>

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full" />
        </div>
      </div>

      <div className="text-center text-sm text-zinc-400">
        Selection: {(endTime - startTime).toFixed(2)}s / Total:{" "}
        {duration.toFixed(2)}s
      </div>
    </div>
  );
}

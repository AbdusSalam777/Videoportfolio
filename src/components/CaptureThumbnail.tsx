"use client";

import { useRef, useState } from "react";

/**
 * Lets the admin scrub a video and grab the exact frame they want as a
 * thumbnail, instead of ffmpeg's automatic first-second grab. Capture happens
 * entirely in the browser (canvas snapshot of the paused frame) — nothing is
 * uploaded until "Use this frame" is pressed.
 */
export default function CaptureThumbnail({
  videoSrc,
  onCapture,
}: {
  videoSrc: string;
  onCapture: (blob: Blob) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [capturing, setCapturing] = useState(false);
  const [captured, setCaptured] = useState(false);

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const t = Number(e.target.value);
    setTime(t);
    if (videoRef.current) videoRef.current.currentTime = t;
  }

  function handleCapture() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    setCapturing(true);

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        setCapturing(false);
        if (blob) {
          onCapture(blob);
          setCaptured(true);
          setTimeout(() => setCaptured(false), 2000);
        }
      },
      "image/jpeg",
      0.9
    );
  }

  return (
    <div className="space-y-2 rounded-md border border-neutral-800 bg-neutral-950 p-3">
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        playsInline
        preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        className="w-full rounded bg-black"
      />
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.01}
        value={time}
        onChange={handleSeek}
        disabled={!duration}
        className="w-full accent-white"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-500">
          {duration ? `${time.toFixed(1)}s / ${duration.toFixed(1)}s` : "Loading…"}
        </span>
        <button
          type="button"
          onClick={handleCapture}
          disabled={!duration || capturing}
          className="rounded-full bg-white px-4 py-1.5 text-xs font-medium text-black disabled:opacity-50"
        >
          {captured ? "Captured ✓" : capturing ? "Capturing…" : "Use this frame"}
        </button>
      </div>
    </div>
  );
}

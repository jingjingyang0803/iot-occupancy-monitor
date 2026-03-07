import { useMemo, useState } from "react";

export default function VideoPanel() {
  const [showVideo, setShowVideo] = useState(false);
  const [loading, setLoading] = useState(false);

  const host = window.location.hostname;
  const videoUrl = useMemo(() => `http://${host}:5000/video`, [host]);

  const startUrl = useMemo(() => `http://${host}:5000/video/start`, [host]);

  const stopUrl = useMemo(() => `http://${host}:5000/video/stop`, [host]);

  async function handleStart() {
    try {
      setLoading(true);
      await fetch(startUrl, { method: "POST" });
      setShowVideo(true);
    } catch (error) {
      console.error("Failed to start video preview:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStop() {
    try {
      setLoading(true);
      await fetch(stopUrl, { method: "POST" });
      setShowVideo(false);
    } catch (error) {
      console.error("Failed to stop video preview:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button onClick={handleStart} disabled={loading || showVideo}>
          {loading && !showVideo ? "Starting..." : "Start Camera"}
        </button>

        <button onClick={handleStop} disabled={loading || !showVideo}>
          {loading && showVideo ? "Stopping..." : "Stop Camera"}
        </button>

        <span className="subtle">
          Video preview is optional and disabled by default.
        </span>
      </div>

      {showVideo ? (
        <div style={{ marginTop: 16 }}>
          <img
            src={videoUrl}
            alt="Live camera preview"
            style={{
              width: "100%",
              maxWidth: 720,
              borderRadius: 12,
              display: "block",
            }}
          />
        </div>
      ) : (
        <div className="subtle" style={{ marginTop: 16 }}>
          Camera preview is off.
        </div>
      )}
    </div>
  );
}

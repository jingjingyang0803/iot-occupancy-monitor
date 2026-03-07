import { useState } from "react";

export default function VideoPanel() {
  const [showVideo, setShowVideo] = useState(false);
  const VIDEO_URL = `http://${window.location.hostname}:5000/video`;

  return (
    <div>
      <button onClick={() => setShowVideo(!showVideo)}>
        {showVideo ? "Stop Camera" : "Start Camera"}
      </button>

      {showVideo && (
        <div style={{ marginTop: "10px" }}>
          <img
            src={VIDEO_URL}
            alt="Live camera stream"
            style={{ width: "100%", maxWidth: "640px", borderRadius: "8px" }}
          />
        </div>
      )}
    </div>
  );
}

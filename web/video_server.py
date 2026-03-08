from flask import Flask, Response, jsonify
from flask_cors import CORS
import threading
import time
import cv2


class VideoState:
    def __init__(self):
        self.enabled = False
        self.latest_frame = None
        self.lock = threading.Lock()

    def set_enabled(self, enabled: bool):
        with self.lock:
            self.enabled = enabled

    def get_enabled(self) -> bool:
        with self.lock:
            return self.enabled

    def update_frame(self, frame):
        with self.lock:
            self.latest_frame = frame.copy()

    def get_frame(self):
        with self.lock:
            if self.latest_frame is None:
                return None
            return self.latest_frame.copy()


def create_video_app(state: VideoState) -> Flask:
    app = Flask(__name__)
    CORS(app)

    @app.get("/video/status")
    def video_status():
        return jsonify({"enabled": state.get_enabled()})

    @app.post("/video/start")
    def video_start():
        state.set_enabled(True)
        return jsonify({"ok": True, "enabled": True})

    @app.post("/video/stop")
    def video_stop():
        state.set_enabled(False)
        return jsonify({"ok": True, "enabled": False})

    @app.get("/video")
    def video_feed():
        def generate():
            while True:
                if not state.get_enabled():
                    print("video stream: disabled")
                    time.sleep(0.2)
                    continue

                frame = state.get_frame()
                if frame is None:
                    print("video stream: no frame yet")
                    time.sleep(0.05)
                    continue

                print("video stream: got frame", frame.shape, frame.dtype)

                try:
                    frame_bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
                except Exception as e:
                    print("video stream: cvtColor failed:", e)
                    time.sleep(0.05)
                    continue

                ok, buffer = cv2.imencode(
                    ".jpg",
                    frame_bgr,
                    [int(cv2.IMWRITE_JPEG_QUALITY), 70],
                )
                if not ok:
                    print("video stream: jpeg encode failed")
                    time.sleep(0.05)
                    continue

                jpg_bytes = buffer.tobytes()
                print("video stream: sending jpeg", len(jpg_bytes))

                yield (
                    b"--frame\r\n"
                    b"Content-Type: image/jpeg\r\n\r\n" + jpg_bytes + b"\r\n"
                )

                time.sleep(0.08)

        return Response(
            generate(),
            mimetype="multipart/x-mixed-replace; boundary=frame",
        )

    return app


def run_video_server(state: VideoState, host="0.0.0.0", port=5000):
    app = create_video_app(state)
    app.run(host=host, port=port, threaded=True)
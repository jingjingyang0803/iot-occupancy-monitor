// MQTT uses public broker
export const MQTT_URL = "wss://broker.hivemq.com:8884/mqtt";
export const MQTT_TOPIC = "people_counting/data";

// Pi backend (video stream)
export const BACKEND_HOST = "10.26.173.71";

export const VIDEO_PORT = 5000;

export const VIDEO_URL = `http://${BACKEND_HOST}:${VIDEO_PORT}/video`;
export const VIDEO_START_URL = `http://${BACKEND_HOST}:${VIDEO_PORT}/video/start`;
export const VIDEO_STOP_URL = `http://${BACKEND_HOST}:${VIDEO_PORT}/video/stop`;

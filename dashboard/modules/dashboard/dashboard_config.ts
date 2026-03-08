// https://www.hivemq.com/demos/websocket-client/
// Host: broker.hivemq.com
// Port: 8884
// SSL: ✔
// const MQTT_URL = "wss://broker.hivemq.com:8884/mqtt";

// <raspberry-pi-ip> should be replaced with the actual IP address of your Raspberry Pi on the local network. You can find this IP address by running ifconfig (Linux/Mac) or ipconfig (Windows) in the terminal of your Raspberry Pi.
// export const BACKEND_HOST = "<raspberry-pi-ip>";
export const BACKEND_HOST = "192.168.1.187";

export const MQTT_PORT = 9001;
export const VIDEO_PORT = 5000;

export const MQTT_TOPIC = "people_counting/data";

export const MQTT_URL = `ws://${BACKEND_HOST}:${MQTT_PORT}`;
export const VIDEO_URL = `http://${BACKEND_HOST}:${VIDEO_PORT}/video`;
export const VIDEO_START_URL = `http://${BACKEND_HOST}:${VIDEO_PORT}/video/start`;
export const VIDEO_STOP_URL = `http://${BACKEND_HOST}:${VIDEO_PORT}/video/stop`;

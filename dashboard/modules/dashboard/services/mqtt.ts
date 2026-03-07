import mqtt from "mqtt";
import type { LiveTelemetryMessage } from "../types";

// https://www.hivemq.com/demos/websocket-client/
// Host: broker.hivemq.com
// Port: 8884
// SSL: ✔
// const MQTT_URL = "wss://broker.hivemq.com:8884/mqtt";

const MQTT_URL = "ws://192.168.1.187:9001";
const MQTT_TOPIC = "people_counting/data";

export function subscribeToLiveTelemetry(
  onMessage: (msg: LiveTelemetryMessage) => void,
  onStatusChange?: (
    status: "connecting" | "connected" | "error" | "closed",
  ) => void,
) {
  onStatusChange?.("connecting");
  console.log("Connecting to:", MQTT_URL);

  const client = mqtt.connect(MQTT_URL, {
    protocolVersion: 4,
    reconnectPeriod: 5000,
    connectTimeout: 10000,
    clean: true,
    clientId: `dashboard_${Math.random().toString(16).slice(2, 10)}`,
  });

  client.on("connect", () => {
    console.log("Connected to MQTT broker");
    onStatusChange?.("connected");

    client.subscribe(MQTT_TOPIC, (err) => {
      if (err) {
        console.error("Subscribe error:", err);
        onStatusChange?.("error");
      } else {
        console.log("Subscribed to:", MQTT_TOPIC);
      }
    });
  });

  client.on("message", (topic, payload) => {
    console.log("Raw MQTT message:", topic, String(payload));
    try {
      const parsed = JSON.parse(String(payload)) as LiveTelemetryMessage;
      onMessage(parsed);
    } catch (error) {
      console.error("Invalid MQTT message:", error);
    }
  });

  client.on("error", (err) => {
    console.error("MQTT error:", err);
    onStatusChange?.("error");
  });

  client.on("close", () => {
    console.log("MQTT connection closed");
    onStatusChange?.("closed");
  });

  return () => {
    client.end(true);
  };
}

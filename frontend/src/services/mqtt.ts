import mqtt from "mqtt";
import type { LiveTelemetryMessage } from "../types/types";
import { MQTT_URL, MQTT_TOPIC } from "../config/dashboard_config";

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

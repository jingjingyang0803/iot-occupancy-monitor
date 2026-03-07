import type { LiveDashboardState, LiveTelemetryMessage } from "../types";

export function normalizeLiveTelemetry(
  msg: LiveTelemetryMessage,
): LiveDashboardState {
  const peopleIn = msg.people_in ?? 0;
  const peopleOut = msg.people_out ?? 0;
  const derivedOccupancy = peopleIn - peopleOut;

  return {
    timestamp: msg.timestamp ?? new Date().toISOString(),

    deviceId: msg.device_id ?? "unknown",
    zoneName: msg.zone ?? "unknown",

    peopleIn,
    peopleOut,
    occupancy: derivedOccupancy,

    fps: msg.fps ?? null,
    cpu: msg.cpu ?? null,
    cpuTemp: msg.cpu_temp ?? null,

    motionScore: msg.motion_score ?? null,
    brightness: msg.brightness ?? null,

    density: msg.density ?? null,
    densityLevel: msg.density_level ?? null,
  };
}

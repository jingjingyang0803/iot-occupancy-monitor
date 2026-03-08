import { useEffect, useMemo, useState } from "react";
import { subscribeToLiveTelemetry } from "../services/mqtt";
import { normalizeLiveTelemetry } from "../services/normalize";
import type { LiveDashboardState, LiveTelemetryMessage } from "../types/types";
import KpiCard from "../components/KpiCard";

type ConnectionStatus = "connecting" | "connected" | "error" | "closed";

const MAX_POINTS = 24;

function formatTime(ts?: string) {
  if (!ts) return "--";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatNumber(value: number | null | undefined, digits = 2) {
  if (value == null) return "--";
  return value.toFixed(digits);
}

export default function BusinessDashboard() {
  const [current, setCurrent] = useState<LiveDashboardState | null>(null);
  const [history, setHistory] = useState<LiveDashboardState[]>([]);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");

  useEffect(() => {
    const unsubscribe = subscribeToLiveTelemetry(
      (msg: LiveTelemetryMessage) => {
        const normalized = normalizeLiveTelemetry(msg);
        setCurrent(normalized);
        setHistory((prev) => [...prev.slice(-(MAX_POINTS - 1)), normalized]);
      },
      setConnectionStatus,
    );

    return unsubscribe;
  }, []);

  const occupancy = current?.occupancy ?? 0;

  const status = useMemo(() => {
    if (!current) return "Waiting";
    if (current.densityLevel === "high") return "High activity";
    if (current.densityLevel === "medium") return "Moderate activity";
    return "Low activity";
  }, [current]);

  const statusVariant: "normal" | "busy" | "over" =
    status === "Low activity"
      ? "normal"
      : status === "Moderate activity"
        ? "busy"
        : "over";

  const peakOccupancy = history.reduce(
    (max, item) => Math.max(max, item.occupancy),
    occupancy,
  );

  const totalIn = current?.peopleIn ?? 0;
  const totalOut = current?.peopleOut ?? 0;

  return (
    <>
      <section className="panel meta">
        <div>
          <b>Zone:</b> {current?.zoneName ?? "--"} · <b>Last update:</b>{" "}
          {formatTime(current?.timestamp)}
        </div>
        <div className="subtle">
          Entrance flow business view · MQTT: {connectionStatus}
        </div>
      </section>

      <section className="grid">
        <KpiCard
          title="Current occupancy"
          value={occupancy}
          subtitle="Derived from total IN - total OUT"
        />
        <KpiCard
          title="Activity level"
          value={status}
          subtitle={`Density level: ${current?.densityLevel ?? "--"}`}
          variant={statusVariant}
        />
        <KpiCard
          title="Peak occupancy"
          value={peakOccupancy}
          subtitle="Recent live window"
        />
        <KpiCard
          title="Density"
          value={formatNumber(current?.density, 3)}
          subtitle="Relative activity indicator"
        />
        <KpiCard title="People IN" value={totalIn} />
        <KpiCard title="People OUT" value={totalOut} />
      </section>

      <section className="section">
        <h2 className="h2">Live KPI trend</h2>
        <div
          className="panel"
          style={{
            padding: 20,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            {history.slice(-8).map((item, idx) => (
              <div
                key={`${item.timestamp}-${idx}`}
                style={{
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div className="subtle" style={{ marginBottom: 8 }}>
                  {formatTime(item.timestamp)}
                </div>
                <div>
                  <b>Occ:</b> {item.occupancy}
                </div>
                <div>
                  <b>Density:</b> {formatNumber(item.density, 3)}
                </div>
                <div>
                  <b>Status:</b> {item.densityLevel ?? "--"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="h2">Current business interpretation</h2>
        <div className="panel" style={{ padding: 20 }}>
          <p style={{ margin: 0 }}>
            The monitored entrance currently shows an estimated occupancy of{" "}
            <b>{occupancy}</b>, reconstructed from cumulative entry and exit
            counts. The present scene activity is <b>{status}</b>, with a
            relative density value of <b>{formatNumber(current?.density, 3)}</b>
            .
          </p>
        </div>
      </section>
    </>
  );
}

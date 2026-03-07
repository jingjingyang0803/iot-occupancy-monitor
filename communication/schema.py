from __future__ import annotations

from datetime import datetime, timezone
from typing import Dict, Any


def build_payload(
    device_id: str,
    zone: str,
    people_in: int,
    people_out: int,
    fps: float,
    cpu: float,
) -> Dict[str, Any]:
    """
    Build base telemetry payload for MQTT publishing.

    Additional fields (motion_score, brightness, density, etc.)
    can be appended by the caller before publishing.
    """

    return {
        "device_id": device_id,
        "timestamp": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "zone": zone,

        "people_in": people_in,
        "people_out": people_out,

        "fps": fps,
        "cpu": cpu,
    }
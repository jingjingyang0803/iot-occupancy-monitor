# Smart People Counting IoT System

**Group 5**

[Hassan Abidi](https://moodle.tuni.fi/user/view.php?id=132503&course=50447)

[Deepan Adaikkalam](https://moodle.tuni.fi/user/view.php?id=157478&course=50447)

[Sheikh Jubaer](https://moodle.tuni.fi/user/view.php?id=134528&course=50447)

[Jingjing Yang](https://moodle.tuni.fi/user/view.php?id=61071&course=50447)

# 1. Prototype Overview

### 1.1 Goal

The goal of this project is to develop a prototype of an **IoT-based people counting system** capable of estimating pedestrian flow at an entrance using **edge video analysis**.

The system uses a **Raspberry Pi with a camera module** to detect when people enter or leave a monitored area. Instead of transmitting raw video streams, the device performs **edge processing** and publishes summarized telemetry data through an IoT messaging protocol.

The transmitted data includes measurements such as:

- number of people entering (`people_in`)
- number of people leaving (`people_out`)
- motion intensity
- brightness
- device telemetry (CPU usage, temperature, FPS)

A dashboard running on another device subscribes to this data and calculates the **current occupancy** as well as visualizes the system status in real time.

The prototype demonstrates how **IoT sensing, edge analytics, networking, and visualization** can be integrated into a distributed monitoring system.

# 2. Physical Architecture

## 2.1 System Components

The prototype consists of the following components.

### Edge device

- Raspberry Pi 3 Model B+
- Raspberry Pi Camera Module V2

The edge device performs sensing and local processing.

### Network

- WiFi local network (802.11)

### Messaging system

- MQTT messaging protocol
- Mosquitto MQTT broker

### User interface

- Web dashboard running on a laptop or PC

## 2.2 High-Level Architecture

System pipeline:

```
Pi Camera
   ↓
Raspberry Pi
(Video Capture + Detection + Counting)
   ↓
Edge Application (Python)
   ├─ MQTT Telemetry Publisher
   └─ Optional Video Preview Server
   ↓
Mosquitto MQTT Broker
   ↓
MQTT over WebSocket
   ↓
Web Dashboard
(Visualization + Occupancy Calculation)
```

Component roles:

| Component                 | Role                                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| Pi Camera Module V2       | Captures image frames from the monitored entrance                                         |
| Raspberry Pi              | Runs the edge application performing video capture, motion detection, and people counting |
| Edge Application (Python) | Processes frames, generates telemetry, and publishes MQTT messages                        |
| Mosquitto MQTT Broker     | Routes telemetry messages between publishers and subscribers                              |
| Web Dashboard             | Subscribes to MQTT data, calculates occupancy, and visualizes system status               |

This architecture demonstrates a **typical IoT system where edge devices publish sensor data and applications subscribe to it through a messaging broker.**

## 2.3 Hardware Architecture

```
        +---------------------+
        |   Pi Camera V2      |
        +----------+----------+
                   |
                   v
        +---------------------+
        | Raspberry Pi        |
        | Edge Processing     |
        | - Motion Detection  |
        | - People Counting   |
        +----------+----------+
                   |
           MQTT Publish
                   |
                   v
        +---------------------+
        | Mosquitto Broker    |
        +----------+----------+
                   |
        MQTT over WebSocket
                   |
                   v
        +---------------------+
        | Web Dashboard       |
        | Real-time Monitor   |
        +---------------------+
```

## 2.4 Software Architecture

### Components

The software system is organized into several modular components responsible for sensing, processing, communication, storage, and visualization.

```
camera/
   capture.py
   camera_stream.py

processing/
   people_counter.py
   motion_detection.py

communication/
   mqtt_client.py
   schema.py

storage/
   jsonl_logger.py

analytics/
   hourly_summary.py
   daily_summary.py

web/
   video_server.py

dashboard/
   React-based web dashboard
```

### Module Responsibilities

| Module        | Responsibility                                  |
| ------------- | ----------------------------------------------- |
| camera        | Captures frames from the Raspberry Pi camera    |
| processing    | Performs motion detection and people counting   |
| communication | Publishes telemetry data to the MQTT broker     |
| storage       | Stores raw telemetry logs on the edge device    |
| analytics     | Computes aggregated hourly and daily statistics |
| web           | Provides an optional video preview server       |
| dashboard     | Visualizes telemetry data and system status     |

# 3. System Operation

## 3.1 Intended Functionality

The system operates as follows:

1. The camera continuously captures frames from the monitored entrance.
2. The Raspberry Pi processes frames locally using lightweight computer vision methods.
3. Crossing events are detected and converted into measurements:
   - `people_in`
   - `people_out`
4. Additional telemetry measurements are collected:
   - motion intensity
   - brightness
   - CPU usage
   - CPU temperature
   - processing frame rate (FPS)
5. Measurements are formatted into JSON telemetry messages.
6. The Raspberry Pi publishes messages to the MQTT broker.
7. The dashboard subscribes to MQTT topics.
8. The dashboard updates the visualization and calculates occupancy.

## 3.2 Occupancy Calculation

The Raspberry Pi publishes **entry and exit events**, while the dashboard calculates the current occupancy.

Occupancy is computed as:

```
occupancy = total_people_in − total_people_out
```

This design separates **event detection from state computation**.

Advantages include:

- simpler edge device logic
- easier debugging
- possibility to recompute occupancy from historical data
- easier scaling to multiple sensors

# 4. Sensors and Measuring

The prototype uses two categories of sensors.

1. Vision sensor (camera)
2. Device telemetry sensors

## 4.1 Vision Sensor — Raspberry Pi Camera Module V2

### Phenomenon Measured

The camera captures **light intensity patterns** which are interpreted as image frames.

These frames are analyzed to infer:

- people entering
- people leaving
- motion intensity
- brightness level

The camera therefore acts as the **primary sensing device** in the prototype.

### Measurement Frequency

Prototype configuration:

- resolution: 640 × 480
- frame rate: approximately 30 FPS

For real deployments, a lower frame rate such as **5–10 FPS** could often provide sufficient responsiveness while reducing computational load.

### Sensor Specifications

Camera module specifications:

- Sony IMX219 CMOS sensor
- 8 megapixel resolution
- up to 1080p video
- CSI-2 camera interface

### Limitations

Several limitations affect measurement accuracy:

- poor lighting conditions
- occlusion when multiple people overlap
- computational limitations on the Raspberry Pi

Despite these limitations, the camera provides sufficiently rich information for estimating pedestrian movement.

## 4.2 Device Telemetry Sensors

The Raspberry Pi provides internal telemetry information about system performance.

Measured values include:

- CPU usage
- CPU temperature
- frame processing rate (FPS)

These measurements help verify that the system can operate in real time.

### Sampling Frequency

Telemetry is sampled approximately **once per second**.

In real deployments, slower monitoring intervals such as **10–30 seconds** would often be sufficient.

# 5. Network Communication

## 5.1 Communicating Components

The following components exchange data:

- Raspberry Pi → MQTT broker
- MQTT broker → dashboard client

The goal is to transmit sensor data from the edge device to another device for visualization and analysis.

## 5.2 Data Model

Telemetry messages are encoded in JSON format.

Example message:

```json
{
  "device_id": "pi-01",
  "timestamp": "2026-03-08T00:29:34+00:00",
  "zone": "main_entrance",
  "people_in": 0,
  "people_out": 0,
  "fps": 29.9,
  "cpu": 53.5,
  "cpu_temp": 67.68,
  "motion_score": 0.0,
  "brightness": 0.238,
  "density": 0.0,
  "density_level": "low"
}
```

JSON was chosen because it is:

- human readable
- easy to extend
- widely supported in web applications.

## 5.3 Data Volume

Typical message size:

- approximately **150–200 bytes**

Publishing frequency:

- once per second

Estimated daily traffic:

- approximately **15–20 MB per day**

## 5.4 Possible Data Reduction Methods

Several techniques could reduce network usage:

- lower publish frequency
- event-driven publishing
- aggregated statistics
- binary message encoding (CBOR or MessagePack)

# 6. IoT Protocol — MQTT

The system uses **MQTT** as the IoT messaging protocol.

Roles in the MQTT architecture:

| Component        | Role           |
| ---------------- | -------------- |
| Raspberry Pi     | publisher      |
| Mosquitto broker | message router |
| dashboard        | subscriber     |

Example topic structure:

```
people_counter/pi-01/data
people_counter/pi-01/status
people_counter/pi-01/logs
```

This topic design allows multiple devices to be added easily by changing the device identifier.

# 7. IoT Radio Connection

The prototype uses **WiFi (IEEE 802.11)**.

Reasons for choosing WiFi:

- built-in connectivity on the Raspberry Pi
- easy integration with IP networking
- compatibility with MQTT infrastructure

## Limitations of WiFi

Compared to other IoT radio technologies, WiFi has several disadvantages:

- higher power consumption
- potential congestion in crowded networks

However, for this prototype the limitations are acceptable because the Raspberry Pi is **not battery-powered** and operates in a controlled environment.

# 8. Data Analysis

The prototype includes **edge-based data analysis**.

A lightweight computer vision pipeline converts image frames into high-level events.

Processing steps include:

1. frame capture
2. region-of-interest selection
3. motion detection
4. crossing detection
5. event generation

The goal is to transform raw visual information into meaningful IoT measurements.

# 9. Visualization

A web dashboard subscribes to MQTT topics and visualizes data in real time.

Displayed information includes:

- number of people entering
- number of people leaving
- estimated occupancy
- brightness
- motion intensity
- CPU usage
- CPU temperature
- frame rate
- crowd status indicator

The dashboard enables users to quickly understand both **environment activity and device performance**.

For debugging and demonstration purposes, the dashboard also provides an **optional live camera preview window**.
This preview stream is served directly from the Raspberry Pi via a lightweight HTTP video server.
The preview feature can be enabled when needed to verify camera placement and detection behavior, but it is **not required for normal system operation**, as the system primarily relies on telemetry messages rather than transmitting raw video.

# 10. Decision Making and Actuation

The prototype includes a simple **rule-based status classification mechanism** implemented in the dashboard.

The system derives a **density level indicator** from the motion activity detected in the camera scene.

This indicator is used to determine the current crowd status.

Example rule used in the dashboard:

```
if density_level == "high":
    status = "Busy"
elif density_level == "medium":
    status = "Warning"
else:
    status = "Normal"
```

The density level is computed from the motion activity detected in the region of interest and included in the telemetry message.

In this prototype the actuation is **visual feedback on the dashboard**, where the system status is displayed using indicators such as:

- **Normal**
- **Warning**
- **Busy**

In real-world deployments, similar decision mechanisms could trigger automated responses such as:

- alerts to building managers
- notifications to security personnel
- dynamic access control
- integration with building automation systems.

# 11. Hardware Platform

## Raspberry Pi 3 Model B+

Key specifications:

- CPU: Quad-core ARM Cortex-A53 (1.2 GHz)
- RAM: 1 GB
- Connectivity: WiFi, Ethernet, Bluetooth
- Camera interface: CSI
- Operating system: Linux (Raspberry Pi OS)

## Features Used in the Prototype

The prototype uses several hardware features:

- CSI camera interface
- onboard CPU for video processing
- WiFi connectivity
- Linux-based software environment

## Memory Usage Estimate

Approximate memory usage during operation:

| Component                   | Estimated RAM |
| --------------------------- | ------------- |
| Raspberry Pi OS             | ~300 MB       |
| Python processing program   | ~100–150 MB   |
| MQTT libraries and services | ~20–50 MB     |

Total estimated usage:

**450–500 MB**

This is well within the **1 GB memory available on the Raspberry Pi 3**.

# 12. Value of the Prototype

The prototype demonstrates several key IoT concepts:

- edge computing
- sensor data transformation
- IoT messaging protocols
- distributed system architecture
- real-time monitoring

The system illustrates how **raw sensor data can be converted into meaningful measurements directly on edge devices**, reducing bandwidth usage and improving responsiveness.

Potential applications include:

- retail traffic analytics
- building occupancy monitoring
- smart facility management
- safety monitoring in public spaces

# 13. Limitations of the Prototype

Although the prototype demonstrates the concept, it falls short of a production-level system.

Key limitations include:

### Detection accuracy

The current counting method is relatively simple and may be affected by:

- lighting changes
- overlapping people
- fast movement.

More advanced machine learning models could improve accuracy.

### Scalability

The system currently supports a single device and dashboard.

Large deployments would require:

- device management
- centralized data storage
- scalable cloud infrastructure.

### Reliability

The prototype lacks several production features:

- long-term stability testing
- automatic fault recovery
- secure authentication mechanisms.

## Security Considerations

- MQTT authentication
- TLS encryption
- secure device provisioning
- access control for dashboards

# 14. Design Decisions and Problems Encountered

Several design choices were made during development.

### Edge processing

Processing was performed on the Raspberry Pi to avoid transmitting raw video streams, which would require significantly more bandwidth.

Edge processing was chosen to reduce network bandwidth usage and improve response time.

Instead of transmitting raw video streams, the Raspberry Pi extracts relevant events and publishes compact telemetry messages.

Benefits include:

- reduced network traffic
- improved privacy
- lower latency
- scalable architecture

### Lower resolution video

Resolution was reduced to **640×480** to maintain real-time performance on the Raspberry Pi.

### Issues encountered

During development several challenges were encountered:

-
-
-
-
-

Different frame rates and processing parameters were tested to improve system stability.

# 15. Features Not Included

The prototype does not include:

- mesh networking between devices
- low-power IoT radios such as LoRaWAN or Zigbee
- cloud IoT platforms as the primary backend.

These features could be added in future versions.

# 16. Demo Session

Demo date: 10.03.2026

Demo time: 8:15-10:00

Location: TB219

During the demonstration the following features will be shown:

1. camera sensing and counting
2. MQTT telemetry messages
3. dashboard visualization updates
4. crowd status changes when occupancy exceeds a threshold

### Dashboard Screenshot

<placeholder>

---

# 17. Code Repository

The source code of the prototype is available in the following repository:

GitHub:

https://github.com/jingjingyang0803/Smart-People-Counting-Pi-IoT

---

# 18. Personal Learning Reflections

Each student provides an individual reflection discussing:

- prior experience with IoT prototyping
- personal learning goals
- contributions to the project
- lessons learned during development

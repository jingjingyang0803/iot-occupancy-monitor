# Smart People Counting IoT System

## 1 Project Overview

This repository implements a modular **IoT-based people counting system** using a **Raspberry Pi camera** and lightweight edge video analytics.

The system captures live video, performs **on-device processing**, and converts visual information into structured telemetry data. The data is transmitted through **MQTT** and visualized in a real-time web dashboard.

The project demonstrates how a camera can function as an **IoT sensing device**, enabling edge computing and real-time monitoring.

### Key Objectives

- Edge-based people counting on resource-constrained hardware
- Modular IoT system architecture
- Real-time telemetry transmission using MQTT
- Visualization through a web dashboard
- Performance evaluation on embedded devices

# 2 System Pipeline

The system follows a typical **edge-to-dashboard IoT pipeline**.

```
Camera (Sensor)
   ↓
Edge Processing (Raspberry Pi)
   ↓
MQTT Communication
   ↓
Web Dashboard
```

- The **Raspberry Pi** performs video capture and analytics.
- The **dashboard** subscribes to MQTT telemetry streams and visualizes system status.

# 3 Core Application: People Counting

The system estimates:

- Number of people **entering**
- Number of people **leaving**
- Current **occupancy**
- **Motion intensity**
- **Environmental brightness**

All processing runs directly on the **edge device (Raspberry Pi)** to minimize network bandwidth and support real-time operation.

# 4 Detection Method

The system uses lightweight computer vision techniques designed for **embedded hardware**.

### Motion-Based Counting Pipeline

```
Frame
 ↓
Background subtraction (OpenCV MOG2)
 ↓
Motion blob extraction
 ↓
Centroid tracking
 ↓
Line-crossing detection
 ↓
Update people_in / people_out / occupancy
```

### Detection Components

- **Background subtraction (MOG2)** for motion detection
- **ROI-based entrance monitoring**
- **Motion blob extraction** using contour detection
- **Centroid tracking**
- **Line-crossing detection** to detect entry and exit events

The system prioritizes:

- Real-time performance
- Low computational cost
- Stable telemetry generation

The goal is not maximum detection accuracy but **reliable edge analytics on constrained hardware**.

# 5 System Architecture

The repository follows a **modular architecture** that separates the edge application and the dashboard.

```
Smart-People-Counting-Pi-IoT/

backend/
  camera/            camera frame acquisition
  processing/        motion detection and counting
  communication/     MQTT messaging
  web/               optional video preview server
  config/            device configuration
  main.py            backend entry point

frontend/
  src/               dashboard source code
  public/            static assets
```

This structure enables:

- clear separation between **edge processing** and **visualization**
- easier debugging and testing
- independent frontend/backend development

# 6 Module Responsibilities

## Camera Module

Handles video acquisition from the Raspberry Pi camera.

Responsibilities:

- capture video frames
- configure resolution and frame rate
- provide frames to the processing pipeline

Output:

```
video frames
```

## Processing Module

Performs **edge video analytics** and people counting.

Responsibilities:

- motion detection using background subtraction
- motion blob extraction
- centroid tracking
- line-crossing detection
- occupancy estimation
- brightness estimation

Output:

```
structured telemetry data
```

## Communication Module

Handles **device-to-system communication** via MQTT.

Responsibilities:

- publish telemetry messages
- maintain consistent message format
- enable real-time dashboard updates

Example topic:

```
people_counting/data
```

## Web Module

Provides an optional **video preview server** for debugging and monitoring.

Features:

- start / stop video streaming
- HTTP endpoint for live preview
- integration with the dashboard

## Dashboard (Frontend)

Provides **real-time visualization of telemetry data**.

Displays:

- current occupancy
- people entering / leaving
- motion score
- brightness level
- system performance metrics

Features:

- MQTT subscription
- real-time updates
- browser-based interface

# 7 Unified Data Schema

All modules exchange data using a consistent JSON structure.

Example telemetry message:

```json
{
  "timestamp": "2026-03-06T00:25:29Z",
  "device_id": "pi-01",
  "zone": "main_entrance",
  "people_in": 34,
  "people_out": 32,
  "occupancy": 2,
  "motion_score": 0.012,
  "brightness": 0.45,
  "fps": 29.9,
  "cpu": 52.8
}
```

### Design Principles

- stable core fields
- optional fields allowed
- dashboard tolerant to missing values
- schema changes require compatibility updates

# 8 Performance Evaluation

Because the system runs on **Raspberry Pi hardware**, evaluation focuses on:

- processing **FPS**
- **CPU utilization**
- processing latency
- system stability

These metrics ensure the pipeline remains **practical for edge deployment**.

# 9 Optional Extension — YOLO-Based Detection

As a potential extension, the system can integrate **YOLO-based person detection**.

Possible approach:

- run YOLO inference at low frequency
- validate motion-based detections
- attach detection metadata to telemetry

This approach improves accuracy while preserving **real-time performance**.

# 10 Hardware & Software Stack

### Hardware

- Raspberry Pi 3 Model B+
- Raspberry Pi Camera Module
- MicroSD card
- Power supply

### Software

- Python
- OpenCV
- NumPy
- MQTT
- React + Vite dashboard

# 11 Project Deliverables

The project deliverables include:

- working **people counting system**
- real-time dashboard
- modular source code repository
- system architecture documentation
- performance evaluation report

# 12 Reproducibility

The repository is structured to allow straightforward reproduction on Raspberry Pi devices.

To run the system:

1. install system dependencies
2. clone the repository
3. install Python dependencies
4. configure the device configuration
5. run the backend pipeline

Detailed setup instructions are provided in **`SETUP.md`**.

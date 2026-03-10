# Smart People Counting IoT System

**Group 5**

[Hassan Abidi](https://moodle.tuni.fi/user/view.php?id=132503&course=50447)

[Deepan Adaikkalam](https://moodle.tuni.fi/user/view.php?id=157478&course=50447)

[Sheikh Jubaer](https://moodle.tuni.fi/user/view.php?id=134528&course=50447)

[Jingjing Yang](https://moodle.tuni.fi/user/view.php?id=61071&course=50447)

# 1. Prototype Overview

### 1.1 Goal

The objective of this project is to create a prototype for an **IoT-based people counting system** that can be used to estimate the number of people entering the scene through the entrance.

For this purpose, the system utilizes a **Raspberry Pi with a camera module** that can be used to detect the movement of people entering the scene or leaving the scene. In this case, the device is not required to send video streams; instead, it sends the summarized data using the IoT protocol.

The data being sent includes:

- The number of people entering the scene
- The number of people leaving the scene
- Motion intensity
- Brightness
- Device telemetry information such as CPU usage, temperature, and FPS

A dashboard is also used to calculate the **current occupancy** and display the state in real-time.

The proposed project is based on the concept of **IoT networking and visualization** that can be used to create a distributed system.

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
- Cloud / public MQTT broker (HiveMQ)

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
   ├─ MQTT Telemetry Publisher ──→ Public MQTT Broker (HiveMQ)
   └─ Optional Video Preview Server ──→ HTTP Video Stream
   ↓
Web Dashboard
(MQTT over WebSocket + Visualization)
```

A public MQTT broker is used in this prototype to make it easy to set up and allow the dashboard and the edge device to communicate, even if they are not connected to the same network.

**Component roles**:

| Component                   | Role                                                                                     |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| Pi Camera Module V2         | To capture images from the monitored entrance                                             |
| Raspberry Pi                | To run the application that does video capture, motion detection, and people counting    |
| Edge Application (Python)   | To process images, generate telemetry, and publish MQTT messages                         |
| Public MQTT Broker (HiveMQ) | To route messages between publishers and subscribers                                       |
| Web Dashboard               | To subscribe to MQTT messages, perform calculations, and display system status            |

This architecture represents a **typical IoT system where edge devices publish messages and applications subscribe to messages using a messaging system.**

## 2.3 Hardware Architecture

The system architecture is a typical Internet of Things architecture consisting of an edge sensing layer, a communication layer, and an application layer.

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
        | - Telemetry Output  |
        +----------+----------+
                   |
             MQTT Publish
                   |
                   v
        +---------------------+
        | Public MQTT Broker  |
        | (HiveMQ)            |
        +----------+----------+
                   |
        MQTT over WebSocket
                   |
                   v
        +---------------------+
        | Web Dashboard       |
        | Real-time Monitor   |
        | Visualization       |
        +---------------------+
```

## 2.4 Software Architecture

### Components

The software system is organized into several modular components responsible for sensing, processing, communication, storage, and visualization.

```
backend/
   camera/
      capture.py
      camera_stream.py

   processing/
      people_counter.py
      motion_detection.py

   communication/
      mqtt_client.py
      schema.py

   web/
      video_server.py

   config/
      device.json

   main.py

frontend/
   React + Vite dashboard

storage/
   local telemetry logs

analytics/
   hourly and daily summaries

deploy/
   systemd service configuration
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

The system functions as follows:

1. The camera is constantly taking pictures of the monitored entrance.
2. The Raspberry Pi is using computer vision to process the images.
3. The crossing is detected and converted into measurements:
   - `people_in`
   - `people_out`
4. Other measurements are collected:
   - motion intensity
   - brightness
   - CPU usage
   - CPU temperature
   - processing frame rate (FPS)
5. The measurements are converted into JSON telemetry messages.
6. The Raspberry Pi sends the messages to the MQTT broker.
7. The dashboard receives the MQTT messages.
8. The dashboard displays the results and calculates the occupancy.

## 3.2 Occupancy Calculation

The Raspberry Pi sends **entry and exit events**, and the dashboard keeps track of the cumulative sum to calculate the current occupancy.

The occupancy is calculated as follows:

```
occupancy(t) = Σ people_in - Σ people_out
```

The advantages of this approach are as follows:

- Easier to implement for the edge device
- Easier to debug
- Ability to recalculate the occupancy based on previous data
- Ability to easily expand to multiple sensors

# 4. Sensors and Measuring

There are two types of sensors used in the prototype.

1. Vision sensor
2. Device telemetry sensors

## 4.1 Vision Sensor — Raspberry Pi Camera Module V2

### Phenomenon Measured

The vision sensor takes images through the camera. It measures the **light intensity patterns**.

These light intensity patterns are used to determine the following:
- people entering
- people leaving
- motion intensity
- brightness level

The vision sensor is the **main sensor** used in the prototype.

### Measurement Frequency

In the prototype:
- the image resolution is set to 640 x 480
- the frame rate is set to approximately 30 FPS

However, in real-world applications, the frame rate can be adjusted to **5 to 10 FPS**.

### Sensor Specifications

The specifications of the camera module include:
- Sony IMX219 CMOS sensor
- 8-megapixel sensor
- up to 1080p video
- CSI-2 camera interface

### Limitations

There are several limitations to the vision sensor:
- poor lighting conditions
- occlusion of multiple people
- computational power of the Raspberry Pi

Despite the limitations, the vision sensor is able to provide sufficient information for the estimation of the movement of people.

## 4.2 Device Telemetry Sensors

The Raspberry Pi also provides internal telemetry data to monitor how well it is performing.

Values measured are:

- CPU usage
- CPU temperature
- frame processing rate (FPS)

These values are to ensure that it is working in real-time.

### Sampling Frequency

The sampling of telemetry data is performed **approximately once per second**.

In a live environment, it might be acceptable to have a slower sampling rate of **10-30 seconds**.

# 5. Network Communication

## 5.1 Communicating Components

The components that will be used for communication are:

- Raspberry Pi to MQTT broker
- MQTT broker to dashboard client

The components are to be used for data transfer from the edge device to another device.

## 5.2 Data Model

The data is in JSON format.

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

JSON was selected because it is:

- human readable
- extensible
- widely used in web applications.

## 5.3 Data Volume

Typical message size:

- approximately **150–200 bytes**

Publishing frequency:

- once per second

Estimated daily traffic:

- approximately **15–20 MB per day**

## 5.4 Possible Data Reduction Methods

There are several methods that can be used to reduce the data usage:

- less frequent publishings
- event-driven publishing
- aggregated statistics
- binary message encoding (e.g., CBOR or MessagePack)

# 6. IoT Protocol — MQTT

The system will utilize the **MQTT** protocol as the IoT protocol.

Components and their roles in the MQTT protocol:

| Component                   | Role           |
| --------------------------- | -------------- |
| Raspberry Pi                | Publisher      |
| Public MQTT broker (HiveMQ) | Message Router  |
| dashboard                   | Subscriber     |

Topic format example:

```
people_counting/{device_id}/data
```

This format allows multiple devices to be added easily by changing the device identifier.

# 7. IoT Radio Connection

The prototype will utilize the **WiFi (IEEE 802.11)** protocol as the IoT radio protocol to connect the Raspberry Pi to the Internet.

Reasons for selecting WiFi as the IoT radio protocol:

- connectivity is built-in on the Raspberry Pi
- WiFi is easy to integrate with the Internet protocol suite
- WiFi is compatible with MQTT protocol

## Limitations of WiFi

In comparison with other IoT radio technologies, WiFi has some disadvantages:

- High power consumption
- Possibility of network congestion

However, for this project, these are **not significant limitations** since the device is **not battery-powered** and is in a controlled environment.

# 8. Data Analysis

The proposed system will **utilize edge computing for data analysis**.

A lightweight computer vision system will take image frames and translate these into high-level events.

The process will involve the following steps:

1. Capture of frames
2. Region of interest selection
3. Detection of motion
4. Detection of crossing
5. Generation of events

The system aims to take raw computer vision data and translate it into relevant IoT data.

# 9. Visualization

A web-based dashboard will subscribe to MQTT topics and provide real-time visualization of the data.

The data visualized will include:

- Number of people entering
- Number of people leaving
- Estimated people in the area
- Brightness
- Motion intensity
- CPU usage
- CPU temperature
- Frame rate
- Crowd status

The system will provide users with a way to easily understand **both the environment and the device**.

However, for debugging and demonstration purposes, the dashboard also has an **optional live camera preview window**.
The preview stream is received directly from the Raspberry Pi using a lightweight HTTP video server.
The preview functionality is optional and can be enabled when necessary for debugging and demonstration purposes.
However, the functionality is **not required for the system's normal operation**, as the system does not use video streams in its operation.
It relies on telemetry messages instead.

# 10. Decision Making and Actuation

The prototype has a simple **rule-based status classification mechanism** implemented in the dashboard.

The system generates a **density level indicator** based on the motion activities detected in the camera scene.

The density level indicator is then used to determine the crowd status.

Example rule in the dashboard:

```
if density_level == "high":
    status = "Busy"
elif density_level == "medium":
    status = "Warning"
else:
    status = "Normal"
```

The density level is calculated based on the motion activity detected in the region of interest and is included in the telemetry message.

For the prototype, the actuation is **visual feedback on the dashboard**, displaying the system status through visual indicators like:

- **Normal**
- **Warning**
- **Busy**

These decision mechanisms can be used in real-world scenarios to implement different types of actuations, such as:

- Alerting building managers
- Alerting security personnel
- Access control
- Integrating with building automation systems

# 11. Hardware Platform

## Raspberry Pi 3 Model B+

Key specifications:

- CPU: Quad-core ARM Cortex-A53 (1.2 GHz)
- RAM: 1 GB
- Connectivity: WiFi, Ethernet, Bluetooth
- Camera interface: CSI
- Operating system: Linux (Raspberry Pi OS)

## Features Used in the Prototype

The prototype has utilized several features of the hardware used in this project:

- CSI camera interface
- CPU for video processing on board
- WiFi facility
- Linux software environment

## Memory Usage Estimate

Approximate memory usage during operation:

| Component | Tool | Measured |
| --- | --- | --- |
| Raspberry Pi OS | free -h | ~300 MB |
| Python processing pipeline | top (RES memory) | ~200 MB |
| MQTT libraries/services | top | ~20–30 MB |

Total estimated usage ≈ **500–550 MB**

This is well within the **1 GB memory available on the Raspberry Pi 4**.

# 12. Value of the Prototype

The prototype has shown several aspects of IoT technology:

- Edge computing
- Data transformation from sensor data
- IoT message protocol
- Distributed systems architecture
- Real-time monitoring

The potential benefits include how **raw sensor data can be converted into meaningful measurements directly on edge devices**. Potential applications include:

- Retail traffic analysis
- Building occupancy analysis
- Smart facility management
- Safety monitoring in public spaces

## 13. Limitations of the Prototype

The prototype proves the concept but is still far from a production-level system.

Some of its key limitations include:

### Detection accuracy

The current approach for counting is somewhat naive and can be impacted by:

- Lighting conditions changing
- Overlap of people in the image
- Fast movement of people in the image

A more sophisticated approach using machine learning can be employed for higher accuracy.

### Scalability

The current approach is only for a single device and a single dashboard.

For a large number of devices, we would need to implement:

- Device management
- Data storage solutions
- Cloud infrastructure

### Reliability

The current prototype lacks many production-level features such as:

- Stability for long periods of operation
- Ability for automatic recovery from faults
- Secure authentication mechanisms

## Security Considerations

- MQTT authentication
- TLS encryption via secure WebSockets (already in place for secure MQTT communication)
- Secure device provisioning
- Secure access control for dashboards

In this prototype, a **public MQTT broker** is used without authentication for simplicity.

In a production scenario, **it would be required to implement TLS encryption along with authentication and access control.**

# 14. Design Decisions and Problems Encountered

Design choices were made during the development process.

### Edge Processing

Processing was done on the Raspberry Pi so that raw video streams are not transmitted over the network, as this would require more bandwidth.

Edge processing was done in order to conserve network bandwidth and achieve faster response time.

Instead of sending raw video streams over the network, the Raspberry Pi does the processing and sends relevant telemetry messages.

The advantages are:

- Reduced network usage
- Improved privacy
- Reduced latency
- Scalable architecture

### Lower Resolution Video

Resolution was set at **640×480** in order to maintain real-time performance on the Raspberry Pi.

### Issues encountered

- Configuration issues were encountered in the network configuration while connecting the Raspberry Pi device to the wireless network. The Raspberry Pi device was functioning properly when connected to the home WiFi network. However, the device was not successfully connected through the mobile hotspot during development.

- Several changes were made in the architecture of the dashboard. Initially, static JSON data was implemented for the purpose of testing the dashboard. Later on, real-time data was implemented through the use of MQTT telemetry once the communication was established.

- Configuration was required for the purpose of establishing MQTT communication for the web-based dashboard. It was necessary to enable the use of the WebSocket protocol for the purpose of connecting the browser to the MQTT server because the browser does not allow connections through the default port.

- The optional video preview server required the implementation of CORS for the purpose of accessing the video stream from the Raspberry Pi device.

- To allow demonstrations to be performed over the network, the system was migrated from the local MQTT broker to the public MQTT broker (HiveMQ) so that the device and the dashboard could communicate even when they are not on the same network.

# 15. Features Not Included

The following features have not been included in the prototype:

- Mesh networking between devices
- Low-power IoT radios such as LoRaWAN and Zigbee
- Cloud IoT platforms as the backend.

# 16. Demo Session

Date and Time: 10.03.2026
Time: 8:15-10:00
Location: TB219

Note: The system was tested using the Raspberry Pi 3B, and the full pipeline was successfully implemented and tested on the device. Unfortunately, the device stopped working just prior to the demonstration. Hence, the final demonstration was carried out using the Raspberry Pi 4B.

Features that were included in the demonstration:

1. Camera sensing and counting
2. MQTT messages
3. Dashboard visualization
4. Crowd status change based on the crowd count exceeding the threshold

### Dashboard Screenshot

<placeholder>

---

# 17. Code Repository

The source code of the prototype is available in the following repository:

GitHub:

https://github.com/jingjingyang0803/Smart-People-Counting-Pi-IoT

Setup instructions for reproducing the prototype are provided in SETUP.md.

# 18. Personal Learning Reflections

Each student provides an individual reflection discussing:

- prior experience with IoT prototyping
- personal learning goals
- contributions to the project
- lessons learned during development

---

## Sheikh Jubaer

Before starting of this project, I have some experience with Python and basic computer vision concepts, especially with the help of OpenCV for image processing-related tasks. The objective during the course of this project was to gain knowledge about how computer vision can be incorporated into the IoT system and how the edge devices can perform the processing in real-time and communicate with the other devices in the system using IoT protocols.

During the course of the development of the prototype, the main focus was on the design and development of the video processing pipeline running on the edge device, which can convert the raw video frames into meaningful telemetry data that can be sent through the system. Apart from the development activities, there were some activities related to the configuration of the system and the writing of the project report.

### Main Contributions

- **Designing and implementing the Processing module**, where motion detection and people counting are performed using **Python and OpenCV** libraries.
- **Designing the edge processing pipeline** that transforms video frames into telemetry data like `people_in`, `people_out`, `motion_score`, and `brightness`.
- **Assistance in configuring the Raspberry Pi and camera system**, where any issues faced in connecting the Raspberry Pi and camera were resolved.
- **Assistance in report writing**, specifically in explaining the system architecture and the processing components.

### Lessons Learned

During this project, I learned how to develop a full-fledged IoT system, and my knowledge about using computer vision algorithms on a device like the Raspberry Pi to perform analysis while minimizing network usage was enhanced.
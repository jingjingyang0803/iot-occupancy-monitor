# Smart People Counting IoT — Setup Guide

This guide explains how to run the system.

The system has two components:

| Component | Device                    |
| --------- | ------------------------- |
| Backend   | Raspberry Pi              |
| Frontend  | Computer (Laptop/Desktop) |

# 📋 Requirements

## Hardware

- Raspberry Pi **3B+ or Raspberry Pi 4**
- Raspberry Pi Camera Module
- MicroSD card with Raspberry Pi OS
- WiFi or Ethernet connection

## Software

- Python **3.9+**
- Node.js **18+**
- npm
- Git

# 🌐 Network Requirement

Both the Raspberry Pi and the dashboard computer must be able to access the MQTT broker.

Default configuration uses a **public broker**:

```
broker.hivemq.com
```

Therefore both devices only require **internet access**.

# 1 Raspberry Pi Setup (Backend)

Run the following steps **on the Raspberry Pi**.

## 1 Clone repository

```bash
git clone https://github.com/jingjingyang0803/Smart-People-Counting-Pi-IoT.git
cd Smart-People-Counting-Pi-IoT/backend
```

## 2 Install system dependencies

```bash
sudo apt update

sudo apt install -y python3-pip python3-venv
sudo apt install -y python3-picamera2
sudo apt install -y python3-opencv
```

## 3 Verify camera

Recent Raspberry Pi OS versions automatically detect connected cameras.

List available cameras:

```bash
rpicam-hello --list-cameras
```

Test the camera preview:

```bash
rpicam-hello
```

If a preview window appears, the camera is working correctly.

## 4 Create device configuration

```bash
cp config/device.example.json config/device.json
nano config/device.json
```

Edit the configuration (e.g., device_id, zone, MQTT settings).

## 5 Create Python environment

```bash
python3 -m venv venv --system-site-packages
source venv/bin/activate
```

## 6 Install Python dependencies

```bash
pip install -r requirements.txt
```

## 7 Run backend

After completing the setup steps above, the backend can be started in two ways.

### Option 1 — Manual Run (testing and development)

```bash
source venv/bin/activate
python main.py
```

### Option 2 — Deployment (system service)

For production deployment, the backend can run automatically as a systemd service, allowing it to start when the Raspberry Pi boots.

Detailed instructions in: `deploy/README.md`

The Raspberry Pi will now:

- capture camera frames
- perform motion detection and people counting
- publish telemetry via MQTT

# 2 Dashboard Setup (Frontend)

Run these steps **on your computer**.

## 1 Clone repository

```bash
git clone https://github.com/jingjingyang0803/Smart-People-Counting-Pi-IoT.git
cd Smart-People-Counting-Pi-IoT/frontend
```

## 2 Install dependencies

```bash
npm install
```

## 3 Configure Raspberry Pi address

Edit:

```
src/config/dashboard_config.ts
```

Example:

```ts
export const BACKEND_HOST = "192.168.1.187";
```

This address is used for the **optional video preview server** running on the Raspberry Pi.

## 4 Start dashboard

```bash
npm run dev
```

Open the dashboard:

```
http://localhost:5173
```

The dashboard will connect to the MQTT broker and start receiving telemetry data.

# 3 MQTT Configuration

The backend and dashboard communicate via MQTT.

Default settings:

| Setting        | Value                  |
| -------------- | ---------------------- |
| Broker         | `broker.hivemq.com`    |
| MQTT Port      | `1883`                 |
| WebSocket Port | `8884`                 |
| Topic          | `people_counting/data` |

Backend configuration:

```
backend/communication/mqtt_client.py
```

Frontend configuration:

```
frontend/src/config/dashboard_config.ts
```

Make sure both use the **same MQTT topic**.

# 4 Verify MQTT

You can verify MQTT messages using:

```bash
mosquitto_sub -h broker.hivemq.com -t people_counting/data -v
```

If the backend is running correctly, telemetry messages will appear.

# 5 Stop System

Stop the backend:

```
CTRL + C
```

# 6 Troubleshooting

### Camera not detected

Check camera connection and run:

```
rpicam-hello --list-cameras
```

### MQTT messages not received

Verify broker configuration in:

```
backend/communication/mqtt_client.py
```

### Dashboard cannot connect

Check the Raspberry Pi IP address in:

```
frontend/src/config/dashboard_config.ts
```

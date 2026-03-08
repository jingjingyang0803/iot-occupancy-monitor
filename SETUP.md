# 🚀 Smart People Counting IoT System

Raspberry Pi–Based Edge People Counting System

This project implements a **real-time edge-based people counting system** using:

- Raspberry Pi camera
- On-device computer vision
- MQTT messaging
- Live web dashboard

The system processes video directly on the Raspberry Pi and publishes structured telemetry data via MQTT.

# 🎯 System Architecture

```
Pi Camera
   ↓
Raspberry Pi
(Video Capture + Detection + Counting)
   ↓
Edge Application (Python)
   ├─ MQTT Telemetry Publisher (port 1883)
   └─ Optional Video Preview Server (port 5000)
   ↓
Mosquitto MQTT Broker
   ↓
MQTT over WebSocket (port 9001)
   ↓
Web Dashboard
(macOS / Windows / Linux browser)
```

### The Raspberry Pi will:

- capture frames from the camera

- run lightweight people detection and counting

- compute scene activity metrics (motion, brightness, density)

- publish telemetry messages via MQTT

- optionally provide a live camera preview stream for debugging

The video preview is disabled by default and can be enabled from the dashboard when needed.

### The dashboard will:

- connect to the MQTT broker via WebSocket

- subscribe to people_counting/data

- visualize real-time telemetry from the Raspberry Pi

- display system metrics (occupancy, FPS, CPU, temperature)

- optionally show a live camera preview when the user enables it

# ⚡ Quick Start (Recommended)

The repository is designed to be reproducible on any Raspberry Pi equipped with a compatible camera module.

If you already have a Raspberry Pi with a camera attached, you can run the system with the following steps.

### 1️⃣ Clone the repository

```bash
git clone https://github.com/jingjingyang0803/Smart-People-Counting-Pi-IoT.git
cd Smart-People-Counting-Pi-IoT
```

### 2️⃣ Install system dependencies

```
sudo apt update
sudo apt install -y python3-pip python3-venv
sudo apt install -y python3-picamera2
sudo apt install -y python3-opencv
sudo apt install -y mosquitto mosquitto-clients
```

### 3️⃣ Enable MQTT WebSocket for dashboard

Start the MQTT broker:

```bash
sudo systemctl enable --now mosquitto
```

Create Mosquitto websocket configuration:

```bash
sudo nano /etc/mosquitto/conf.d/websockets.conf
```

Add:

```
listener 1883 0.0.0.0
protocol mqtt

listener 9001 0.0.0.0
protocol websockets

allow_anonymous true
```

Restart Mosquitto:

```bash
sudo systemctl restart mosquitto
```

Verify:

```bash
sudo ss -ltnp | grep mosquitto
```

You should see:

```
0.0.0.0:1883
0.0.0.0:9001
```

### 4️⃣ Create Python virtual environment

```bash
python3 -m venv venv --system-site-packages
source venv/bin/activate
```

### 5️⃣ Install Python dependencies

```bash
pip install -r requirements.txt
```

### 6️⃣ Create local device config

```
cp config/device.example.json config/device.json
nano config/device.json
```

### 7️⃣ Run the edge system

```
python main.py
```

### 8️⃣ Dashboard configuration

Update the MQTT broker address in `dashboard/modules/dashboard/dashboard_config.ts`:

```
export const BACKEND_HOST = "<raspberry-pi-ip>";
```

Example:

```
export const BACKEND_HOST = "192.168.1.187";
```

### 9️⃣ Run the dashboard

Navigate to the dashboard directory:

```
cd dashboard
```

Install dependencies:

```
npm install
```

Start the development server:

```
npm run dev
```

# 🧰 Raspberry Pi Setup

Tested on:

- Raspberry Pi 3 Model B+
- Raspberry Pi OS

### 1️⃣ Update System

```
sudo apt update
sudo apt full-upgrade -y
```

### 2️⃣ Install System Dependencies

```
sudo apt install -y python3-pip python3-venv
sudo apt install -y python3-picamera2
sudo apt install -y python3-opencv
sudo apt install -y mosquitto mosquitto-clients
```

Packages used:

| Package      | Purpose                     |
| ------------ | --------------------------- |
| python3-pip  | Python package manager      |
| python3-venv | virtual environment support |
| picamera2    | Raspberry Pi camera access  |
| OpenCV       | computer vision processing  |
| mosquitto    | MQTT message broker         |

# 📷 Camera Setup

Power off the Raspberry Pi before connecting the camera.

Connect the camera ribbon cable to the CSI port and secure the connector.

After booting the Pi, test the camera.

### List cameras

```
rpicam-hello --list-cameras
```

### Camera preview

```
rpicam-hello
```

If a preview window appears, the camera is working.

# 📸 Capture Test Image

```
rpicam-still -o test.jpg -t 1
```

Copy the image to your computer:

```
scp pi@<YOUR_PI_IP_ADDRESS>:~/test.jpg .
```

Open the image:

```
open test.jpg
```

# 📡 Live Video Streaming (Optional)

Receiver (your computer):

```
ffplay -fflags nobuffer -flags low_delay -framedrop udp://0.0.0.0:1234
```

Sender (Raspberry Pi):

```
rpicam-vid -t 0 --width 640 --height 480 --framerate 30 --inline -o udp://<YOUR_COMPUTER_IP_ADDRESS>:1234
```

# 🔗 MQTT Communication

The MQTT broker runs locally on the Raspberry Pi.

The edge system publishes telemetry to:

```
people_counting/data
```

# Allow LAN Clients to Connect

Create a mosquitto config file:

```
sudo nano /etc/mosquitto/conf.d/listener.conf
```

Add:

```
listener 1883 0.0.0.0
allow_anonymous true
```

Restart MQTT:

```
sudo systemctl restart mosquitto
```

# 🧪 Test MQTT Messages

On another machine:

```
mosquitto_sub -h <YOUR_PI_IP_ADDRESS> -t people_counting/data -v
```

Expected output:

```
{'device_id': 'pi-01', 'timestamp': '2026-03-07T22:09:56+00:00', 'zone': 'main_entrance', 'people_in': 27, 'people_out': 18, 'fps': 30.13, 'cpu': 68.8, 'cpu_temp': 56.97, 'motion_score': 0.0, 'brightness': 0.4941, 'density': 0.0, 'density_level': 'low'}
```

# 📊 Dashboard

The dashboard subscribes to MQTT and visualizes:

- occupancy
- people entering/leaving
- system status
- device performance

Run the dashboard on your computer.

```
cd dashboard
npm install
npm run dev
```

# 🤖 Optional: Auto Start on Boot

To run the system automatically when the Raspberry Pi starts.

Copy the service file:

```
sudo cp deploy/people-counting.service /etc/systemd/system/
```

Reload services:

```
sudo systemctl daemon-reload
```

Enable auto start:

```
sudo systemctl enable people-counting
```

Start service:

```
sudo systemctl start people-counting
```

Check logs:

```
journalctl -u people-counting -f
```

# 📁 Repository Structure

```
people-counting-system/

├── camera/          # Video acquisition from Raspberry Pi camera
├── processing/      # Motion detection & people counting
├── communication/   # MQTT publishing
├── storage/         # JSON logging utilities
├── analytics/       # Historical analysis and KPIs
├── shared/          # Shared data schema
├── dashboard/       # Web dashboard

├── config/          # Device configuration templates
├── deploy/          # Deployment scripts (systemd service)

├── main.py          # System entry point
├── requirements.txt
```

# 📌 Important Notes

- Camera capture must run on Raspberry Pi.
- Dashboard can run on macOS, Linux, or Windows.
- MQTT enables cross-device communication.
- Python virtual environments are recommended.

# ⭐ Design Goals

- **Edge computing** (processing on Raspberry Pi)
- **Real-time telemetry**
- **Modular architecture**
- **Easy reproducibility**
- **Low hardware requirements**

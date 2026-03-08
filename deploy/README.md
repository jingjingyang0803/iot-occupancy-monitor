# Deployment

This directory contains deployment configuration files for running the people counting system automatically on the Raspberry Pi.

Currently, it includes a **systemd service file** that allows the backend application to start automatically when the Raspberry Pi boots.

---

## people-counting.service

A `systemd` service used to run the **backend edge application (`main.py`)** as a background process.

This allows the system to start automatically when the Raspberry Pi powers on.

---

## Install the service

1. Copy the service file to the systemd directory:

   ```bash
   sudo cp people-counting.service /etc/systemd/system/
   ```

2. Reload systemd:

   ```bash
   sudo systemctl daemon-reload
   ```

3. Enable the service to start automatically on boot:

   ```bash
   sudo systemctl enable people-counting
   ```

---

## Start the service

```bash
sudo systemctl start people-counting
```

---

## Check service status

```bash
sudo systemctl status people-counting
```

---

## View logs

```bash
journalctl -u people-counting -f
```

---

## Stop the service

```bash
sudo systemctl stop people-counting
```

---

## Notes

- The service runs the backend application on the Raspberry Pi.
- Make sure all dependencies are installed before enabling the service.
- Configuration files should be set in the `backend/config` directory.
- If necessary, update the **working directory and Python path** inside `people-counting.service` to match your installation location.

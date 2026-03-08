# communication/mqtt_client.py
import json
import paho.mqtt.client as mqtt

BROKER = "broker.hivemq.com"
PORT = 1883
TOPIC = "people_counting/data"


def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"Connected to MQTT broker: {BROKER}:{PORT}")
    else:
        print(f"Failed to connect to MQTT broker, rc={rc}")


_client = mqtt.Client()
_client.on_connect = on_connect
_client.connect(BROKER, PORT, 60)
_client.loop_start()


def publish(data):
    info = _client.publish(TOPIC, json.dumps(data))
    if info.rc == mqtt.MQTT_ERR_SUCCESS:
        print("published:", data)
    else:
        print("publish failed, rc=", info.rc, "data=", data)
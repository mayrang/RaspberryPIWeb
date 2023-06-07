import paho.mqtt.client as mqtt
import json
import time
import adafruit_dht
import RPi.GPIO as GPIO
import psutil



for proc in psutil.process_iter():
    if proc.name() == "libgpiod_pulsein":
        proc.kill()
        
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)


LED1 = 23

LED2 = 24
GPIO.setup(LED1, GPIO.OUT)
GPIO.setup(LED2, GPIO.OUT)
gpio_pin = 12
GPIO.setup(gpio_pin, GPIO.OUT)


dht_device = adafruit_dht.DHT22(4)

buzzer_dict = {}
MQTT_PUB_TOPIC = 'mobile/mayrang/sensing'
MQTT_HOST = "192.168.200.151"
MQTT_PORT= 1883
MQTT_KEEPALIVE_INTERVAL = 60
MQTT_SUB_TOPIC = 'mobile/mayrang/sensing'

def get_buzzer(typeMessage):
    if(typeMessage == "1"):
        print("1")
        scale = [261, 294, 329, 349, 392, 440, 493, 523]
        list = [ 4, 4, 5, 5, 4, 4, 2, 4, 4, 2, 2, 1]
        term = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1, 0.5, 0.5, 0.5, 0.5, 1]
        p = GPIO.PWM(gpio_pin, 100)
        p.start(10)
        p.ChangeDutyCycle(90)
        for i in range(12):
            p.ChangeFrequency(scale[list[i]])
            time.sleep(term[i])
            
        p.stop()
      
    elif(typeMessage == "2"):
        print("2")
        scale = [ 261, 294, 329, 349, 392, 440, 493, 523 ]
        list = [ 0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0 ]
        term = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1,0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1]

        p = GPIO.PWM(gpio_pin, 100)
        p.start(10)
        p.ChangeDutyCycle(90)
        for i in range(14):
            p.ChangeFrequency(scale[list[i]])
            time.sleep(term[i])
            
        p.stop()


def on_message(client, userdata, message):
    global buzzer_dict
    result = str(message.payload.decode("utf-8"))
    sensing = json.loads(result)
    
    print(f"sensing {sensing}")
    if "temperatureAlarm" in sensing:
        
        sensing = json.loads(sensing);
        if sensing["temperatureAlarm"] == "1":
            buzzer_dict["temperature"] = "1"
        elif sensing["temperatureAlarm"] == "2":
            buzzer_dict["temperature"] = "2"
        if sensing["humidityAlarm"] == "1":
            buzzer_dict["humidity"] = "1"
        elif sensing["humidityAlarm"] == "2":
            buzzer_dict["humidity"] = "2"
    if "value" in sensing:
        sensing = json.loads(sensing)
        value = sensing["value"]
        if value == "temperature":
            GPIO.output(LED1, GPIO.HIGH)
            if(buzzer_dict["temperature"]):
                get_buzzer(buzzer_dict["temperature"]);
            
            return
        elif value == "humidity":
            GPIO.output(LED2, GPIO.HIGH)
            if("humidity" in buzzer_dict):
                get_buzzer(buzzer_dict["humidity"]);
            return
        else:
            print("Illegal Argument")
            return
    else:
        GPIO.output(LED1, GPIO.LOW)
        GPIO.output(LED2, GPIO.LOW)
        print("Illegal Argument")
        return
    


client = mqtt.Client()
client.on_message = on_message
client.connect(MQTT_HOST, MQTT_PORT, MQTT_KEEPALIVE_INTERVAL)
client.subscribe(MQTT_SUB_TOPIC)
client.loop_start()


try:
    while True:
        try:
            temperature = dht_device.temperature
            humidity = dht_device.humidity
            sensing = {
            "humidity": humidity,
            "temperature": temperature
            }
            value = json.dumps(sensing)
            client.publish(MQTT_PUB_TOPIC, value)
            print(value)
        except RuntimeError:
            time.sleep(2.0)
            continue;
        time.sleep(5.0)
except KeyboardInterrupt:
    print("사용자가 프로그램을 종료했습니다.")
finally:
    dht_device.exit()
    client.disconnect()

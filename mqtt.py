import mysql.connector
import paho.mqtt.client as mqttClient
from threading import Thread
import json
import time

t = 0

class Mqtt:
	def __init__(self):
		self.json_data = {}
		self.db = mysql.connector.connect(
			host="localhost",
			user="root",
			password="password",
			db="enery_current")
		mqttclient = mqttClient.Client("5268297")
		mqttclient.on_connect = self.on_connect
		mqttclient.on_message = self.on_message
		mqttclient.username_pw_set(username="",password="")
		mqttstatus = mqttclient.connect("broker.emqx.io", 1883,60)
		mqttclient.subscribe("energymeter/v1",2)
		self.t = 0
		mqttclient.loop_forever()

	def upload(self,msg):
		mqtt_msg = str(msg.payload).replace("b'", "").replace("'", "").replace("  ", "").replace("\\n", "").replace("\n", '')
		mqtt_msg = str(mqtt_msg).replace("\\","")
		mqtt_msg = str(mqtt_msg).replace('}"','}')
		mqtt_msg = str(mqtt_msg).replace('"{','{')
		mqtt_msg = str(mqtt_msg).replace('{','')
		mqtt_msg = str(mqtt_msg).replace('}','')
		mqtt_msg = str(mqtt_msg).replace('"','')
		mqtt_msg = mqtt_msg.split(",")

		ra = mqtt_msg[3].split(":")[1]
		ya = mqtt_msg[4].split(":")[1]
		ba = mqtt_msg[5].split(":")[1]

		mycursor = self.db.cursor()
		if(self.t+60 <= int(str(time.time()).split('.')[0])):
			self.t = int(str(time.time()).split('.')[0])
			sql = 'INSERT INTO live (current) VALUES ('+ba+')'
			mycursor.execute(sql)
			self.db.commit()
			print(ba)
			print("Data Inserted!",time.ctime())
		
		

	def on_connect(self,mqttclient, userdata, flags,rc):
		if rc == 0:
			print("connected!")
		else:
			print("Connection failed")
        
	def on_message(self, mqttclient, userdata, msg):
		Thread(target=self.upload, args=(msg,)).start()

if __name__ == '__main__':
	Mqtt()


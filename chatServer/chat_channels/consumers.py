# chat/consumers.py
from channels.generic.websocket import WebsocketConsumer
import json

class ChatConsumer(WebsocketConsumer):
    # groups = ["broadcast"]

    def connect(self):
        print('consumer connect')
        self.accept()

    def disconnect(self, close_code):
        print('consumer disconnect')
        pass

    def receive(self, text_data):
        print('consumer msg received', text_data)
        # text_data_json = json.loads(text_data)
        # print(text_data_json)
        # message = text_data_json['message']

        self.send(text_data=json.dumps({
            'message': text_data
        }))
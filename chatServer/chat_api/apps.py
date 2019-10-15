from django.apps import AppConfig

from .serializers import MessageSerializer
from logpipe import Consumer, register_consumer

class ChatApiConfig(AppConfig):
    name = 'chat_api'
        

# Register consumers with logpipe
# @register_consumer
# def build_message_consumer():
#     consumer = Consumer('message')
#     consumer.register(MessageSerializer)
#     return consumer
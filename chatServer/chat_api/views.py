from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from django.db.models import Q
from .serializers import ChatUser, Message, Notification, ChatUserSerializer, MessageSerializer, NotificationSerializer
from logpipe import Producer
from chatServer.settings import KAFKA_PRODUCER as kfk_producer
from kafka.errors import KafkaError
import json
import asyncio
import websockets

class ChatUserModelViewSet(ModelViewSet):
    serializer_class = ChatUserSerializer
    queryset = ChatUser.objects.all()

class MessageModelViewSet(ModelViewSet):
    serializer_class = MessageSerializer
    queryset = Message.objects.all()

class NotificationModelViewSet(ModelViewSet):
    serializer_class = NotificationSerializer
    queryset = Notification.objects.all()


class MessageController(APIView):

    def get(self, request):
        try:
            user1 = ChatUser.objects.get(user_id=request.GET.get('from'))
            user2 = ChatUser.objects.get(user_id=request.GET.get('to'))
            m = Message.objects.filter(Q(Q(sent_from=user1) & Q(sent_to=user2)) | Q(Q(sent_from=user2) & Q(sent_to=user1))).order_by('created_at')
            serializer = MessageSerializer(m, many=True)      
            output = serializer.data
            return Response(output)
        except KafkaError as e:
            return Response({'error': str(e)})
        except Exception as e:
            return Response({'error': str(e)})

    def post(self, request):
        try:
            sent_from = ChatUser.objects.get(user_id=request.data.get('sent_from'))
            sent_to = ChatUser.objects.get(user_id=request.data.get('sent_to'))
            m = Message(sent_from=sent_from, sent_to=sent_to, message=request.data.get('message'))
            m.save()
            serializer = MessageSerializer(m)      
            future = kfk_producer.send('message', serializer.data)
            # record_metadata = future.get(timeout=10)
            return Response({'success': 'message sent'})
        except KafkaError as e:
            return Response({'error': str(e)})
        except Exception as e:
            return Response({'error': str(e)})


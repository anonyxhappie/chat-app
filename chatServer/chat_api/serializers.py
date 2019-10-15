from rest_framework import serializers
from .models import ChatUser, Message, Notification

class ChatUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = ChatUser
        fields = '__all__'


class MessageSerializer(serializers.ModelSerializer):
    MESSAGE_TYPE = 'message'
    VERSION = 1
    KEY_FIELD = 'message_id'

    class Meta:
        model = Message
        fields = '__all__'


class NotificationSerializer(serializers.ModelSerializer):
    MESSAGE_TYPE = 'notification'
    VERSION = 1
    KEY_FIELD = 'notification_id'

    class Meta:
        model = Notification
        fields = '__all__'


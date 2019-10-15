from django.db import models
from datetime import datetime 
import uuid

class ChatUser(models.Model):
    user_id = models.CharField(primary_key=True, default=str(uuid.uuid4()), max_length=64) 
    user_name = models.CharField(max_length=255, unique=True)
    full_name = models.CharField(max_length=255, null=True)

    def save(self, *args, **kwargs):
        self.user_id = str(uuid.uuid4())
        super(ChatUser, self).save(*args, **kwargs) 


# class ChatGroup(models.Model):
#     chat_group_id = models.CharField(primary_key=True, default=str(uuid.uuid4()), max_length=64) 
#     name = models.CharField(max_length=255)

#     def save(self, *args, **kwargs):
#         self.name = self.sent_from.user_name + '_' + self.sent_to.user_name
#         super(ChatGroup, self).save(*args, **kwargs) 
    
class Message(models.Model):
    message_id = models.CharField(primary_key=True, default=str(uuid.uuid4()), max_length=64)
    message = models.CharField(max_length=255)
    sent_from = models.ForeignKey(ChatUser, on_delete=models.CASCADE, related_name='sent_from')
    sent_to = models.ForeignKey(ChatUser, on_delete=models.CASCADE, related_name='sent_to')
    created_at = models.DateTimeField(default=datetime.now())

    def save(self, *args, **kwargs):
        self.message_id = str(uuid.uuid4())
        super(Message, self).save(*args, **kwargs) 

class Notification(models.Model):
    notification_id = models.CharField(primary_key=True, default=str(uuid.uuid4()), max_length=64)
    n_message = models.ForeignKey(Message, on_delete=models.CASCADE)
    text = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=datetime.now())

    def save(self, *args, **kwargs):
        self.notification_id = str(uuid.uuid4())
        super(Notification, self).save(*args, **kwargs) 


from django.urls import path, include
from rest_framework import routers

from .views import ChatUserModelViewSet, MessageModelViewSet, NotificationModelViewSet, MessageController

router = routers.SimpleRouter()
router.register(r'users', ChatUserModelViewSet)
router.register(r'messages', MessageModelViewSet)
router.register(r'notifications', NotificationModelViewSet)

urlpatterns = [
    path('text', MessageController.as_view()),
    path('', include(router.urls)),
]

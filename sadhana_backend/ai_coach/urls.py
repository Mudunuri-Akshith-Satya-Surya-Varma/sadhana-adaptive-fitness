from django.urls import path
from .views import AiCoachChatView

urlpatterns = [
    path('chat/', AiCoachChatView.as_view(), name='ai-coach-chat'),
]

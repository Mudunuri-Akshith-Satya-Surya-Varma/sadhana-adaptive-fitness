"""
URL configuration for Sādhanā backend.
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db import connection

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Sādhanā system health check endpoint.
    Verifies backend runtime, database connectivity, and configuration.
    """
    db_status = "ok"
    try:
        connection.ensure_connection()
    except Exception as e:
        db_status = f"error: {str(e)}"

    return Response({
        "status": "ok",
        "service": "Sādhanā Adaptive Fitness Engine",
        "database": db_status,
        "classes": [
            {"name": "Sthira", "domain": "Balance"},
            {"name": "Vistāra", "domain": "Flexibility"},
            {"name": "Yodha", "domain": "Strength"},
            {"name": "Dhruva", "domain": "Cardio / Endurance"},
            {"name": "Samanvaya", "domain": "Coordination"}
        ],
        "version": "1.0.0-mvp"
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health_check'),
    path('api/classes/', include('classes.urls')),
    path('api/users/', include('users.urls')),
    path('api/exercises/', include('exercises.urls')),
    path('api/workouts/', include('workouts.urls')),
    path('api/ai-coach/', include('ai_coach.urls')),
]

from django.urls import path
from .views import TodayWorkoutView, ToggleExerciseCompleteView

urlpatterns = [
    path('today/', TodayWorkoutView.as_view(), name='workout-today'),
    path('complete-set/', ToggleExerciseCompleteView.as_view(), name='workout-complete-set'),
]

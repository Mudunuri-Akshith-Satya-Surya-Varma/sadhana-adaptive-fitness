from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import Exercise
from .serializers import ExerciseSerializer

class ExerciseListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ExerciseSerializer

    def get_queryset(self):
        queryset = Exercise.objects.all()
        class_slug = self.request.query_params.get('class_slug')
        if class_slug:
            queryset = queryset.filter(class_slug=class_slug)
        return queryset

class ExerciseDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from .models import SadhanaClass
from .serializers import SadhanaClassSerializer, EvaluateBiometricsSerializer
from .services.classifier import classify_biometrics

class SadhanaClassListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = SadhanaClass.objects.all()
    serializer_class = SadhanaClassSerializer

class SadhanaClassDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset = SadhanaClass.objects.all()
    serializer_class = SadhanaClassSerializer
    lookup_field = 'slug'

class EvaluateBiometricsView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EvaluateBiometricsSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            result = classify_biometrics(
                age=data['age'],
                weight_kg=data['weight_kg'],
                primary_goal=data['primary_goal'],
                activity_level=data['activity_level'],
                name=data['name']
            )

            # Fetch class object details if available in DB
            class_obj = SadhanaClass.objects.filter(slug=result['assigned_class']).first()
            if class_obj:
                result['class_details'] = SadhanaClassSerializer(class_obj).data

            # Automatically bind to UserProfile so state persists instantly
            try:
                from users.models import UserProfile
                from django.contrib.auth.models import User
                username = data.get('name') or 'Arjun'
                user, _ = User.objects.get_or_create(username=username)
                profile, _ = UserProfile.objects.get_or_create(user=user)
                profile.name = data.get('name', profile.name)
                profile.age = data.get('age', profile.age)
                profile.weight_kg = data.get('weight_kg', profile.weight_kg)
                profile.primary_goal = data.get('primary_goal', profile.primary_goal)
                profile.activity_level = data.get('activity_level', profile.activity_level)
                if class_obj:
                    profile.assigned_class = class_obj
                profile.save()
            except Exception as e:
                print(f"[WARN] Failed to auto-bind class to profile: {e}")

            return Response(result, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MyClassView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        username = request.query_params.get('username', 'Arjun')
        from users.models import UserProfile
        profile = UserProfile.objects.filter(user__username=username).first()
        if not profile or not profile.assigned_class:
            class_obj = SadhanaClass.objects.filter(slug='yodha').first()
            if not class_obj:
                class_obj = SadhanaClass.objects.first()
            if profile and class_obj:
                profile.assigned_class = class_obj
                profile.save()
        else:
            class_obj = profile.assigned_class

        if not class_obj:
            return Response({"error": "No classes available"}, status=status.HTTP_404_NOT_FOUND)
        return Response(SadhanaClassSerializer(class_obj).data)

class AssignClassView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        slug = request.data.get('slug')
        username = request.data.get('username', 'Arjun')
        class_obj = SadhanaClass.objects.filter(slug=slug).first()
        if not class_obj:
            return Response({"error": f"Class '{slug}' not found"}, status=status.HTTP_404_NOT_FOUND)

        from users.models import UserProfile
        from django.contrib.auth.models import User
        user, _ = User.objects.get_or_create(username=username)
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.assigned_class = class_obj
        profile.save()

        return Response({
            "status": "assigned",
            "class": SadhanaClassSerializer(class_obj).data
        }, status=status.HTTP_200_OK)

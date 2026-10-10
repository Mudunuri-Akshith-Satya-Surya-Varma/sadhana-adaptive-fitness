from rest_framework import serializers
from .models import SadhanaClass

class SadhanaClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = SadhanaClass
        fields = '__all__'

class EvaluateBiometricsSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100, default="Seeker")
    age = serializers.IntegerField(min_value=12, max_value=100, default=24)
    weight_kg = serializers.FloatField(min_value=30.0, max_value=250.0, default=72.0)
    primary_goal = serializers.CharField(max_length=100, default="strength")
    activity_level = serializers.CharField(max_length=50, default="intermediate")

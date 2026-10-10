from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile
from classes.serializers import SadhanaClassSerializer

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    assigned_class_slug = serializers.CharField(source='assigned_class.slug', read_only=True, default='')
    assigned_class_details = SadhanaClassSerializer(source='assigned_class', read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'id', 'username', 'email', 'name', 'age', 'weight_kg', 
            'primary_goal', 'activity_level', 'assigned_class', 'assigned_class_slug',
            'assigned_class_details', 'current_xp', 'current_level', 
            'aura_score', 'equipment_access', 'limitations', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'current_xp', 'current_level', 'aura_score', 'created_at', 'updated_at']

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    name = serializers.CharField(max_length=100, required=False, default="Seeker")

    def validate_username(self, value):
        val = value.strip().lower()
        if User.objects.filter(username__iexact=val).exists():
            raise serializers.ValidationError("A practitioner with this username already exists.")
        return val

    def validate_email(self, value):
        val = value.strip().lower()
        if User.objects.filter(email__iexact=val).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return val

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(help_text="Username or email address")
    password = serializers.CharField(write_only=True)

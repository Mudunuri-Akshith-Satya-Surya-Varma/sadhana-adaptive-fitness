from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from .models import UserProfile
from .serializers import UserProfileSerializer, RegisterSerializer, LoginSerializer
from classes.models import SadhanaClass

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            # Return first error message clearly
            errors = serializer.errors
            first_err = next(iter(errors.values()))[0] if errors else 'Invalid registration data.'
            return Response({'detail': first_err, 'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        username = data['username']
        email = data['email']
        password = data['password']
        name = data.get('name') or username.capitalize()

        user = User.objects.create_user(username=username, email=email, password=password)
        profile = UserProfile.objects.create(
            user=user,
            name=name,
            equipment_access=['bodyweight'],
            limitations=[]
        )
        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'user': UserProfileSerializer(profile).data,
            'message': 'Account registered successfully. Welcome to Sādhanā.'
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'detail': 'Username and password required.'}, status=status.HTTP_400_BAD_REQUEST)

        ident = serializer.validated_data['username'].strip()
        password = serializer.validated_data['password']

        # Support login by username OR email
        user = User.objects.filter(username__iexact=ident).first()
        if not user:
            user = User.objects.filter(email__iexact=ident).first()

        if not user or not user.check_password(password):
            return Response({
                'detail': 'Invalid username/email or password.'
            }, status=status.HTTP_401_UNAUTHORIZED)

        token, _ = Token.objects.get_or_create(user=user)
        profile, _ = UserProfile.objects.get_or_create(
            user=user, 
            defaults={'name': user.username.capitalize(), 'equipment_access': ['bodyweight']}
        )

        return Response({
            'token': token.key,
            'user': UserProfileSerializer(profile).data,
            'message': f'Welcome back, {profile.name}.'
        }, status=status.HTTP_200_OK)

class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Token '):
            token_key = auth_header.split(' ')[1]
            Token.objects.filter(key=token_key).delete()
        elif request.user.is_authenticated:
            Token.objects.filter(user=request.user).delete()
        return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)

class CurrentUserView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'Not authenticated.'}, status=status.HTTP_401_UNAUTHORIZED)
        profile, _ = UserProfile.objects.get_or_create(
            user=request.user,
            defaults={'name': request.user.username.capitalize(), 'equipment_access': ['bodyweight']}
        )
        return Response(UserProfileSerializer(profile).data)

class DemoLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user, created = User.objects.get_or_create(username='Arjun', defaults={'email': 'arjun@sadhana.fit'})
        if created:
            user.set_password('SadhanaDemo123!')
            user.save()

        profile, _ = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'name': 'Arjun',
                'age': 24,
                'weight_kg': 75.0,
                'primary_goal': 'strength',
                'activity_level': 'intermediate',
                'aura_score': 120,
                'equipment_access': ['bodyweight'],
                'limitations': []
            }
        )
        if not profile.assigned_class:
            yodha = SadhanaClass.objects.filter(slug='yodha').first()
            if yodha:
                profile.assigned_class = yodha
                profile.save()

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserProfileSerializer(profile).data,
            'message': 'Demo practitioner session initiated.'
        }, status=status.HTTP_200_OK)

class RegisterOrProfileView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        if request.user and request.user.is_authenticated:
            user = request.user
        else:
            username = data.get('username') or 'Warrior'
            user, created = User.objects.get_or_create(username=username)
            if created and data.get('password'):
                user.set_password(data['password'])
                user.save()

        # Find or create profile
        profile, _ = UserProfile.objects.get_or_create(user=user)
        if 'name' in data:
            profile.name = data['name']
        if 'age' in data:
            profile.age = int(data['age'])
        if 'weight_kg' in data:
            profile.weight_kg = float(data['weight_kg'])
        if 'primary_goal' in data:
            profile.primary_goal = data['primary_goal']
        if 'activity_level' in data:
            profile.activity_level = data['activity_level']
        if 'equipment' in data:
            profile.equipment_access = data['equipment']
        elif 'equipment_access' in data:
            profile.equipment_access = data['equipment_access']
        if 'limitations' in data:
            profile.limitations = data['limitations']

        # Link assigned class if passed
        class_slug = data.get('assigned_class_slug')
        if class_slug:
            cls_obj = SadhanaClass.objects.filter(slug=class_slug).first()
            if cls_obj:
                profile.assigned_class = cls_obj

        profile.save()
        return Response(UserProfileSerializer(profile).data, status=status.HTTP_200_OK)

    def get(self, request):
        if request.user and request.user.is_authenticated:
            user = request.user
        else:
            username = request.query_params.get('username')
            if username:
                user = User.objects.filter(username=username).first()
            else:
                user = User.objects.first()
        
        if not user:
            return Response({"error": "No user profile found"}, status=status.HTTP_404_NOT_FOUND)
        
        profile, _ = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'name': user.first_name or user.username.capitalize(),
                'age': 24,
                'weight_kg': 75.0,
                'primary_goal': 'strength',
                'activity_level': 'intermediate',
                'aura_score': 100,
                'equipment_access': ['bodyweight'],
                'limitations': []
            }
        )
        if not profile.equipment_access:
            profile.equipment_access = ['bodyweight']
            profile.save()
        if not profile.assigned_class:
            yodha = SadhanaClass.objects.filter(slug='yodha').first()
            if yodha:
                profile.assigned_class = yodha
                profile.save()

        return Response(UserProfileSerializer(profile).data)

class AddXpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        if request.user and request.user.is_authenticated:
            user = request.user
        else:
            username = request.data.get('username')
            user = User.objects.filter(username=username).first() if username else None

        xp_amount = int(request.data.get('xp', 0))

        if not user or not hasattr(user, 'profile'):
            profile = UserProfile.objects.first()
        else:
            profile = user.profile

        if not profile:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

        result = profile.add_xp(xp_amount)
        result["user_profile"] = UserProfileSerializer(profile).data
        return Response(result, status=status.HTTP_200_OK)

class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('id_token') or request.data.get('credential')
        if not token:
            return Response({'detail': 'Google credential/id_token is required.'}, status=status.HTTP_400_BAD_REQUEST)

        from django.conf import settings
        client_id = getattr(settings, 'GOOGLE_CLIENT_ID', '').strip()

        try:
            from google.oauth2 import id_token
            from google.auth.transport import requests as google_requests

            id_info = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                client_id if client_id else None
            )

            email = id_info.get('email')
            if not email:
                return Response({'detail': 'No email found in Google payload.'}, status=status.HTTP_400_BAD_REQUEST)

            name = id_info.get('name') or email.split('@')[0].capitalize()
            username = email.split('@')[0]

            user = User.objects.filter(email__iexact=email).first()
            if not user:
                base_username = username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1
                user = User.objects.create_user(username=username, email=email)
                user.set_unusable_password()
                user.save()

            profile, _ = UserProfile.objects.get_or_create(
                user=user,
                defaults={'name': name, 'equipment_access': ['bodyweight'], 'limitations': []}
            )

            auth_token, _ = Token.objects.get_or_create(user=user)

            return Response({
                'token': auth_token.key,
                'user': UserProfileSerializer(profile).data,
                'message': 'Google authentication successful.'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'detail': f'Google token verification error: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    CurrentUserView,
    DemoLoginView,
    RegisterOrProfileView,
    AddXpView,
    GoogleLoginView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('google-login/', GoogleLoginView.as_view(), name='auth-google-login'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('me/', CurrentUserView.as_view(), name='auth-me'),
    path('demo-login/', DemoLoginView.as_view(), name='auth-demo-login'),
    path('profile/', RegisterOrProfileView.as_view(), name='user-profile'),
    path('add-xp/', AddXpView.as_view(), name='user-add-xp'),
]

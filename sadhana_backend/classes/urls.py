from django.urls import path
from .views import (
    SadhanaClassListView, 
    SadhanaClassDetailView, 
    EvaluateBiometricsView,
    MyClassView,
    AssignClassView
)

urlpatterns = [
    path('', SadhanaClassListView.as_view(), name='class-list'),
    path('evaluate/', EvaluateBiometricsView.as_view(), name='class-evaluate'),
    path('my-class/', MyClassView.as_view(), name='my-class'),
    path('my-class/assign/', AssignClassView.as_view(), name='my-class-assign'),
    path('<slug:slug>/', SadhanaClassDetailView.as_view(), name='class-detail'),
]

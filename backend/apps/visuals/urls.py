from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VisualRequestViewSet

router = DefaultRouter()
router.register('requests', VisualRequestViewSet, basename='visual-request')

urlpatterns = [
    path('', include(router.urls)),
]

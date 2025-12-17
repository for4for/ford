from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IncentiveRequestViewSet

router = DefaultRouter()
router.register('requests', IncentiveRequestViewSet, basename='incentive-request')

urlpatterns = [
    path('', include(router.urls)),
]

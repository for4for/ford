from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CampaignRequestViewSet

router = DefaultRouter()
router.register('requests', CampaignRequestViewSet, basename='campaign-request')

urlpatterns = [
    path('', include(router.urls)),
]






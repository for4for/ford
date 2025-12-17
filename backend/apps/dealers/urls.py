from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DealerViewSet, DealerBudgetViewSet

router = DefaultRouter()
router.register('', DealerViewSet, basename='dealer')
router.register('budgets', DealerBudgetViewSet, basename='budget')

urlpatterns = [
    path('', include(router.urls)),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DealerViewSet, DealerBudgetViewSet, BrandViewSet

router = DefaultRouter()
router.register('', DealerViewSet, basename='dealer')
router.register('budgets', DealerBudgetViewSet, basename='budget')

# Ayrı router for brands (will be mounted at /api/brands/)
brand_router = DefaultRouter()
brand_router.register('', BrandViewSet, basename='brand')

urlpatterns = [
    path('', include(router.urls)),
]

# Export brand_router for main urls.py
brand_urlpatterns = [
    path('', include(brand_router.urls)),
]

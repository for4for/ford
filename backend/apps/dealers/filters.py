import django_filters
from .models import Dealer, Brand


class DealerFilter(django_filters.FilterSet):
    """Custom filter for Dealer with partial matching"""
    
    # Partial matching filters (icontains)
    city = django_filters.CharFilter(lookup_expr='icontains')
    district = django_filters.CharFilter(lookup_expr='icontains')
    region = django_filters.CharFilter(lookup_expr='icontains')
    dealer_name = django_filters.CharFilter(lookup_expr='icontains')
    dealer_code = django_filters.CharFilter(lookup_expr='icontains')
    
    # Exact match filters
    status = django_filters.CharFilter(lookup_expr='exact')
    dealer_type = django_filters.CharFilter(lookup_expr='exact')
    brand = django_filters.NumberFilter(field_name='brand_id')
    
    class Meta:
        model = Dealer
        fields = ['status', 'dealer_type', 'city', 'district', 'region', 'brand', 'dealer_name', 'dealer_code']


class BrandFilter(django_filters.FilterSet):
    """Custom filter for Brand with partial matching"""
    
    name = django_filters.CharFilter(lookup_expr='icontains')
    code = django_filters.CharFilter(lookup_expr='icontains')
    is_active = django_filters.BooleanFilter()
    
    class Meta:
        model = Brand
        fields = ['name', 'code', 'is_active']





from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Permission class for admin users only"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin


class IsAdminOrModerator(permissions.BasePermission):
    """Permission class for admin or moderator users"""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_admin or request.user.is_moderator)
        )


class IsBayi(permissions.BasePermission):
    """Permission class for bayi users"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_bayi


class IsOwnerOrAdmin(permissions.BasePermission):
    """Permission class: object owner or admin can access"""
    
    def has_object_permission(self, request, view, obj):
        # Admin can access everything
        if request.user.is_admin or request.user.is_moderator:
            return True
        
        # Check if user is the owner (for models with 'dealer' field)
        if hasattr(obj, 'dealer') and obj.dealer:
            # Check if user belongs to this dealer
            return obj.dealer.users.filter(pk=request.user.pk).exists()
        
        # Check if user is the owner (for dealer objects with users)
        if hasattr(obj, 'users'):
            return obj.users.filter(pk=request.user.pk).exists()
        
        return False


class IsAdminOrReadOnly(permissions.BasePermission):
    """Allow read-only for authenticated users, write for admins"""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.is_admin


from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and
                   hasattr(request.user, 'role') and request.user.role.role == 'admin')

class IsEditorOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if not hasattr(request.user, 'role'):
            return False
        return request.user.role.role in ['admin', 'editor']

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role.role in ['admin', 'editor']

class IsViewerOrHigher(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if not hasattr(request.user, 'role'):
            return False
        return request.user.role.role in ['admin', 'editor', 'viewer']


class HasResourcePermission(permissions.BasePermission):
    """
    Resource-based permission that checks if a user has permission for a specific resource.

    To use this permission, the view must implement get_resource_type() method.
    """

    def has_permission(self, request, view):
        # Get the resource type from the view
        try:
            resource_type = view.get_resource_type()
        except AttributeError:
            # If the view doesn't implement get_resource_type, deny access
            return False

        # Always allow read access for authenticated users
        if request.method in permissions.SAFE_METHODS and request.user.is_authenticated:
            return True

        # Check if the user has the required role for this action
        return self.has_role_permission(request.user, resource_type, request.method)

    def has_role_permission(self, user, resource_type, method):
        # If not authenticated, deny access
        if not user or not user.is_authenticated:
            return False

        # Get the user's role
        try:
            role = user.role.role if hasattr(user, 'role') and user.role else 'viewer'
        except:
            role = 'viewer'

        # Admin users have full access
        if role == 'admin' or user.is_staff or user.is_superuser:
            return True

        # Editor users can create and update but not delete
        if role == 'editor':
            return method in ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH']

        # Viewer users have read-only access
        if role == 'viewer':
            return method in ['GET', 'HEAD', 'OPTIONS']

        # Default: deny access
        return False
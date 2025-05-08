from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from core.auth import (
    LoginView,
    UserProfileView,
    PasswordResetRequestView,
    PasswordResetConfirmView
)
from core.urls import router

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/users/me/', UserProfileView.as_view(), name='user-profile'),
    # Add these new paths for password reset
    path('api/auth/password-reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('api/auth/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('api/', include(router.urls)),
]

# Always serve media files in development
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Debug output for media URL configuration
print(f"MEDIA_URL: {settings.MEDIA_URL}")
print(f"MEDIA_ROOT: {settings.MEDIA_ROOT}")

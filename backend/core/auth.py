from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny
from rest_framework.parsers import JSONParser
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str

class LoginView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [JSONParser]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({
                'error': 'Please provide both username and password'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(username=username, password=password)
        
        if user:
            refresh = RefreshToken.for_user(user)
            role = getattr(user.role, 'role', 'viewer') if hasattr(user, 'role') else 'viewer'
            
            return Response({
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'name': f"{user.first_name} {user.last_name}".strip() or None,
                    'created_at': user.date_joined,
                    'role': role
                },
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            })
        
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)

class UserProfileView(APIView):
    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'name': f"{user.first_name} {user.last_name}".strip() or None,
            'created_at': user.date_joined
        })

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            email = request.data.get('email')
            if not email:
                return Response({
                    'error': 'Email is required'
                }, status=status.HTTP_400_BAD_REQUEST)
                
            try:
                user = User.objects.get(email=email)
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                
                reset_url = f"{settings.FRONTEND_URL}/admin/reset-password/{uid}/{token}"
                
                try:
                    # Send email with more detailed error handling
                    send_mail(
                        subject='Password Reset Request',
                        message=f'Please click the following link to reset your password: {reset_url}',
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[email],
                        fail_silently=False,
                    )
                except Exception as email_error:
                    print(f"Email sending error: {str(email_error)}")
                    return Response({
                        'error': f'Failed to send email: {str(email_error)}'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                return Response({
                    'message': 'Password reset email has been sent'
                })
                
            except User.DoesNotExist:
                # For security reasons, we return success even if the email doesn't exist
                return Response({
                    'message': 'Password reset email has been sent'
                })
                
        except Exception as e:
            print(f"Password reset error: {str(e)}")
            return Response({
                'error': f'Password reset failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        token = request.data.get('token')
        password = request.data.get('password')
        
        if not token or not password:
            return Response({
                'error': 'Token and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            uid = token.split('/')[0]
            token = token.split('/')[1]
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
            
            if default_token_generator.check_token(user, token):
                user.set_password(password)
                user.save()
                return Response({
                    'message': 'Password has been reset successfully'
                })
            else:
                return Response({
                    'error': 'Invalid or expired token'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({
                'error': 'Invalid reset link'
            }, status=status.HTTP_400_BAD_REQUEST)

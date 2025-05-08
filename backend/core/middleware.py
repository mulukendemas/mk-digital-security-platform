import logging
import json
import time
from django.utils import timezone
from django.conf import settings

# Create a dedicated security logger
security_logger = logging.getLogger('security')

class SecurityLoggingMiddleware:
    """
    Middleware to log security-relevant requests for auditing purposes.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        # Skip logging for static/media files
        if request.path.startswith('/static/') or request.path.startswith('/media/'):
            return self.get_response(request)
            
        # Start timing the request
        start_time = time.time()
        
        # Process the request
        response = self.get_response(request)
        
        # Calculate request duration
        duration = time.time() - start_time
        
        # Log security-relevant information
        self.log_request(request, response, duration)
        
        return response
        
    def log_request(self, request, response, duration):
        """Log security-relevant information about the request."""
        # Get user information
        user_id = getattr(request.user, 'id', None)
        username = getattr(request.user, 'username', 'anonymous')
        
        # Get request information
        method = request.method
        path = request.path
        status_code = response.status_code
        
        # Get IP address (consider X-Forwarded-For for proxied requests)
        ip_address = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', ''))
        if ',' in ip_address:  # X-Forwarded-For can contain multiple IPs
            ip_address = ip_address.split(',')[0].strip()
            
        # Get user agent
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Prepare log data
        log_data = {
            'timestamp': timezone.now().isoformat(),
            'user_id': user_id,
            'username': username,
            'method': method,
            'path': path,
            'status_code': status_code,
            'ip_address': ip_address,
            'user_agent': user_agent,
            'duration': f"{duration:.4f}s",
        }
        
        # Add request body for POST/PUT/PATCH requests (excluding login/password endpoints)
        if method in ('POST', 'PUT', 'PATCH') and not any(sensitive in path for sensitive in ['/login', '/password', '/token']):
            try:
                # Don't log file uploads or form data
                if request.content_type == 'application/json':
                    body = json.loads(request.body) if request.body else {}
                    # Redact sensitive fields
                    for field in ['password', 'token', 'key', 'secret', 'credential']:
                        if field in body:
                            body[field] = '[REDACTED]'
                    log_data['body'] = body
            except Exception:
                pass
                
        # Log based on status code
        if 400 <= status_code < 500:
            security_logger.warning(json.dumps(log_data))
        elif status_code >= 500:
            security_logger.error(json.dumps(log_data))
        elif path.startswith('/admin') or path.startswith('/api/auth'):
            security_logger.info(json.dumps(log_data))
        elif method in ('POST', 'PUT', 'DELETE', 'PATCH'):
            security_logger.info(json.dumps(log_data))

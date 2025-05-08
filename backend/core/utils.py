"""
Utility functions for the core app.
"""

import re
from django.utils.html import escape
from django.core.exceptions import ValidationError


def sanitize_input(input_string):
    """
    Sanitize user input to prevent XSS attacks.
    """
    if not input_string:
        return input_string

    # Escape HTML entities
    return escape(input_string)


def validate_username(username):
    """
    Validate username to ensure it meets security requirements.
    - Only alphanumeric characters and underscores
    - 3-20 characters long
    """
    if not re.match(r'^[a-zA-Z0-9_]{3,20}$', username):
        raise ValidationError(
            'Username must be 3-20 characters long and contain only letters, numbers, and underscores.'
        )
    return username


def validate_password_strength(password, settings=None):
    """
    Validate password strength based on site settings.
    If settings is None, use default password policy.
    """
    from .models import SiteSettings

    # Get site settings if not provided
    if settings is None:
        try:
            settings = SiteSettings.objects.first()
        except Exception:
            # If settings can't be retrieved, use default policy
            settings = None

    # Get password policy from settings or use defaults
    min_length = getattr(settings, 'passwordPolicyMinLength', 8) if settings else 8
    require_uppercase = getattr(settings, 'passwordPolicyRequireUppercase', True) if settings else True
    require_lowercase = getattr(settings, 'passwordPolicyRequireLowercase', True) if settings else True
    require_numbers = getattr(settings, 'passwordPolicyRequireNumbers', True) if settings else True
    require_special_chars = getattr(settings, 'passwordPolicyRequireSpecialChars', False) if settings else False

    # Validate password length
    if len(password) < min_length:
        raise ValidationError(f'Password must be at least {min_length} characters long.')

    # Validate uppercase letters
    if require_uppercase and not re.search(r'[A-Z]', password):
        raise ValidationError('Password must contain at least one uppercase letter.')

    # Validate lowercase letters
    if require_lowercase and not re.search(r'[a-z]', password):
        raise ValidationError('Password must contain at least one lowercase letter.')

    # Validate numbers
    if require_numbers and not re.search(r'[0-9]', password):
        raise ValidationError('Password must contain at least one digit.')

    # Validate special characters
    if require_special_chars and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        raise ValidationError('Password must contain at least one special character.')

    return password


def log_action(user, action_type, resource_type, resource_id=None, details=None):
    """
    Log user actions for audit purposes.
    """
    from .models import Activity

    try:
        # Map the parameters to the correct field names in the Activity model
        Activity.objects.create(
            user=user,
            action=action_type,  # action_type -> action
            content_type=resource_type,  # resource_type -> content_type
            object_id=str(resource_id) if resource_id else None,  # resource_id -> object_id
            details=details
        )
    except Exception as e:
        print(f"Error logging action: {str(e)}")
        # Don't raise the exception - we don't want to break the main functionality

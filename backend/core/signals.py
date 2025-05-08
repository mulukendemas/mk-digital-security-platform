from django.contrib.auth.models import User
from django.db import transaction
from .models import UserRole
import logging

logger = logging.getLogger(__name__)

def create_default_admin(sender, **kwargs):
    """
    Create a default admin user if no users exist in the database.
    This function is connected to the post_migrate signal in the CoreConfig.ready method.
    """
    try:
        # Check if any users exist
        if User.objects.count() == 0:
            logger.info("No users found in the database. Creating default admin user...")
            
            with transaction.atomic():
                # Create default admin user
                admin_user = User.objects.create_superuser(
                    username='admin',
                    email='admin@example.com',
                    password='Admin@123'  # Strong default password
                )
                
                # Create admin role
                UserRole.objects.create(user=admin_user, role='admin')
                
                logger.info("Default admin user created successfully.")
                logger.info("Username: admin")
                logger.info("Password: Admin@123")
                logger.info("Please change this password immediately after first login!")
        else:
            # Check if there's at least one admin user
            admin_exists = UserRole.objects.filter(role='admin').exists()
            
            if not admin_exists:
                logger.warning("No admin users found. You may want to create one using the create_superadmin management command.")
    except Exception as e:
        logger.error(f"Error creating default admin user: {str(e)}")

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db import transaction
from core.models import UserRole
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Ensures that at least one admin user exists in the system'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, default='admin', help='Username for the admin')
        parser.add_argument('--email', type=str, default='admin@example.com', help='Email for the admin')
        parser.add_argument('--password', type=str, default='Admin@123', help='Password for the admin')
        parser.add_argument('--force', action='store_true', help='Force creation even if users exist')

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']
        force = options['force']

        # Check if any users exist
        if User.objects.count() == 0 or force:
            # Check if the specified admin user already exists
            admin_exists = User.objects.filter(username=username).exists()
            
            if admin_exists and not force:
                self.stdout.write(self.style.WARNING(f'User with username "{username}" already exists'))
                return
            
            try:
                with transaction.atomic():
                    # Create the user if it doesn't exist
                    if not admin_exists:
                        user = User.objects.create_superuser(
                            username=username,
                            email=email,
                            password=password
                        )
                        self.stdout.write(self.style.SUCCESS(f'Admin user "{username}" created successfully'))
                    else:
                        # Get the existing user
                        user = User.objects.get(username=username)
                        # Update password if force is True
                        if force:
                            user.set_password(password)
                            user.save()
                            self.stdout.write(self.style.SUCCESS(f'Password updated for user "{username}"'))
                    
                    # Create or update admin role
                    role, created = UserRole.objects.get_or_create(user=user, defaults={'role': 'admin'})
                    if not created and role.role != 'admin':
                        role.role = 'admin'
                        role.save()
                        self.stdout.write(self.style.SUCCESS(f'Role updated to admin for user "{username}"'))
                    elif created:
                        self.stdout.write(self.style.SUCCESS(f'Admin role assigned to user "{username}"'))
                    
                    self.stdout.write(self.style.SUCCESS(f'Admin user "{username}" is now available'))
                    self.stdout.write(self.style.SUCCESS(f'Username: {username}'))
                    self.stdout.write(self.style.SUCCESS(f'Password: {password}'))
                    self.stdout.write(self.style.WARNING('Please change this password after first login!'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error ensuring admin user: {str(e)}'))
        else:
            # Check if there's at least one admin user
            admin_exists = UserRole.objects.filter(role='admin').exists()
            
            if admin_exists:
                self.stdout.write(self.style.SUCCESS('At least one admin user already exists'))
            else:
                self.stdout.write(self.style.WARNING('No admin users found, but users exist in the system'))
                self.stdout.write(self.style.WARNING('Use --force to create an admin user anyway'))

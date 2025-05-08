from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db import transaction
from core.models import UserRole

class Command(BaseCommand):
    help = 'Creates a superadmin user with full permissions'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, default='admin', help='Username for the superadmin')
        parser.add_argument('--email', type=str, default='admin@example.com', help='Email for the superadmin')
        parser.add_argument('--password', type=str, default='admin123', help='Password for the superadmin')

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']

        # Check if user already exists
        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f'User with username "{username}" already exists'))
            return

        try:
            with transaction.atomic():
                # Create the user
                user = User.objects.create_superuser(
                    username=username,
                    email=email,
                    password=password
                )
                
                # Create admin role if it doesn't exist
                try:
                    # Check if UserRole model exists and has a role field
                    if hasattr(UserRole, 'objects'):
                        # Create or get admin role for the user
                        UserRole.objects.get_or_create(user=user, role='admin')
                        self.stdout.write(self.style.SUCCESS(f'Admin role assigned to user "{username}"'))
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f'Could not assign admin role: {str(e)}'))
                
                self.stdout.write(self.style.SUCCESS(f'Superadmin user "{username}" created successfully'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating superadmin user: {str(e)}'))

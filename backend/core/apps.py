from django.apps import AppConfig
from django.db.models.signals import post_migrate


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        # Import the signal handler here to avoid circular imports
        from .signals import create_default_admin

        # Connect the signal handler to the post_migrate signal
        post_migrate.connect(create_default_admin, sender=self)

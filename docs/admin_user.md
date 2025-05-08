# Admin User Management

## Default Admin User

The system automatically creates a default admin user when the database is first initialized and no users exist. This ensures that there's always an admin account available for initial access.

### Default Credentials

- **Username**: admin
- **Email**: admin@example.com
- **Password**: Admin@123

> **IMPORTANT**: For security reasons, please change the default password immediately after the first login.

## Manual Admin User Creation

If you need to create an admin user manually, you can use one of the following management commands:

### Create Superadmin

This command creates a new superadmin user with full permissions:

```bash
python manage.py create_superadmin [--username USERNAME] [--email EMAIL] [--password PASSWORD]
```

Options:
- `--username`: Username for the superadmin (default: admin)
- `--email`: Email for the superadmin (default: admin@example.com)
- `--password`: Password for the superadmin (default: admin123)

### Ensure Admin Exists

This command ensures that at least one admin user exists in the system:

```bash
python manage.py ensure_admin_exists [--username USERNAME] [--email EMAIL] [--password PASSWORD] [--force]
```

Options:
- `--username`: Username for the admin (default: admin)
- `--email`: Email for the admin (default: admin@example.com)
- `--password`: Password for the admin (default: Admin@123)
- `--force`: Force creation even if users exist

## How It Works

The system uses Django's post-migration signal to check if any users exist in the database. If no users are found, it automatically creates a default admin user with the credentials specified above.

This feature ensures that you always have access to the admin interface, even when setting up a new instance of the application.

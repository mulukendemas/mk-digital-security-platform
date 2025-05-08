# PostgreSQL Setup Instructions

This document provides instructions for setting up PostgreSQL for the MK Digital Security Platform.

## Prerequisites

1. Install PostgreSQL from the official website: https://www.postgresql.org/download/windows/
2. During installation:
   - Set a password for the postgres user (remember this password!)
   - Keep the default port (5432)
   - Keep the default locale
3. Add PostgreSQL bin directory to your PATH (usually `C:\Program Files\PostgreSQL\<version>\bin`)
4. Make sure the PostgreSQL service is running (check Services in Windows)

## Setup Database

### Option 1: Using the Setup Script

1. Edit the `setup_postgres_db.bat` file to set your PostgreSQL credentials
2. Run the `setup_postgres_db.bat` script to create the database and user

### Option 2: Manual Setup

1. Open a command prompt and run:
   ```
   psql -U postgres
   ```

2. Enter your PostgreSQL password when prompted

3. Create a database:
   ```sql
   CREATE DATABASE mkdss_db;
   ```

4. Create a user:
   ```sql
   CREATE USER mkdss_user WITH PASSWORD 'mkdss_password';
   ```

5. Grant privileges:
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE mkdss_db TO mkdss_user;
   ALTER USER mkdss_user CREATEDB;
   ```

6. Exit PostgreSQL:
   ```sql
   \q
   ```

## Configure Environment Variables

1. Edit the `.env` file in the `backend` directory with your PostgreSQL credentials:
   ```
   USE_POSTGRES=True
   DB_NAME=mkdss_db
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   DB_HOST=localhost
   DB_PORT=5432
   ```

   Make sure to set `USE_POSTGRES=True` to enable PostgreSQL and replace `your_postgres_password` with the password you set during PostgreSQL installation.

## Migrate Data

If you have existing data in SQLite that you want to migrate to PostgreSQL:

1. Run the `migrate_to_postgres.bat` script to migrate your data

## Verify Setup

1. Run the Django development server:
   ```
   cd backend
   python manage.py runserver
   ```

2. Access the admin interface at http://localhost:8000/admin/ and verify that your data is available

## Troubleshooting

- If you encounter connection issues, make sure PostgreSQL service is running
  - Open Services (services.msc) in Windows
  - Look for "postgresql-x64-XX" service and ensure it's running
- Check that the credentials in the `.env` file match your PostgreSQL setup
  - The most common issue is an incorrect password for the postgres user
- Ensure that the PostgreSQL port (default: 5432) is not blocked by a firewall
- If you continue to have issues, you can temporarily switch back to SQLite by setting `USE_POSTGRES=False` in the `.env` file

### Common Errors

#### Password Authentication Failed

If you see an error like:
```
FATAL: password authentication failed for user "postgres"
```

This means the password in your `.env` file doesn't match the one you set during PostgreSQL installation. Try:

1. Double-check the password you set during installation
2. Update the `DB_PASSWORD` value in the `.env` file
3. If you forgot the password, you may need to reset it:
   - Find the `pg_hba.conf` file in your PostgreSQL installation directory
   - Change the authentication method from `md5` to `trust` temporarily
   - Restart the PostgreSQL service
   - Connect to PostgreSQL and reset the password
   - Change the authentication method back to `md5`
   - Restart the PostgreSQL service again

#### Database Does Not Exist

If you see an error about the database not existing, you need to create it first:

1. Connect to PostgreSQL using the postgres user
2. Create the database using the SQL command: `CREATE DATABASE mkdss_db;`

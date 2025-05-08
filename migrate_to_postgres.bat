@echo off
echo Migrating from SQLite to PostgreSQL...

cd backend

REM Set environment variable to use SQLite for the data dump
set USE_POSTGRES=False

REM Backup SQLite data
echo Backing up SQLite data...
python manage.py dumpdata --exclude auth.permission --exclude contenttypes > data_backup.json

REM Set environment variable to use PostgreSQL for the migrations and data load
set USE_POSTGRES=True

REM Apply migrations to PostgreSQL
echo Applying migrations to PostgreSQL...
python manage.py migrate

REM Load data into PostgreSQL
echo Loading data into PostgreSQL...
python manage.py loaddata data_backup.json

echo Migration complete!
echo.
echo Note: If you encounter any errors, please check the POSTGRES_SETUP.md file for troubleshooting tips.
echo.
pause

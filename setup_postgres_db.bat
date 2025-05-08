@echo off
echo Setting up PostgreSQL database for MK Digital Security Platform...

REM Set your PostgreSQL credentials here
set PGUSER=postgres
set /p PGPASSWORD=Enter your PostgreSQL password for user 'postgres':
set DB_NAME=mkdss_db
set DB_USER=mkdss_user
set DB_PASSWORD=mkdss_password

echo.
echo Testing PostgreSQL connection...
psql -c "SELECT 1;" -d postgres

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Connection failed! Please check your PostgreSQL installation and password.
    echo See POSTGRES_SETUP.md for troubleshooting tips.
    echo.
    pause
    exit /b 1
)

REM Create database
echo.
echo Creating database %DB_NAME%...
psql -c "CREATE DATABASE %DB_NAME%;"

REM Create user
echo Creating user %DB_USER%...
psql -c "CREATE USER %DB_USER% WITH PASSWORD '%DB_PASSWORD%';"

REM Grant privileges
echo Granting privileges...
psql -c "GRANT ALL PRIVILEGES ON DATABASE %DB_NAME% TO %DB_USER%;"
psql -c "ALTER USER %DB_USER% CREATEDB;"

echo.
echo PostgreSQL database setup complete!
echo.
echo Database: %DB_NAME%
echo User: %DB_USER%
echo Password: %DB_PASSWORD%
echo.
echo Updating .env file with these credentials...

REM Update .env file
powershell -Command "(Get-Content backend\.env) -replace 'USE_POSTGRES=False', 'USE_POSTGRES=True' | Set-Content backend\.env"
powershell -Command "(Get-Content backend\.env) -replace 'DB_USER=postgres', 'DB_USER=%DB_USER%' | Set-Content backend\.env"
powershell -Command "(Get-Content backend\.env) -replace 'DB_PASSWORD=admin', 'DB_PASSWORD=%DB_PASSWORD%' | Set-Content backend\.env"

echo .env file updated successfully!
echo.
echo You can now run the migrate_to_postgres.bat script to migrate your data.
echo.
pause

@echo off
echo MK Digital Security Platform - Database Switcher
echo ===============================================
echo.

:menu
echo Select database type:
echo 1. SQLite (default, no setup required)
echo 2. PostgreSQL (requires PostgreSQL to be installed and configured)
echo 3. Exit
echo.

set /p choice=Enter your choice (1-3): 

if "%choice%"=="1" (
    echo Switching to SQLite...
    powershell -Command "(Get-Content backend\.env) -replace 'USE_POSTGRES=True', 'USE_POSTGRES=False' | Set-Content backend\.env"
    echo Database switched to SQLite successfully!
    goto end
)

if "%choice%"=="2" (
    echo Switching to PostgreSQL...
    
    REM Check if PostgreSQL is installed
    psql --version > nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo PostgreSQL is not installed or not in PATH!
        echo Please install PostgreSQL and try again.
        echo See POSTGRES_SETUP.md for instructions.
        goto end
    )
    
    REM Test PostgreSQL connection
    set PGUSER=postgres
    set /p PGPASSWORD=Enter your PostgreSQL password for user 'postgres': 
    
    echo Testing PostgreSQL connection...
    psql -c "SELECT 1;" -d postgres > nul 2>&1
    
    if %ERRORLEVEL% NEQ 0 (
        echo Connection failed! Please check your PostgreSQL installation and password.
        echo See POSTGRES_SETUP.md for troubleshooting tips.
        goto end
    )
    
    REM Update .env file
    powershell -Command "(Get-Content backend\.env) -replace 'USE_POSTGRES=False', 'USE_POSTGRES=True' | Set-Content backend\.env"
    powershell -Command "(Get-Content backend\.env) -replace 'DB_PASSWORD=admin', 'DB_PASSWORD=%PGPASSWORD%' | Set-Content backend\.env"
    
    echo Database switched to PostgreSQL successfully!
    echo.
    echo Note: If this is your first time using PostgreSQL, you may need to:
    echo 1. Run setup_postgres_db.bat to create the database
    echo 2. Run migrate_to_postgres.bat to migrate your data
    goto end
)

if "%choice%"=="3" (
    echo Exiting...
    goto exit
)

echo Invalid choice. Please try again.
echo.
goto menu

:end
echo.
echo Done! The application will use the selected database the next time it runs.
echo.
pause

:exit

@echo off
echo Creating superadmin user...

cd backend
python manage.py create_superadmin --username admin --email admin@example.com --password admin123

if %ERRORLEVEL% NEQ 0 (
    echo Trying alternative method...
    python create_superadmin.py admin admin@example.com admin123
)

echo Done!
pause

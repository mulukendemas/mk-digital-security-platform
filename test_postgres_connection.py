import psycopg2
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv('backend/.env')

# Get database credentials from environment variables
db_name = os.environ.get('DB_NAME', 'mkdss_db')
db_user = os.environ.get('DB_USER', 'postgres')
db_password = os.environ.get('DB_PASSWORD', 'admin')
db_host = os.environ.get('DB_HOST', 'localhost')
db_port = os.environ.get('DB_PORT', '5432')

print(f"Attempting to connect to PostgreSQL with:")
print(f"  Database: {db_name}")
print(f"  User: {db_user}")
print(f"  Password: {'*' * len(db_password)}")
print(f"  Host: {db_host}")
print(f"  Port: {db_port}")
print()

try:
    # Try to connect to PostgreSQL
    conn = psycopg2.connect(
        dbname=db_name,
        user=db_user,
        password=db_password,
        host=db_host,
        port=db_port
    )
    
    # If successful, print success message
    print("Connection successful!")
    
    # Close the connection
    conn.close()
    
except Exception as e:
    # If connection fails, print error message
    print(f"Connection failed: {str(e)}")
    
    # Provide troubleshooting tips
    print("\nTroubleshooting tips:")
    print("1. Make sure PostgreSQL is installed and running")
    print("2. Verify that the username and password are correct")
    print("3. Check if the database exists")
    print("4. Ensure that the PostgreSQL server is accepting connections")
    
    # Try to connect to the default 'postgres' database
    print("\nAttempting to connect to the default 'postgres' database...")
    try:
        conn = psycopg2.connect(
            dbname="postgres",
            user=db_user,
            password=db_password,
            host=db_host,
            port=db_port
        )
        print("Connection to 'postgres' database successful!")
        print("The specified database does not exist. You need to create it.")
        conn.close()
    except Exception as e2:
        print(f"Connection to 'postgres' database also failed: {str(e2)}")
        print("This suggests an authentication or connection issue, not a database issue.")

input("\nPress Enter to exit...")

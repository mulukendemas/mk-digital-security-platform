import requests
import json

url = "http://localhost:8000/api/auth/login/"
headers = {"Content-Type": "application/json"}
data = {
    "username": "mkdss",
    "password": "lemlemBEST"
}

response = requests.post(url, headers=headers, json=data)
print(response.status_code)
print(response.json())

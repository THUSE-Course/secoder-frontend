"""
Test script for the mock backend API
Run this to verify all endpoints are working correctly
"""

import requests
import json
import hashlib

BASE_URL = "http://localhost:8080"


def hash_password(password):
    """Hash password using SHA-256 (same as frontend)"""
    return hashlib.sha256(password.encode()).hexdigest()


def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Health check: {response.status_code} - {response.json()}")
    return response.status_code == 200


def test_register():
    """Test user registration"""
    print("\nTesting registration...")

    # Hash password like the frontend does
    password = hash_password("TestPassword123!")

    data = {
        "student_id": "2022010001",
        "rPassword": "registration_password_use_learn_2018_to_distribute",
        "email": "test@example.com",
        "password": password,
    }

    response = requests.post(f"{BASE_URL}/register", json=data)
    print(f"Registration: {response.status_code} - {response.json()}")
    return response.status_code == 200


def test_login():
    """Test user login"""
    print("\nTesting login...")

    # Hash password like the frontend does
    password = hash_password("TestPassword123!")

    data = {"student_id": "2022010001", "password": password}

    response = requests.post(f"{BASE_URL}/login", json=data)
    result = response.json()
    print(f"Login: {response.status_code} - {result}")

    if response.status_code == 200:
        return result.get("token")
    return None


def test_user_info(token):
    """Test getting user info"""
    print("\nTesting user info...")

    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/user", headers=headers)
    print(f"User info: {response.status_code} - {response.json()}")
    return response.status_code == 200


def test_debug():
    """Test debug endpoint"""
    print("\nTesting debug endpoint...")

    response = requests.get(f"{BASE_URL}/debug/users")
    result = response.json()
    print(f"Debug users: {response.status_code}")
    print(f"Registered users: {list(result.get('users', {}).keys())}")
    print(
        f"Predefined users: {list(result.get('predefined_users', {}).keys())}"
    )


def main():
    """Run all tests"""
    print("🚀 Testing Mock Backend API")
    print("=" * 50)

    try:
        # Test health
        if not test_health():
            print("❌ Health check failed - is the server running?")
            return

        # Test registration
        test_register()

        # Test login
        token = test_login()
        if not token:
            print("❌ Login failed - cannot test user info")
            return

        # Test user info
        test_user_info(token)

        # Test debug
        test_debug()

        print("\n✅ All tests completed!")

    except requests.exceptions.ConnectionError:
        print(
            "❌ Connection error - make sure the server is running at http://localhost:8080"
        )
    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    main()

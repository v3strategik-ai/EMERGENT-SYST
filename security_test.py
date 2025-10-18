#!/usr/bin/env python3
"""
Security and Authentication Testing for Agentik Solutions
"""

import requests
import json

BASE_URL = "https://agentik-bi-platform.preview.emergentagent.com/api"

def test_security():
    print("=== TESTING SECURITY VALIDATIONS ===")
    
    # Test 1: Unauthorized access
    response = requests.get(f"{BASE_URL}/crm/leads", timeout=10)
    print(f"Unauthorized access test: {response.status_code} - {response.text}")
    
    # Test 2: Invalid JWT
    headers = {"Authorization": "Bearer invalid_token"}
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=10)
    print(f"Invalid JWT test: {response.status_code} - {response.text}")
    
    # Test 3: Malformed JWT
    headers = {"Authorization": "Bearer malformed.jwt.token"}
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=10)
    print(f"Malformed JWT test: {response.status_code} - {response.text}")
    
    # Test 4: Input validation
    invalid_data = {
        "name": "",
        "email": "invalid-email",
        "company": "Test",
        "value": -1000
    }
    response = requests.post(f"{BASE_URL}/crm/leads", json=invalid_data, timeout=10)
    print(f"Input validation test: {response.status_code} - {response.text}")

if __name__ == "__main__":
    test_security()
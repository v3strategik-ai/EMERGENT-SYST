#!/usr/bin/env python3
"""
Quick Advanced AI Suite Test
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "https://agentik-bi-platform.preview.emergentagent.com/api"
TEST_USER_DATA = {
    "email": "test@agentik.com",
    "password": "test123456"
}

def get_auth_token():
    """Get authentication token"""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json=TEST_USER_DATA,
        timeout=60
    )
    if response.status_code == 200:
        return response.json().get("access_token")
    return None

def test_ai_endpoints():
    """Test key AI endpoints"""
    token = get_auth_token()
    if not token:
        print("❌ Failed to get auth token")
        return
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print("🚀 Testing Advanced AI Suite Endpoints")
    print("=" * 50)
    
    # Test 1: AI Insights Dashboard
    print("\n1. Testing AI Insights Dashboard...")
    try:
        response = requests.get(f"{BASE_URL}/ai-advanced/dashboard/insights", headers=headers, timeout=60)
        if response.status_code == 200:
            data = response.json()
            models = data.get("dashboard", {}).get("models_active", [])
            print(f"✅ AI Dashboard: {len(models)} active models - {', '.join(models)}")
        else:
            print(f"❌ AI Dashboard failed: {response.status_code}")
    except Exception as e:
        print(f"❌ AI Dashboard error: {str(e)}")
    
    # Test 2: Available AI Models
    print("\n2. Testing Available AI Models...")
    try:
        response = requests.get(f"{BASE_URL}/ai-advanced/config/available-models", headers=headers, timeout=60)
        if response.status_code == 200:
            data = response.json()
            total_models = data.get("total_models", 0)
            print(f"✅ Available Models: {total_models} AI models configured")
        else:
            print(f"❌ Available Models failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Available Models error: {str(e)}")
    
    # Test 3: Voice Command Processing (Fast endpoint)
    print("\n3. Testing Voice Command Processing...")
    try:
        voice_data = {
            "command_text": "Show me the sales dashboard",
            "user_context": {"current_page": "dashboard"}
        }
        response = requests.post(f"{BASE_URL}/ai-advanced/copilot/voice-command", json=voice_data, headers=headers, timeout=90)
        if response.status_code == 200:
            data = response.json()
            intent = data.get("intent", "")
            confidence = data.get("confidence", "")
            print(f"✅ Voice Command: Intent '{intent}' with {confidence} confidence")
        else:
            print(f"❌ Voice Command failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Voice Command error: {str(e)}")
    
    # Test 4: AI Preferences Update
    print("\n4. Testing AI Preferences Update...")
    try:
        preferences = {
            "preferred_model": "gpt-5",
            "response_style": "detailed"
        }
        response = requests.post(f"{BASE_URL}/ai-advanced/config/update-preferences", json=preferences, headers=headers, timeout=60)
        if response.status_code == 200:
            data = response.json()
            message = data.get("message", "")
            print(f"✅ AI Preferences: {message}")
        else:
            print(f"❌ AI Preferences failed: {response.status_code}")
    except Exception as e:
        print(f"❌ AI Preferences error: {str(e)}")
    
    print("\n" + "=" * 50)
    print("✅ Advanced AI Suite Quick Test Complete")

if __name__ == "__main__":
    test_ai_endpoints()
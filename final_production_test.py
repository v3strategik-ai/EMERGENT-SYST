#!/usr/bin/env python3
"""
Final Production Readiness Test for Agentik Solutions Backend
"""

import requests
import json
import sys
from datetime import datetime

BASE_URL = "https://agentik-bi-platform.preview.emergentagent.com/api"

class ProductionReadinessTest:
    def __init__(self):
        self.auth_token = None
        self.admin_token = None
        self.results = []
        
    def log_result(self, test, success, message):
        self.results.append({"test": test, "success": success, "message": message})
        status = "✅" if success else "❌"
        print(f"{status} {test}: {message}")
    
    def get_auth_token(self):
        """Get authentication token"""
        user_data = {
            "email": "production.test@agentik.com",
            "password": "ProductionTest2025!",
            "name": "Production Test User",
            "role": "employee"
        }
        
        # Register or login
        response = requests.post(f"{BASE_URL}/auth/register", json=user_data, timeout=10)
        if response.status_code in [200, 400]:  # 400 if exists
            login_data = {"email": user_data["email"], "password": user_data["password"]}
            response = requests.post(f"{BASE_URL}/auth/login", json=login_data, timeout=10)
            if response.status_code == 200:
                self.auth_token = response.json().get("access_token")
                return True
        return False
    
    def test_core_functionality(self):
        """Test core backend functionality"""
        print("\n=== CORE FUNCTIONALITY TESTS ===")
        
        if not self.get_auth_token():
            self.log_result("Authentication", False, "Failed to authenticate")
            return False
        
        self.log_result("Authentication", True, "Successfully authenticated")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test CRM API
        lead_data = {
            "name": "Production Test Lead",
            "email": "test.lead@company.com",
            "company": "Test Company",
            "phone": "+1-555-0100",
            "value": 50000.0,
            "source": "Production Test"
        }
        
        response = requests.post(f"{BASE_URL}/crm/leads", json=lead_data, headers=headers, timeout=10)
        if response.status_code == 200:
            lead_id = response.json().get("id")
            self.log_result("CRM Create Lead", True, f"Lead created: {lead_id}")
            
            # Test read
            response = requests.get(f"{BASE_URL}/crm/leads", headers=headers, timeout=10)
            if response.status_code == 200:
                leads = response.json()
                self.log_result("CRM Read Leads", True, f"Retrieved {len(leads)} leads")
            else:
                self.log_result("CRM Read Leads", False, f"HTTP {response.status_code}")
            
            # Cleanup
            requests.delete(f"{BASE_URL}/crm/leads/{lead_id}", headers=headers, timeout=10)
        else:
            self.log_result("CRM Create Lead", False, f"HTTP {response.status_code}")
        
        # Test AI Copilot
        ai_data = {"query": "Test AI functionality", "session_id": "test-session"}
        response = requests.post(f"{BASE_URL}/ai/query", json=ai_data, headers=headers, timeout=30)
        if response.status_code == 200:
            ai_response = response.json().get("response", "")
            self.log_result("AI Copilot", True, f"AI responded with {len(ai_response)} characters")
        else:
            self.log_result("AI Copilot", False, f"HTTP {response.status_code}")
        
        return True
    
    def test_security(self):
        """Test security measures"""
        print("\n=== SECURITY TESTS ===")
        
        # Test unauthorized access
        response = requests.get(f"{BASE_URL}/crm/leads", timeout=10)
        if response.status_code == 403:
            self.log_result("Unauthorized Access Protection", True, "Properly blocked")
        else:
            self.log_result("Unauthorized Access Protection", False, f"HTTP {response.status_code}")
        
        # Test invalid JWT
        headers = {"Authorization": "Bearer invalid_token"}
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=10)
        if response.status_code == 401:
            self.log_result("JWT Validation", True, "Invalid token rejected")
        else:
            self.log_result("JWT Validation", False, f"HTTP {response.status_code}")
        
        # Test input validation
        invalid_data = {"name": "", "email": "invalid", "company": "Test", "value": -1}
        headers = {"Authorization": f"Bearer {self.auth_token}"} if self.auth_token else {}
        response = requests.post(f"{BASE_URL}/crm/leads", json=invalid_data, headers=headers, timeout=10)
        if response.status_code == 422:
            self.log_result("Input Validation", True, "Invalid data rejected")
        else:
            self.log_result("Input Validation", False, f"HTTP {response.status_code}")
    
    def test_missing_apis(self):
        """Test for missing APIs mentioned in requirements"""
        print("\n=== MISSING API TESTS ===")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"} if self.auth_token else {}
        
        missing_apis = [
            ("/sales/deals", "Sales Suite"),
            ("/finance/reports", "Finance Suite"),
            ("/analytics", "Analytics Suite")
        ]
        
        for endpoint, suite_name in missing_apis:
            response = requests.get(f"{BASE_URL}{endpoint}", headers=headers, timeout=10)
            if response.status_code == 404:
                self.log_result(f"{suite_name} API", False, f"Not implemented: {endpoint}")
            else:
                self.log_result(f"{suite_name} API", True, f"Available: {endpoint}")
    
    def test_performance(self):
        """Test basic performance"""
        print("\n=== PERFORMANCE TESTS ===")
        
        # Test health endpoint response time
        start_time = datetime.now()
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        end_time = datetime.now()
        
        response_time = (end_time - start_time).total_seconds()
        if response.status_code == 200 and response_time < 2.0:
            self.log_result("Health Endpoint Performance", True, f"Response time: {response_time:.2f}s")
        else:
            self.log_result("Health Endpoint Performance", False, f"Slow response: {response_time:.2f}s")
    
    def run_all_tests(self):
        """Run all production readiness tests"""
        print("🚀 AGENTIK SOLUTIONS - PRODUCTION READINESS TEST")
        print("=" * 60)
        
        self.test_core_functionality()
        self.test_security()
        self.test_missing_apis()
        self.test_performance()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 PRODUCTION READINESS SUMMARY")
        print("=" * 60)
        
        total = len(self.results)
        passed = sum(1 for r in self.results if r["success"])
        failed = total - passed
        
        print(f"Total Tests: {total}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        # Critical failures
        critical_failures = [r for r in self.results if not r["success"] and 
                           any(keyword in r["test"].lower() for keyword in 
                               ["auth", "security", "crm", "ai"])]
        
        missing_apis = [r for r in self.results if not r["success"] and "api" in r["test"].lower()]
        
        if critical_failures:
            print("\n🚨 CRITICAL FAILURES:")
            for result in critical_failures:
                print(f"  ❌ {result['test']}: {result['message']}")
        
        if missing_apis:
            print("\n⚠️  MISSING APIS (Implementation Required):")
            for result in missing_apis:
                print(f"  ⚠️  {result['test']}: {result['message']}")
        
        # Final assessment
        if len(critical_failures) == 0:
            if len(missing_apis) == 0:
                print("\n🎉 FULLY PRODUCTION READY!")
            else:
                print("\n✅ CORE FUNCTIONALITY PRODUCTION READY")
                print("   (Missing APIs need implementation for complete platform)")
        else:
            print("\n🚫 NOT PRODUCTION READY - Critical issues must be resolved")
        
        print("=" * 60)
        return len(critical_failures) == 0

if __name__ == "__main__":
    tester = ProductionReadinessTest()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)
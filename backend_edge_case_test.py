#!/usr/bin/env python3
"""
Edge Case Testing for Agentik Solutions Backend
Tests error handling, authentication edge cases, and data validation
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://agentik-bi-platform.preview.emergentagent.com/api"

class EdgeCaseTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def make_request(self, method, endpoint, data=None, headers=None, auth_required=True):
        """Make HTTP request with proper error handling"""
        url = f"{BASE_URL}{endpoint}"
        
        # Set up headers
        req_headers = {"Content-Type": "application/json"}
        if headers:
            req_headers.update(headers)
        
        # Add auth token if required and available
        if auth_required and self.auth_token:
            req_headers["Authorization"] = f"Bearer {self.auth_token}"
        
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=req_headers, timeout=30)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=req_headers, timeout=30)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=req_headers, timeout=30)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=req_headers, timeout=30)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            return response
        except requests.exceptions.Timeout:
            return None
        except requests.exceptions.ConnectionError:
            return None
        except Exception as e:
            print(f"Request error: {str(e)}")
            return None
    
    def setup_auth(self):
        """Setup authentication for testing"""
        login_data = {"email": "test@agentik.com", "password": "test123456"}
        response = self.make_request("POST", "/auth/login", login_data, auth_required=False)
        if response and response.status_code == 200:
            data = response.json()
            self.auth_token = data.get("access_token")
            return True
        return False
    
    def test_authentication_edge_cases(self):
        """Test authentication edge cases"""
        print("\n=== TESTING AUTHENTICATION EDGE CASES ===")
        
        # Test invalid login credentials
        invalid_login = {"email": "nonexistent@example.com", "password": "wrongpassword"}
        response = self.make_request("POST", "/auth/login", invalid_login, auth_required=False)
        if response and response.status_code == 401:
            self.log_result("Invalid Login Credentials", True, "Correctly rejected invalid credentials")
        else:
            self.log_result("Invalid Login Credentials", False, f"Expected 401, got {response.status_code if response else 'No response'}")
        
        # Test malformed email registration
        invalid_email_data = {
            "email": "not-an-email",
            "password": "test123456",
            "name": "Test User",
            "role": "employee"
        }
        response = self.make_request("POST", "/auth/register", invalid_email_data, auth_required=False)
        if response and response.status_code == 422:  # Validation error
            self.log_result("Invalid Email Registration", True, "Correctly rejected malformed email")
        else:
            self.log_result("Invalid Email Registration", False, f"Expected 422, got {response.status_code if response else 'No response'}")
        
        # Test accessing protected endpoint without token
        response = self.make_request("GET", "/auth/me", auth_required=False)
        if response and response.status_code == 403:  # Forbidden without auth
            self.log_result("No Auth Token Access", True, "Correctly blocked access without token")
        else:
            self.log_result("No Auth Token Access", False, f"Expected 403, got {response.status_code if response else 'No response'}")
        
        # Test with invalid token
        invalid_headers = {"Authorization": "Bearer invalid-token-here"}
        response = self.make_request("GET", "/auth/me", headers=invalid_headers, auth_required=False)
        if response and response.status_code == 401:
            self.log_result("Invalid Auth Token", True, "Correctly rejected invalid token")
        else:
            self.log_result("Invalid Auth Token", False, f"Expected 401, got {response.status_code if response else 'No response'}")
    
    def test_data_validation(self):
        """Test data validation edge cases"""
        print("\n=== TESTING DATA VALIDATION ===")
        
        if not self.auth_token:
            self.log_result("Data Validation", False, "No authentication token available")
            return
        
        # Test creating lead with missing required fields
        incomplete_lead = {"name": "Test Lead"}  # Missing email, company, value
        response = self.make_request("POST", "/crm/leads", incomplete_lead)
        if response and response.status_code == 422:
            self.log_result("Incomplete Lead Data", True, "Correctly rejected incomplete lead data")
        else:
            self.log_result("Incomplete Lead Data", False, f"Expected 422, got {response.status_code if response else 'No response'}")
        
        # Test creating quote with invalid items
        invalid_quote = {
            "client_name": "Test Client",
            "client_email": "test@example.com",
            "items": "not-a-list",  # Should be a list
            "tax_rate": 0.08
        }
        response = self.make_request("POST", "/cpq/quotes", invalid_quote)
        if response and response.status_code == 422:
            self.log_result("Invalid Quote Items", True, "Correctly rejected invalid quote items")
        else:
            self.log_result("Invalid Quote Items", False, f"Expected 422, got {response.status_code if response else 'No response'}")
        
        # Test creating transaction with negative amount
        negative_transaction = {
            "customer_name": "Test Customer",
            "customer_email": "test@example.com",
            "amount": -100.0,  # Negative amount
            "gateway": "Stripe",
            "payment_method": "Credit Card"
        }
        response = self.make_request("POST", "/payments/transactions", negative_transaction)
        # Note: This might be allowed depending on business logic (refunds), so we check if it's handled gracefully
        if response and response.status_code in [200, 400, 422]:
            self.log_result("Negative Transaction Amount", True, f"Handled negative amount appropriately (HTTP {response.status_code})")
        else:
            self.log_result("Negative Transaction Amount", False, f"Unexpected response: {response.status_code if response else 'No response'}")
    
    def test_resource_not_found(self):
        """Test accessing non-existent resources"""
        print("\n=== TESTING RESOURCE NOT FOUND ===")
        
        if not self.auth_token:
            self.log_result("Resource Not Found", False, "No authentication token available")
            return
        
        # Test getting non-existent lead
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = self.make_request("PUT", f"/crm/leads/{fake_id}", {"status": "Qualified"})
        if response and response.status_code == 404:
            self.log_result("Non-existent Lead Update", True, "Correctly returned 404 for non-existent lead")
        else:
            self.log_result("Non-existent Lead Update", False, f"Expected 404, got {response.status_code if response else 'No response'}")
        
        # Test deleting non-existent workflow
        response = self.make_request("DELETE", f"/automation/workflows/{fake_id}")
        if response and response.status_code == 404:
            self.log_result("Non-existent Workflow Delete", True, "Correctly returned 404 for non-existent workflow")
        else:
            self.log_result("Non-existent Workflow Delete", False, f"Expected 404, got {response.status_code if response else 'No response'}")
    
    def test_ai_copilot_edge_cases(self):
        """Test AI Copilot edge cases"""
        print("\n=== TESTING AI COPILOT EDGE CASES ===")
        
        if not self.auth_token:
            self.log_result("AI Copilot Edge Cases", False, "No authentication token available")
            return
        
        # Test empty query
        empty_query = {"query": ""}
        response = self.make_request("POST", "/ai/query", empty_query)
        if response and response.status_code in [200, 400]:
            self.log_result("Empty AI Query", True, f"Handled empty query appropriately (HTTP {response.status_code})")
        else:
            self.log_result("Empty AI Query", False, f"Unexpected response: {response.status_code if response else 'No response'}")
        
        # Test very long query
        long_query = {"query": "A" * 10000}  # 10k character query
        response = self.make_request("POST", "/ai/query", long_query)
        if response and response.status_code in [200, 400, 413]:  # 413 = Payload Too Large
            self.log_result("Long AI Query", True, f"Handled long query appropriately (HTTP {response.status_code})")
        else:
            self.log_result("Long AI Query", False, f"Unexpected response: {response.status_code if response else 'No response'}")
        
        # Test malformed data analysis request
        malformed_analysis = {
            "data": "not-a-dict",  # Should be a dict
            "question": "What can you tell me?"
        }
        response = self.make_request("POST", "/ai/analyze", malformed_analysis)
        if response and response.status_code in [200, 422]:
            self.log_result("Malformed AI Analysis", True, f"Handled malformed data appropriately (HTTP {response.status_code})")
        else:
            self.log_result("Malformed AI Analysis", False, f"Unexpected response: {response.status_code if response else 'No response'}")
    
    def test_admin_access_control(self):
        """Test admin access control"""
        print("\n=== TESTING ADMIN ACCESS CONTROL ===")
        
        if not self.auth_token:
            self.log_result("Admin Access Control", False, "No authentication token available")
            return
        
        # Test accessing admin endpoints with regular user token
        response = self.make_request("GET", "/admin/users")
        if response and response.status_code == 403:
            self.log_result("Regular User Admin Access", True, "Correctly blocked regular user from admin endpoints")
        else:
            self.log_result("Regular User Admin Access", False, f"Expected 403, got {response.status_code if response else 'No response'}")
        
        response = self.make_request("GET", "/admin/analytics")
        if response and response.status_code == 403:
            self.log_result("Regular User Analytics Access", True, "Correctly blocked regular user from analytics")
        else:
            self.log_result("Regular User Analytics Access", False, f"Expected 403, got {response.status_code if response else 'No response'}")
    
    def run_all_tests(self):
        """Run all edge case tests"""
        print("🔍 Starting Agentik Solutions Backend Edge Case Tests")
        print(f"🔗 Testing against: {BASE_URL}")
        print("=" * 60)
        
        # Setup authentication
        if not self.setup_auth():
            print("❌ Failed to setup authentication, some tests will be skipped")
        
        # Run tests
        tests = [
            ("Authentication Edge Cases", self.test_authentication_edge_cases),
            ("Data Validation", self.test_data_validation),
            ("Resource Not Found", self.test_resource_not_found),
            ("AI Copilot Edge Cases", self.test_ai_copilot_edge_cases),
            ("Admin Access Control", self.test_admin_access_control)
        ]
        
        for test_name, test_func in tests:
            try:
                test_func()
            except Exception as e:
                self.log_result(test_name, False, f"Test failed with exception: {str(e)}")
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 EDGE CASE TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  ❌ {result['test']}: {result['message']}")
        
        print("\n" + "=" * 60)
        
        # Return success status
        return failed_tests == 0

if __name__ == "__main__":
    tester = EdgeCaseTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)
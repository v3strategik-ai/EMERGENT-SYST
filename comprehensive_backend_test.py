#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Agentik Solutions - Production Readiness
Tests all authentication, suite functionality, and missing APIs
"""

import requests
import json
import sys
from datetime import datetime
import uuid

# Configuration
BASE_URL = "https://agentik-bi-platform.preview.emergentagent.com/api"
TEST_USER_DATA = {
    "email": "sarah.johnson@agentik.com",
    "password": "SecurePass2025!",
    "name": "Sarah Johnson",
    "role": "employee"
}

TEST_ADMIN_DATA = {
    "email": "admin.manager@agentik.com", 
    "password": "AdminSecure2025!",
    "name": "Admin Manager",
    "role": "admin"
}

class ComprehensiveBackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.admin_token = None
        self.test_results = []
        self.created_resources = []
        
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
    
    def test_health_and_root(self):
        """Test basic health and root endpoints"""
        print("\n=== TESTING HEALTH & ROOT ENDPOINTS ===")
        
        # Test root endpoint
        response = self.make_request("GET", "/", auth_required=False)
        if response and response.status_code == 200:
            try:
                data = response.json()
                self.log_result("Root Endpoint", True, f"API root accessible - {data.get('message', 'OK')}")
            except:
                self.log_result("Root Endpoint", False, "Invalid JSON response")
        else:
            self.log_result("Root Endpoint", False, f"HTTP {response.status_code if response else 'No response'}")
        
        # Test health endpoint
        response = self.make_request("GET", "/health", auth_required=False)
        if response and response.status_code == 200:
            try:
                data = response.json()
                self.log_result("Health Check", True, f"API is healthy - {data.get('status')}")
                return True
            except:
                self.log_result("Health Check", False, "Invalid JSON response")
                return False
        else:
            self.log_result("Health Check", False, f"HTTP {response.status_code if response else 'No response'}")
            return False
    
    def test_authentication_comprehensive(self):
        """Test authentication endpoints comprehensively"""
        print("\n=== TESTING AUTHENTICATION (COMPREHENSIVE) ===")
        
        # Test user registration
        response = self.make_request("POST", "/auth/register", TEST_USER_DATA, auth_required=False)
        if response and response.status_code == 200:
            try:
                data = response.json()
                self.auth_token = data.get("access_token")
                user_info = data.get("user", {})
                self.log_result("User Registration", True, f"User registered: {user_info.get('name')}")
            except:
                self.log_result("User Registration", False, "Invalid JSON response")
                return False
        elif response and response.status_code == 400:
            # User exists, try login
            self.log_result("User Registration", True, "User already exists (expected)")
        else:
            self.log_result("User Registration", False, f"HTTP {response.status_code if response else 'No response'}")
            return False
        
        # Test user login
        login_data = {"email": TEST_USER_DATA["email"], "password": TEST_USER_DATA["password"]}
        response = self.make_request("POST", "/auth/login", login_data, auth_required=False)
        if response and response.status_code == 200:
            try:
                data = response.json()
                self.auth_token = data.get("access_token")
                user_info = data.get("user", {})
                self.log_result("User Login", True, f"Login successful for {user_info.get('name')}")
            except:
                self.log_result("User Login", False, "Invalid JSON response")
                return False
        else:
            self.log_result("User Login", False, f"HTTP {response.status_code if response else 'No response'}")
            return False
        
        # Test get current user
        response = self.make_request("GET", "/auth/me")
        if response and response.status_code == 200:
            try:
                user_data = response.json()
                self.log_result("Get Current User", True, f"Retrieved user: {user_data.get('name')}")
            except:
                self.log_result("Get Current User", False, "Invalid JSON response")
                return False
        else:
            self.log_result("Get Current User", False, f"HTTP {response.status_code if response else 'No response'}")
            return False
        
        # Test admin registration and login
        response = self.make_request("POST", "/auth/register", TEST_ADMIN_DATA, auth_required=False)
        if response and response.status_code in [200, 400]:  # 400 if already exists
            admin_login = {"email": TEST_ADMIN_DATA["email"], "password": TEST_ADMIN_DATA["password"]}
            response = self.make_request("POST", "/auth/login", admin_login, auth_required=False)
            if response and response.status_code == 200:
                try:
                    data = response.json()
                    self.admin_token = data.get("access_token")
                    self.log_result("Admin Login", True, "Admin login successful")
                except:
                    self.log_result("Admin Login", False, "Invalid JSON response")
            else:
                self.log_result("Admin Login", False, f"HTTP {response.status_code if response else 'No response'}")
        
        # Test JWT token validation
        if self.auth_token:
            # Test with invalid token
            original_token = self.auth_token
            self.auth_token = "invalid_token"
            response = self.make_request("GET", "/auth/me")
            if response and response.status_code == 401:
                self.log_result("JWT Token Validation", True, "Invalid token properly rejected")
            else:
                self.log_result("JWT Token Validation", False, "Invalid token not properly rejected")
            self.auth_token = original_token
        
        return self.auth_token is not None
    
    def test_role_based_access_control(self):
        """Test role-based access control"""
        print("\n=== TESTING ROLE-BASED ACCESS CONTROL ===")
        
        if not self.auth_token:
            self.log_result("RBAC Test", False, "No authentication token available")
            return False
        
        # Test employee access to admin endpoints (should fail)
        response = self.make_request("GET", "/admin/users")
        if response and response.status_code == 403:
            self.log_result("Employee Admin Access", True, "Employee correctly denied admin access")
        else:
            self.log_result("Employee Admin Access", False, f"Employee access not properly restricted: {response.status_code if response else 'No response'}")
        
        # Test admin access if admin token available
        if self.admin_token:
            original_token = self.auth_token
            self.auth_token = self.admin_token
            
            response = self.make_request("GET", "/admin/users")
            if response and response.status_code == 200:
                self.log_result("Admin Access", True, "Admin access working correctly")
            else:
                self.log_result("Admin Access", False, f"Admin access failed: {response.status_code if response else 'No response'}")
            
            self.auth_token = original_token
        
        return True
    
    def test_all_suite_apis_comprehensive(self):
        """Test all suite APIs comprehensively"""
        print("\n=== TESTING ALL SUITE APIS (COMPREHENSIVE) ===")
        
        if not self.auth_token:
            self.log_result("Suite APIs", False, "No authentication token available")
            return False
        
        # Test CRM Suite - Full CRUD
        self.test_crm_full_crud()
        
        # Test Automation Suite - Full CRUD
        self.test_automation_full_crud()
        
        # Test CPQ Suite - Full CRUD
        self.test_cpq_full_crud()
        
        # Test Documents Suite - CRUD
        self.test_documents_crud()
        
        # Test Payments Suite - CRUD
        self.test_payments_crud()
        
        # Test missing suites (Sales, Finance, Analytics)
        self.test_missing_suites()
        
        return True
    
    def test_crm_full_crud(self):
        """Test CRM Suite full CRUD operations"""
        print("\n--- CRM Suite Full CRUD ---")
        
        # CREATE
        lead_data = {
            "name": "Michael Chen",
            "email": "michael.chen@techcorp.com",
            "company": "TechCorp Solutions",
            "phone": "+1-555-0199",
            "value": 75000.0,
            "source": "LinkedIn"
        }
        
        response = self.make_request("POST", "/crm/leads", lead_data)
        lead_id = None
        if response and response.status_code == 200:
            try:
                data = response.json()
                lead_id = data.get("id")
                self.created_resources.append(("lead", lead_id))
                self.log_result("CRM Create Lead", True, f"Lead created: {lead_id}")
            except:
                self.log_result("CRM Create Lead", False, "Invalid JSON response")
        else:
            self.log_result("CRM Create Lead", False, f"HTTP {response.status_code if response else 'No response'}")
        
        # READ (GET ALL)
        response = self.make_request("GET", "/crm/leads")
        if response and response.status_code == 200:
            try:
                leads = response.json()
                self.log_result("CRM Get All Leads", True, f"Retrieved {len(leads)} leads")
            except:
                self.log_result("CRM Get All Leads", False, "Invalid JSON response")
        else:
            self.log_result("CRM Get All Leads", False, f"HTTP {response.status_code if response else 'No response'}")
        
        # UPDATE
        if lead_id:
            update_data = {"status": "Qualified", "value": 85000.0}
            response = self.make_request("PUT", f"/crm/leads/{lead_id}", update_data)
            if response and response.status_code == 200:
                self.log_result("CRM Update Lead", True, "Lead updated successfully")
            else:
                self.log_result("CRM Update Lead", False, f"HTTP {response.status_code if response else 'No response'}")
        
        # DELETE (will be done in cleanup)
    
    def test_automation_full_crud(self):
        """Test Automation Suite full CRUD operations"""
        print("\n--- Automation Suite Full CRUD ---")
        
        # CREATE
        workflow_data = {
            "name": "Customer Onboarding Automation",
            "description": "Automated workflow for new customer onboarding process",
            "trigger_type": "Event-based",
            "action_type": "Send Welcome Email",
            "frequency": "Immediate"
        }
        
        response = self.make_request("POST", "/automation/workflows", workflow_data)
        workflow_id = None
        if response and response.status_code == 200:
            try:
                data = response.json()
                workflow_id = data.get("id")
                self.created_resources.append(("workflow", workflow_id))
                self.log_result("Automation Create Workflow", True, f"Workflow created: {workflow_id}")
            except:
                self.log_result("Automation Create Workflow", False, "Invalid JSON response")
        else:
            self.log_result("Automation Create Workflow", False, f"HTTP {response.status_code if response else 'No response'}")
        
        # READ
        response = self.make_request("GET", "/automation/workflows")
        if response and response.status_code == 200:
            try:
                workflows = response.json()
                self.log_result("Automation Get Workflows", True, f"Retrieved {len(workflows)} workflows")
            except:
                self.log_result("Automation Get Workflows", False, "Invalid JSON response")
        else:
            self.log_result("Automation Get Workflows", False, f"HTTP {response.status_code if response else 'No response'}")
        
        # UPDATE
        if workflow_id:
            update_data = {"status": "Paused", "frequency": "Weekly"}
            response = self.make_request("PUT", f"/automation/workflows/{workflow_id}", update_data)
            if response and response.status_code == 200:
                self.log_result("Automation Update Workflow", True, "Workflow updated successfully")
            else:
                self.log_result("Automation Update Workflow", False, f"HTTP {response.status_code if response else 'No response'}")
    
    def test_cpq_full_crud(self):
        """Test CPQ Suite full CRUD operations"""
        print("\n--- CPQ Suite Full CRUD ---")
        
        # CREATE
        quote_data = {
            "client_name": "Global Enterprises Inc",
            "client_email": "procurement@globalent.com",
            "items": [
                {"name": "Enterprise Software License", "quantity": 50, "price": 200.0},
                {"name": "Premium Support Package", "quantity": 1, "price": 2500.0},
                {"name": "Training Services", "quantity": 5, "price": 800.0}
            ],
            "tax_rate": 0.095
        }
        
        response = self.make_request("POST", "/cpq/quotes", quote_data)
        quote_id = None
        if response and response.status_code == 200:
            try:
                data = response.json()
                quote_id = data.get("id")
                self.created_resources.append(("quote", quote_id))
                self.log_result("CPQ Create Quote", True, f"Quote created: {quote_id}")
            except:
                self.log_result("CPQ Create Quote", False, "Invalid JSON response")
        else:
            self.log_result("CPQ Create Quote", False, f"HTTP {response.status_code if response else 'No response'}")
        
        # READ
        response = self.make_request("GET", "/cpq/quotes")
        if response and response.status_code == 200:
            try:
                quotes = response.json()
                self.log_result("CPQ Get Quotes", True, f"Retrieved {len(quotes)} quotes")
            except:
                self.log_result("CPQ Get Quotes", False, "Invalid JSON response")
        else:
            self.log_result("CPQ Get Quotes", False, f"HTTP {response.status_code if response else 'No response'}")
        
        # UPDATE
        if quote_id:
            update_data = {"status": "Approved"}
            response = self.make_request("PUT", f"/cpq/quotes/{quote_id}", update_data)
            if response and response.status_code == 200:
                self.log_result("CPQ Update Quote", True, "Quote updated successfully")
            else:
                self.log_result("CPQ Update Quote", False, f"HTTP {response.status_code if response else 'No response'}")
    
    def test_documents_crud(self):
        """Test Documents Suite CRUD operations"""
        print("\n--- Documents Suite CRUD ---")
        
        # CREATE
        doc_data = {
            "name": "Enterprise Contract Template",
            "file_type": "DOCX",
            "file_size": 2048000,
            "category": "Legal Templates",
            "template_used": "Standard Enterprise Agreement"
        }
        
        response = self.make_request("POST", "/documents", doc_data)
        doc_id = None
        if response and response.status_code == 200:
            try:
                data = response.json()
                doc_id = data.get("id")
                self.created_resources.append(("document", doc_id))
                self.log_result("Documents Create", True, f"Document created: {doc_id}")
            except:
                self.log_result("Documents Create", False, "Invalid JSON response")
        else:
            self.log_result("Documents Create", False, f"HTTP {response.status_code if response else 'No response'}")
        
        # READ
        response = self.make_request("GET", "/documents")
        if response and response.status_code == 200:
            try:
                documents = response.json()
                self.log_result("Documents Get All", True, f"Retrieved {len(documents)} documents")
            except:
                self.log_result("Documents Get All", False, "Invalid JSON response")
        else:
            self.log_result("Documents Get All", False, f"HTTP {response.status_code if response else 'No response'}")
    
    def test_payments_crud(self):
        """Test Payments Suite CRUD operations"""
        print("\n--- Payments Suite CRUD ---")
        
        # CREATE
        trans_data = {
            "customer_name": "Jennifer Williams",
            "customer_email": "jennifer.williams@company.com",
            "amount": 3500.00,
            "gateway": "PayPal",
            "payment_method": "PayPal Account"
        }
        
        response = self.make_request("POST", "/payments/transactions", trans_data)
        if response and response.status_code == 200:
            try:
                data = response.json()
                trans_id = data.get("id")
                self.created_resources.append(("transaction", trans_id))
                self.log_result("Payments Create Transaction", True, f"Transaction created: {trans_id}")
            except:
                self.log_result("Payments Create Transaction", False, "Invalid JSON response")
        else:
            self.log_result("Payments Create Transaction", False, f"HTTP {response.status_code if response else 'No response'}")
        
        # READ
        response = self.make_request("GET", "/payments/transactions")
        if response and response.status_code == 200:
            try:
                transactions = response.json()
                self.log_result("Payments Get Transactions", True, f"Retrieved {len(transactions)} transactions")
            except:
                self.log_result("Payments Get Transactions", False, "Invalid JSON response")
        else:
            self.log_result("Payments Get Transactions", False, f"HTTP {response.status_code if response else 'No response'}")
    
    def test_missing_suites(self):
        """Test for missing suite APIs mentioned in user request"""
        print("\n--- Testing Missing Suite APIs ---")
        
        # Test Sales Suite
        response = self.make_request("GET", "/sales/deals")
        if response and response.status_code == 404:
            self.log_result("Sales Suite API", False, "Sales Suite API not implemented (/api/sales/deals)")
        elif response and response.status_code == 200:
            self.log_result("Sales Suite API", True, "Sales Suite API available")
        else:
            self.log_result("Sales Suite API", False, f"Sales Suite API error: {response.status_code if response else 'No response'}")
        
        # Test Finance Suite
        response = self.make_request("GET", "/finance/reports")
        if response and response.status_code == 404:
            self.log_result("Finance Suite API", False, "Finance Suite API not implemented (/api/finance/reports)")
        elif response and response.status_code == 200:
            self.log_result("Finance Suite API", True, "Finance Suite API available")
        else:
            self.log_result("Finance Suite API", False, f"Finance Suite API error: {response.status_code if response else 'No response'}")
        
        # Test Analytics Suite
        response = self.make_request("GET", "/analytics")
        if response and response.status_code == 404:
            self.log_result("Analytics Suite API", False, "Analytics Suite API not implemented (/api/analytics)")
        elif response and response.status_code == 200:
            self.log_result("Analytics Suite API", True, "Analytics Suite API available")
        else:
            self.log_result("Analytics Suite API", False, f"Analytics Suite API error: {response.status_code if response else 'No response'}")
    
    def test_ai_copilot_comprehensive(self):
        """Test AI Copilot Integration comprehensively"""
        print("\n=== TESTING AI COPILOT (COMPREHENSIVE) ===")
        
        if not self.auth_token:
            self.log_result("AI Copilot", False, "No authentication token available")
            return False
        
        # Test AI query
        query_data = {
            "query": "Analyze our Q4 sales performance and provide actionable insights for improving conversion rates",
            "session_id": str(uuid.uuid4())
        }
        
        response = self.make_request("POST", "/ai/query", query_data)
        if response and response.status_code == 200:
            try:
                data = response.json()
                ai_response = data.get("response", "")
                session_id = data.get("session_id", "")
                self.log_result("AI Query Processing", True, f"AI responded with {len(ai_response)} characters, session: {session_id[:8]}...")
            except:
                self.log_result("AI Query Processing", False, "Invalid JSON response")
        else:
            self.log_result("AI Query Processing", False, f"HTTP {response.status_code if response else 'No response'}")
        
        # Test AI data analysis
        analysis_data = {
            "data": {
                "revenue": 250000,
                "customers": 450,
                "conversion_rate": 0.18,
                "avg_deal_size": 5555,
                "churn_rate": 0.05
            },
            "question": "What are the key performance indicators and recommendations for business growth?"
        }
        
        response = self.make_request("POST", "/ai/analyze", analysis_data)
        if response and response.status_code == 200:
            try:
                data = response.json()
                analysis = data.get("analysis", "")
                self.log_result("AI Data Analysis", True, f"Analysis completed with {len(analysis)} characters")
            except:
                self.log_result("AI Data Analysis", False, "Invalid JSON response")
        else:
            self.log_result("AI Data Analysis", False, f"HTTP {response.status_code if response else 'No response'}")
        
        # Test AI report generation
        report_data = {
            "quarterly_revenue": 750000,
            "new_customers": 125,
            "customer_satisfaction": 4.2,
            "market_share": 0.15
        }
        
        response = self.make_request("POST", "/ai/report/quarterly", report_data)
        if response and response.status_code == 200:
            try:
                data = response.json()
                report = data.get("report", "")
                self.log_result("AI Report Generation", True, f"Report generated with {len(report)} characters")
            except:
                self.log_result("AI Report Generation", False, "Invalid JSON response")
        else:
            self.log_result("AI Report Generation", False, f"HTTP {response.status_code if response else 'No response'}")
        
        return True
    
    def test_data_integrity_and_performance(self):
        """Test data integrity and performance"""
        print("\n=== TESTING DATA INTEGRITY & PERFORMANCE ===")
        
        if not self.auth_token:
            self.log_result("Data Integrity", False, "No authentication token available")
            return False
        
        # Test cross-suite data consistency
        # Create a lead and verify it appears in analytics
        lead_data = {
            "name": "Performance Test Lead",
            "email": "perf.test@example.com",
            "company": "Performance Testing Corp",
            "phone": "+1-555-9999",
            "value": 100000.0,
            "source": "Performance Test"
        }
        
        start_time = datetime.now()
        response = self.make_request("POST", "/crm/leads", lead_data)
        end_time = datetime.now()
        
        if response and response.status_code == 200:
            response_time = (end_time - start_time).total_seconds()
            if response_time < 5.0:  # Should respond within 5 seconds
                self.log_result("API Response Time", True, f"Create lead response time: {response_time:.2f}s")
            else:
                self.log_result("API Response Time", False, f"Slow response time: {response_time:.2f}s")
            
            try:
                data = response.json()
                lead_id = data.get("id")
                self.created_resources.append(("lead", lead_id))
                
                # Verify data persistence
                response = self.make_request("GET", "/crm/leads")
                if response and response.status_code == 200:
                    leads = response.json()
                    found_lead = any(lead.get("id") == lead_id for lead in leads)
                    if found_lead:
                        self.log_result("Data Persistence", True, "Created lead found in database")
                    else:
                        self.log_result("Data Persistence", False, "Created lead not found in database")
                
            except:
                self.log_result("Data Integrity", False, "Invalid JSON response")
        else:
            self.log_result("Data Integrity", False, f"HTTP {response.status_code if response else 'No response'}")
        
        return True
    
    def test_security_validations(self):
        """Test security validations"""
        print("\n=== TESTING SECURITY VALIDATIONS ===")
        
        # Test unauthorized access
        original_token = self.auth_token
        self.auth_token = None
        
        response = self.make_request("GET", "/crm/leads")
        if response and response.status_code == 401:
            self.log_result("Unauthorized Access Protection", True, "Unauthorized access properly blocked")
        else:
            self.log_result("Unauthorized Access Protection", False, f"Unauthorized access not blocked: {response.status_code if response else 'No response'}")
        
        self.auth_token = original_token
        
        # Test malformed JWT
        self.auth_token = "malformed.jwt.token"
        response = self.make_request("GET", "/crm/leads")
        if response and response.status_code == 401:
            self.log_result("Malformed JWT Protection", True, "Malformed JWT properly rejected")
        else:
            self.log_result("Malformed JWT Protection", False, f"Malformed JWT not rejected: {response.status_code if response else 'No response'}")
        
        self.auth_token = original_token
        
        # Test input validation
        invalid_lead_data = {
            "name": "",  # Empty name
            "email": "invalid-email",  # Invalid email
            "company": "Test Corp",
            "value": -1000.0  # Negative value
        }
        
        response = self.make_request("POST", "/crm/leads", invalid_lead_data)
        if response and response.status_code == 422:  # Validation error
            self.log_result("Input Validation", True, "Invalid input properly rejected")
        else:
            self.log_result("Input Validation", False, f"Invalid input not rejected: {response.status_code if response else 'No response'}")
        
        return True
    
    def cleanup_resources(self):
        """Clean up created test resources"""
        print("\n=== CLEANING UP TEST RESOURCES ===")
        
        for resource_type, resource_id in self.created_resources:
            if resource_type == "lead":
                response = self.make_request("DELETE", f"/crm/leads/{resource_id}")
            elif resource_type == "workflow":
                response = self.make_request("DELETE", f"/automation/workflows/{resource_id}")
            elif resource_type == "quote":
                response = self.make_request("DELETE", f"/cpq/quotes/{resource_id}")
            elif resource_type == "document":
                response = self.make_request("DELETE", f"/documents/{resource_id}")
            elif resource_type == "transaction":
                # Transactions typically can't be deleted, skip
                continue
            
            if response and response.status_code == 200:
                print(f"✅ Cleaned up {resource_type}: {resource_id}")
            else:
                print(f"⚠️  Failed to clean up {resource_type}: {resource_id}")
    
    def run_comprehensive_tests(self):
        """Run all comprehensive backend tests"""
        print("🚀 Starting Agentik Solutions Comprehensive Backend API Tests")
        print("🎯 Production Readiness Validation")
        print(f"🔗 Testing against: {BASE_URL}")
        print("=" * 80)
        
        # Run tests in order
        tests = [
            ("Health & Root Endpoints", self.test_health_and_root),
            ("Authentication (Comprehensive)", self.test_authentication_comprehensive),
            ("Role-Based Access Control", self.test_role_based_access_control),
            ("All Suite APIs (Comprehensive)", self.test_all_suite_apis_comprehensive),
            ("AI Copilot (Comprehensive)", self.test_ai_copilot_comprehensive),
            ("Data Integrity & Performance", self.test_data_integrity_and_performance),
            ("Security Validations", self.test_security_validations)
        ]
        
        for test_name, test_func in tests:
            try:
                test_func()
            except Exception as e:
                self.log_result(test_name, False, f"Test failed with exception: {str(e)}")
        
        # Cleanup
        self.cleanup_resources()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE TEST SUMMARY - PRODUCTION READINESS")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Categorize results
        critical_failures = []
        minor_issues = []
        
        for result in self.test_results:
            if not result["success"]:
                if any(keyword in result["test"].lower() for keyword in ["auth", "security", "api", "suite"]):
                    critical_failures.append(result)
                else:
                    minor_issues.append(result)
        
        if critical_failures:
            print("\n🚨 CRITICAL FAILURES (Production Blockers):")
            for result in critical_failures:
                print(f"  ❌ {result['test']}: {result['message']}")
        
        if minor_issues:
            print("\n⚠️  MINOR ISSUES:")
            for result in minor_issues:
                print(f"  ⚠️  {result['test']}: {result['message']}")
        
        # Production readiness assessment
        if failed_tests == 0:
            print("\n🎉 PRODUCTION READY: All tests passed!")
        elif len(critical_failures) == 0:
            print("\n✅ PRODUCTION READY: No critical failures detected")
        else:
            print("\n🚫 NOT PRODUCTION READY: Critical failures must be resolved")
        
        print("\n" + "=" * 80)
        
        # Return success status
        return len(critical_failures) == 0

if __name__ == "__main__":
    tester = ComprehensiveBackendTester()
    success = tester.run_comprehensive_tests()
    sys.exit(0 if success else 1)
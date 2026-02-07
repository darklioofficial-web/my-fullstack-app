#!/usr/bin/env python3

import requests
import sys
import json
import base64
from datetime import datetime
import time
import os

class EarnKaroAPITester:
    def __init__(self, base_url="https://student-earn.preview.emergentagent.com"):
        self.base_url = base_url
        self.user_token = None
        self.admin_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, message="", response_data=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        result = {
            "test": name,
            "status": status,
            "message": message,
            "response": response_data
        }
        self.test_results.append(result)
        print(f"{status} - {name}: {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)
        
        if self.user_token and 'Authorization' not in default_headers:
            default_headers['Authorization'] = f'Bearer {self.user_token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers)
            elif method == 'POST':
                if files:
                    # Remove Content-Type for multipart/form-data
                    headers_copy = default_headers.copy()
                    headers_copy.pop('Content-Type', None)
                    response = requests.post(url, data=data, files=files, headers=headers_copy)
                else:
                    response = requests.post(url, json=data, headers=default_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=default_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=default_headers)

            success = response.status_code == expected_status
            
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text}

            message = f"Status: {response.status_code}"
            if not success:
                message += f" (Expected: {expected_status})"
                if response_data:
                    message += f" - {response_data}"

            self.log_test(name, success, message, response_data)
            return success, response_data

        except Exception as e:
            self.log_test(name, False, f"Error: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration"""
        print("\n🔍 Testing User Registration...")
        
        user_data = {
            "full_name": "Test User",
            "email": f"test_{int(time.time())}@example.com",
            "mobile": "1234567890",
            "password": "123456"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=user_data
        )
        
        if success and 'token' in response:
            self.user_token = response['token']
            self.user_id = response['user_id']
            return True
        return False

    def test_user_login(self):
        """Test user login with test credentials"""
        print("\n🔍 Testing User Login...")
        
        login_data = {
            "identifier": "1234567890",
            "password": "123456"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.user_token = response['token']
            self.user_id = response['user_id']
            return True
        return False

    def test_admin_login(self):
        """Test admin login"""
        print("\n🔍 Testing Admin Login...")
        
        admin_data = {
            "username": "Priyanshu1369",
            "password": "@Priyanshu@1369?"
        }
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "admin/login",
            200,
            data=admin_data
        )
        
        if success and 'token' in response:
            self.admin_token = response['token']
            return True
        return False

    def test_user_endpoints(self):
        """Test all user endpoints"""
        print("\n🔍 Testing User Endpoints...")
        
        # Dashboard
        self.run_test("Get Dashboard", "GET", "dashboard", 200)
        
        # Profile
        self.run_test("Get Profile", "GET", "profile", 200)
        
        # Tasks
        self.run_test("Get Tasks", "GET", "tasks", 200)
        
        # Ads
        self.run_test("Get Ads", "GET", "ads", 200)
        
        # Wallet
        self.run_test("Get Wallet", "GET", "wallet", 200)
        
        # KYC Status
        self.run_test("Get KYC Status", "GET", "kyc", 200)
        
        # Referrals
        self.run_test("Get Referrals", "GET", "referrals", 200)
        
        # Uploads
        self.run_test("Get My Uploads", "GET", "uploads", 200)
        
        # Task Submissions
        self.run_test("Get Task Submissions", "GET", "tasks/submissions", 200)

    def test_admin_endpoints(self):
        """Test admin endpoints"""
        print("\n🔍 Testing Admin Endpoints...")
        
        # Set admin token
        original_token = self.user_token
        self.user_token = self.admin_token
        
        # Admin Dashboard
        self.run_test("Admin Dashboard", "GET", "admin/dashboard", 200)
        
        # Admin Users
        self.run_test("Get All Users", "GET", "admin/users", 200)
        
        # Admin Tasks
        self.run_test("Get All Tasks", "GET", "admin/tasks", 200)
        
        # Admin Ads
        self.run_test("Get All Ads", "GET", "admin/ads", 200)
        
        # Admin Withdrawals
        self.run_test("Get All Withdrawals", "GET", "admin/withdrawals", 200)
        
        # Admin KYC
        self.run_test("Get All KYC", "GET", "admin/kyc", 200)
        
        # Admin Uploads
        self.run_test("Get All Uploads", "GET", "admin/uploads", 200)
        
        # Admin Settings
        self.run_test("Get Admin Settings", "GET", "admin/settings", 200)
        
        # Admin CMS
        self.run_test("Get CMS Pages", "GET", "admin/cms", 200)
        
        # Task Submissions
        self.run_test("Get All Task Submissions", "GET", "admin/tasks/submissions", 200)
        
        # Restore user token
        self.user_token = original_token

    def test_task_creation_and_submission(self):
        """Test task creation and submission flow"""
        print("\n🔍 Testing Task Creation and Submission...")
        
        # Set admin token for task creation
        original_token = self.user_token
        self.user_token = self.admin_token
        
        # Create a test task
        task_data = {
            "title": "Test Instagram Follow",
            "description": "Follow our Instagram account",
            "category": "Instagram Follow",
            "reward": 10.0,
            "link": "https://instagram.com/test",
            "requires_proof": True,
            "active": True
        }
        
        success, response = self.run_test(
            "Create Task",
            "POST",
            "admin/tasks",
            200,
            data=task_data
        )
        
        task_id = None
        if success and 'task_id' in response:
            task_id = response['task_id']
        
        # Restore user token
        self.user_token = original_token
        
        # Submit task (would need actual file upload in real scenario)
        if task_id:
            # Create a dummy image file for testing
            dummy_image = b"dummy image content"
            files = {'screenshot': ('test.jpg', dummy_image, 'image/jpeg')}
            
            success, response = self.run_test(
                "Submit Task",
                "POST",
                f"tasks/{task_id}/submit",
                200,
                files=files
            )

    def test_ad_watching(self):
        """Test ad watching flow"""
        print("\n🔍 Testing Ad Watching...")
        
        # First create an ad as admin
        original_token = self.user_token
        self.user_token = self.admin_token
        
        ad_data = {
            "title": "Test Ad",
            "link": "https://example.com/ad",
            "duration": 30,
            "reward": 5.0,
            "active": True
        }
        
        success, response = self.run_test(
            "Create Ad",
            "POST",
            "admin/ads",
            200,
            data=ad_data
        )
        
        ad_id = None
        if success and 'ad_id' in response:
            ad_id = response['ad_id']
        
        # Restore user token
        self.user_token = original_token
        
        # Watch the ad
        if ad_id:
            self.run_test(
                "Watch Ad",
                "POST",
                f"ads/{ad_id}/watch",
                200
            )

    def test_withdrawal_flow(self):
        """Test withdrawal creation"""
        print("\n🔍 Testing Withdrawal Flow...")
        
        withdrawal_data = {
            "amount": 500.0,
            "method": "UPI",
            "upi_id": "test@upi"
        }
        
        # This might fail if KYC not approved or insufficient balance
        self.run_test(
            "Create Withdrawal",
            "POST",
            "wallet/withdraw",
            200,
            data=withdrawal_data
        )

    def test_kyc_submission(self):
        """Test KYC submission"""
        print("\n🔍 Testing KYC Submission...")
        
        # Create dummy files
        dummy_file = b"dummy file content"
        
        kyc_data = {
            "account_holder": "Test User",
            "bank_name": "Test Bank",
            "account_number": "1234567890",
            "ifsc_code": "TEST0001234",
            "branch_name": "Test Branch"
        }
        
        files = {
            'aadhaar_front': ('aadhaar_front.jpg', dummy_file, 'image/jpeg'),
            'aadhaar_back': ('aadhaar_back.jpg', dummy_file, 'image/jpeg'),
            'pan_card': ('pan_card.jpg', dummy_file, 'image/jpeg')
        }
        
        data = {'data': json.dumps(kyc_data)}
        
        self.run_test(
            "Submit KYC",
            "POST",
            "kyc",
            200,
            data=data,
            files=files
        )

    def test_upload_submission(self):
        """Test upload submission"""
        print("\n🔍 Testing Upload Submission...")
        
        upload_data = {
            "platform": "YouTube",
            "video_link": "https://youtube.com/watch?v=test"
        }
        
        dummy_file = b"dummy screenshot"
        files = {'screenshot': ('screenshot.jpg', dummy_file, 'image/jpeg')}
        data = {'data': json.dumps(upload_data)}
        
        self.run_test(
            "Submit Upload",
            "POST",
            "uploads",
            200,
            data=data,
            files=files
        )

    def print_summary(self):
        """Print test summary"""
        print(f"\n📊 Test Summary:")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.tests_passed < self.tests_run:
            print(f"\n❌ Failed Tests:")
            for result in self.test_results:
                if "❌" in result["status"]:
                    print(f"  - {result['test']}: {result['message']}")

def main():
    print("🚀 Starting EarnKaro API Testing...")
    
    tester = EarnKaroAPITester()
    
    # Test authentication first
    if not tester.test_user_registration():
        print("❌ User registration failed, trying login...")
        if not tester.test_user_login():
            print("❌ Both registration and login failed, stopping tests")
            return 1
    
    if not tester.test_admin_login():
        print("❌ Admin login failed")
        return 1
    
    # Test user endpoints
    tester.test_user_endpoints()
    
    # Test admin endpoints
    tester.test_admin_endpoints()
    
    # Test complex flows
    tester.test_task_creation_and_submission()
    tester.test_ad_watching()
    tester.test_withdrawal_flow()
    tester.test_kyc_submission()
    tester.test_upload_submission()
    
    # Print summary
    tester.print_summary()
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
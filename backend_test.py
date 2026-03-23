import requests
import sys
import json
from datetime import datetime, timedelta

class DuoHealthAPITester:
    def __init__(self, base_url="https://couples-wellness-3.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.couple_id = None
        self.partner_token = None
        self.partner_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
            self.failed_tests.append({"test": name, "error": details})

    def make_request(self, method, endpoint, data=None, token=None):
        """Make API request with proper headers"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            
            return response
        except requests.exceptions.RequestException as e:
            return None

    def test_health_check(self):
        """Test basic API health"""
        print("\n🔍 Testing API Health...")
        
        # Test root endpoint
        response = self.make_request('GET', '')
        success = response and response.status_code == 200
        self.log_test("Root endpoint", success, 
                     f"Status: {response.status_code if response else 'No response'}")
        
        # Test health endpoint
        response = self.make_request('GET', 'health')
        success = response and response.status_code == 200
        self.log_test("Health endpoint", success,
                     f"Status: {response.status_code if response else 'No response'}")

    def test_user_registration(self):
        """Test user registration"""
        print("\n🔍 Testing User Registration...")
        
        timestamp = datetime.now().strftime("%H%M%S")
        test_user = {
            "name": f"Test User {timestamp}",
            "email": f"test{timestamp}@example.com",
            "password": "testpass123"
        }
        
        response = self.make_request('POST', 'auth/register', test_user)
        
        if response and response.status_code == 200:
            data = response.json()
            self.token = data.get('access_token')
            self.user_id = data.get('user', {}).get('id')
            self.log_test("User registration", True)
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("User registration", False, error_msg)
            return False

    def test_user_login(self):
        """Test user login with existing credentials"""
        print("\n🔍 Testing User Login...")
        
        # Create a new user first
        timestamp = datetime.now().strftime("%H%M%S")
        test_user = {
            "name": f"Login Test {timestamp}",
            "email": f"login{timestamp}@example.com", 
            "password": "loginpass123"
        }
        
        # Register user
        reg_response = self.make_request('POST', 'auth/register', test_user)
        if not reg_response or reg_response.status_code != 200:
            self.log_test("User login (setup)", False, "Failed to create test user")
            return False
        
        # Now test login
        login_data = {
            "email": test_user["email"],
            "password": test_user["password"]
        }
        
        response = self.make_request('POST', 'auth/login', login_data)
        
        if response and response.status_code == 200:
            data = response.json()
            token = data.get('access_token')
            self.log_test("User login", True)
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("User login", False, error_msg)
            return False

    def test_auth_me(self):
        """Test getting current user info"""
        print("\n🔍 Testing Auth Me...")
        
        if not self.token:
            self.log_test("Auth me", False, "No token available")
            return False
        
        response = self.make_request('GET', 'auth/me', token=self.token)
        
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Auth me", True)
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Auth me", False, error_msg)
            return False

    def test_invite_code(self):
        """Test getting invite code"""
        print("\n🔍 Testing Invite Code...")
        
        if not self.token:
            self.log_test("Get invite code", False, "No token available")
            return False
        
        response = self.make_request('GET', 'auth/invite-code', token=self.token)
        
        if response and response.status_code == 200:
            data = response.json()
            invite_code = data.get('invite_code')
            self.log_test("Get invite code", bool(invite_code))
            return invite_code
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Get invite code", False, error_msg)
            return None

    def test_partner_pairing(self):
        """Test partner pairing functionality"""
        print("\n🔍 Testing Partner Pairing...")
        
        if not self.token:
            self.log_test("Partner pairing", False, "No token available")
            return False
        
        # Create second user (partner)
        timestamp = datetime.now().strftime("%H%M%S")
        partner_user = {
            "name": f"Partner {timestamp}",
            "email": f"partner{timestamp}@example.com",
            "password": "partnerpass123"
        }
        
        partner_response = self.make_request('POST', 'auth/register', partner_user)
        if not partner_response or partner_response.status_code != 200:
            self.log_test("Partner pairing (setup)", False, "Failed to create partner user")
            return False
        
        partner_data = partner_response.json()
        self.partner_token = partner_data.get('access_token')
        self.partner_id = partner_data.get('user', {}).get('id')
        
        # Get first user's invite code
        invite_code = self.test_invite_code()
        if not invite_code:
            return False
        
        # Partner joins using invite code
        join_data = {"invite_code": invite_code}
        response = self.make_request('POST', 'auth/join-partner', join_data, token=self.partner_token)
        
        if response and response.status_code == 200:
            data = response.json()
            self.couple_id = data.get('couple_id')
            self.log_test("Partner pairing", True)
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Partner pairing", False, error_msg)
            return False

    def test_onboarding(self):
        """Test onboarding data submission"""
        print("\n🔍 Testing Onboarding...")
        
        if not self.token:
            self.log_test("Onboarding", False, "No token available")
            return False
        
        onboarding_data = {
            "age": 30,
            "weight": 70.5,
            "height": 175.0,
            "health_goals": ["weight_loss", "energy"],
            "dietary_preferences": ["vegetarian"],
            "food_allergies": [],
            "ingredient_dislikes": ["mushrooms"],
            "busiest_days": ["monday", "friday"],
            "workout_times": "morning",
            "workout_types": ["gym", "running"],
            "fitness_level": "intermediate",
            "track_cycle": False,
            "grace_period_enabled": True
        }
        
        response = self.make_request('POST', 'onboarding', onboarding_data, token=self.token)
        
        if response and response.status_code == 200:
            self.log_test("Onboarding submission", True)
            
            # Test getting onboarding data
            get_response = self.make_request('GET', 'onboarding', token=self.token)
            if get_response and get_response.status_code == 200:
                self.log_test("Get onboarding data", True)
                return True
            else:
                self.log_test("Get onboarding data", False, "Failed to retrieve onboarding data")
                return False
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Onboarding submission", False, error_msg)
            return False

    def test_couple_endpoints(self):
        """Test couple-related endpoints"""
        print("\n🔍 Testing Couple Endpoints...")
        
        if not self.token:
            self.log_test("Couple endpoints", False, "No token available")
            return False
        
        # Test get couple info
        response = self.make_request('GET', 'couple', token=self.token)
        
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Get couple info", True)
            
            # Test travel mode toggle
            travel_response = self.make_request('POST', 'couple/travel-mode', token=self.token)
            if travel_response and travel_response.status_code == 200:
                self.log_test("Toggle travel mode", True)
                return True
            else:
                self.log_test("Toggle travel mode", False, "Failed to toggle travel mode")
                return False
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Get couple info", False, error_msg)
            return False

    def test_daily_logs(self):
        """Test daily logging functionality"""
        print("\n🔍 Testing Daily Logs...")
        
        if not self.token:
            self.log_test("Daily logs", False, "No token available")
            return False
        
        today = datetime.now().strftime("%Y-%m-%d")
        log_data = {
            "date": today,
            "workout_completed": True,
            "workout_details": {"type": "gym", "duration": 45},
            "meals_logged": ["breakfast", "lunch"],
            "water_intake": 6,
            "energy_level": 4,
            "pain_level": 1,
            "mood": "😊",
            "sleep_hours": 7.5,
            "sleep_quality": 4
        }
        
        # Save log
        response = self.make_request('POST', 'logs', log_data, token=self.token)
        
        if response and response.status_code == 200:
            self.log_test("Save daily log", True)
            
            # Get log
            get_response = self.make_request('GET', f'logs/{today}', token=self.token)
            if get_response and get_response.status_code == 200:
                self.log_test("Get daily log", True)
                
                # Get couple logs
                couple_response = self.make_request('GET', f'logs/couple/{today}', token=self.token)
                if couple_response and couple_response.status_code == 200:
                    self.log_test("Get couple logs", True)
                    return True
                else:
                    self.log_test("Get couple logs", False, "Failed to get couple logs")
                    return False
            else:
                self.log_test("Get daily log", False, "Failed to retrieve daily log")
                return False
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Save daily log", False, error_msg)
            return False

    def test_weekly_plans(self):
        """Test weekly plan functionality"""
        print("\n🔍 Testing Weekly Plans...")
        
        if not self.token or not self.couple_id:
            self.log_test("Weekly plans", False, "No token or couple_id available")
            return False
        
        # Get current plan
        response = self.make_request('GET', 'plans/current', token=self.token)
        
        if response and response.status_code == 200:
            self.log_test("Get current plan", True)
            
            # Generate new plan
            today = datetime.now().date()
            monday = today - timedelta(days=today.weekday())
            
            plan_request = {
                "week_start": monday.strftime("%Y-%m-%d"),
                "available_ingredients": ["chicken", "rice", "broccoli"],
                "travel_mode": False,
                "busy_days": ["friday"]
            }
            
            gen_response = self.make_request('POST', 'plans/generate', plan_request, token=self.token)
            if gen_response and gen_response.status_code == 200:
                self.log_test("Generate weekly plan", True)
                return True
            else:
                error_msg = gen_response.json().get('detail', 'Unknown error') if gen_response else 'No response'
                self.log_test("Generate weekly plan", False, error_msg)
                return False
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Get current plan", False, error_msg)
            return False

    def test_progress_endpoints(self):
        """Test progress tracking endpoints"""
        print("\n🔍 Testing Progress Endpoints...")
        
        if not self.token:
            self.log_test("Progress endpoints", False, "No token available")
            return False
        
        # Test progress stats
        response = self.make_request('GET', 'progress/stats', token=self.token)
        
        if response and response.status_code == 200:
            self.log_test("Get progress stats", True)
            
            # Test weekly summary
            summary_response = self.make_request('GET', 'progress/weekly-summary', token=self.token)
            if summary_response and summary_response.status_code == 200:
                self.log_test("Get weekly summary", True)
                return True
            else:
                self.log_test("Get weekly summary", False, "Failed to get weekly summary")
                return False
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Get progress stats", False, error_msg)
            return False

    def test_grocery_list(self):
        """Test grocery list generation"""
        print("\n🔍 Testing Grocery List...")
        
        if not self.token:
            self.log_test("Grocery list", False, "No token available")
            return False
        
        response = self.make_request('GET', 'grocery-list', token=self.token)
        
        if response and response.status_code == 200:
            self.log_test("Get grocery list", True)
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Get grocery list", False, error_msg)
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting DuoHealth API Tests...")
        print(f"Testing against: {self.base_url}")
        
        # Basic health checks
        self.test_health_check()
        
        # Authentication flow
        if self.test_user_registration():
            self.test_auth_me()
            
            # Partner pairing flow
            if self.test_partner_pairing():
                # Onboarding
                self.test_onboarding()
                
                # Core functionality
                self.test_couple_endpoints()
                self.test_daily_logs()
                self.test_weekly_plans()
                self.test_progress_endpoints()
                self.test_grocery_list()
        
        # Test login separately
        self.test_user_login()
        
        # Print summary
        print(f"\n📊 Test Results:")
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {self.tests_run - self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test['error']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = DuoHealthAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
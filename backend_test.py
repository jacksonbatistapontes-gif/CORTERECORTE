import requests
import sys
import json
from datetime import datetime

class ClipCutterAPITester:
    def __init__(self, base_url="https://clip-cutter-11.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.job_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text[:200]}...")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root Endpoint", "GET", "", 200)

    def test_create_job(self):
        """Test job creation"""
        job_data = {
            "youtube_url": "https://youtube.com/watch?v=test123",
            "clip_length": 30,
            "language": "pt",
            "style": "dinamico"
        }
        success, response = self.run_test("Create Job", "POST", "jobs", 200, job_data)
        if success and 'id' in response:
            self.job_id = response['id']
            print(f"Created job with ID: {self.job_id}")
        return success

    def test_list_jobs(self):
        """Test listing jobs"""
        return self.run_test("List Jobs", "GET", "jobs", 200)

    def test_get_job(self):
        """Test getting specific job"""
        if not self.job_id:
            print("❌ No job ID available for testing")
            return False
        return self.run_test("Get Job", "GET", f"jobs/{self.job_id}", 200)

    def test_advance_job(self):
        """Test advancing job progress"""
        if not self.job_id:
            print("❌ No job ID available for testing")
            return False
        success, response = self.run_test("Advance Job", "POST", f"jobs/{self.job_id}/advance", 200)
        if success:
            print(f"Job progress: {response.get('progress', 'N/A')}%")
            print(f"Job status: {response.get('status', 'N/A')}")
        return success

    def test_get_job_clips(self):
        """Test getting job clips"""
        if not self.job_id:
            print("❌ No job ID available for testing")
            return False
        success, response = self.run_test("Get Job Clips", "GET", f"jobs/{self.job_id}/clips", 200)
        if success and response:
            # Store first clip ID for update testing
            if len(response) > 0:
                self.clip_id = response[0].get('id')
                print(f"Found clip ID for testing: {self.clip_id}")
        return success

    def test_advance_to_completion(self):
        """Test advancing job until completion"""
        if not self.job_id:
            print("❌ No job ID available for testing")
            return False
        
        print(f"\n🔄 Advancing job {self.job_id} to completion...")
        max_attempts = 10
        attempts = 0
        
        while attempts < max_attempts:
            success, response = self.run_test(f"Advance Job (Attempt {attempts + 1})", "POST", f"jobs/{self.job_id}/advance", 200)
            if not success:
                return False
            
            progress = response.get('progress', 0)
            status = response.get('status', 'processing')
            print(f"Progress: {progress}%, Status: {status}")
            
            if status == "completed":
                print(f"✅ Job completed with {len(response.get('clips', []))} clips")
                return True
            
            attempts += 1
        
        print(f"❌ Job did not complete after {max_attempts} attempts")
        return False

def main():
    print("🚀 Starting ClipCutter API Tests")
    print("=" * 50)
    
    tester = ClipCutterAPITester()
    
    # Test sequence
    tests = [
        ("Root Endpoint", tester.test_root_endpoint),
        ("Create Job", tester.test_create_job),
        ("List Jobs", tester.test_list_jobs),
        ("Get Job", tester.test_get_job),
        ("Advance Job", tester.test_advance_job),
        ("Get Job Clips", tester.test_get_job_clips),
        ("Advance to Completion", tester.test_advance_to_completion),
        ("Final Get Job Clips", tester.test_get_job_clips),
    ]
    
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
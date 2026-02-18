import requests
import json
import sys

def test_waveform_sprite_features():
    """Test waveform and sprite generation features specifically"""
    base_url = "https://clip-cutter-11.preview.emergentagent.com"
    
    print("🎵 Testing Waveform and Sprite Generation Features")
    print("=" * 60)
    
    # Get the most recent completed job
    try:
        response = requests.get(f"{base_url}/api/jobs", timeout=10)
        if response.status_code != 200:
            print(f"❌ Failed to get jobs list: {response.status_code}")
            return False
            
        jobs = response.json()
        completed_jobs = [job for job in jobs if job.get('status') == 'completed']
        
        if not completed_jobs:
            print("❌ No completed jobs found for testing")
            return False
            
        job_id = completed_jobs[0]['id']  # Get the most recent completed job ID
        
        # Get full job details
        job_response = requests.get(f"{base_url}/api/jobs/{job_id}", timeout=10)
        if job_response.status_code != 200:
            print(f"❌ Failed to get job details: {job_response.status_code}")
            return False
            
        job = job_response.json()
        
        print(f"📋 Testing job: {job_id}")
        print(f"   Title: {job.get('title', 'N/A')}")
        print(f"   Status: {job.get('status', 'N/A')}")
        print(f"   Progress: {job.get('progress', 'N/A')}%")
        
        # Test 1: Check if waveform_url and sprite_url are present
        print(f"\n🔍 Test 1: Checking waveform_url and sprite_url fields...")
        
        waveform_url = job.get('waveform_url')
        sprite_url = job.get('sprite_url')
        
        if waveform_url:
            print(f"✅ waveform_url present: {waveform_url}")
        else:
            print("❌ waveform_url missing from job")
            return False
            
        if sprite_url:
            print(f"✅ sprite_url present: {sprite_url}")
        else:
            print("❌ sprite_url missing from job")
            return False
        
        # Test 2: Verify waveform and sprite files are accessible
        print(f"\n🔍 Test 2: Verifying waveform and sprite files are accessible...")
        
        # Test waveform accessibility
        waveform_full_url = f"{base_url}{waveform_url}"
        try:
            waveform_response = requests.head(waveform_full_url, timeout=10)
            if waveform_response.status_code == 200:
                print(f"✅ Waveform file accessible: {waveform_full_url}")
                print(f"   Content-Type: {waveform_response.headers.get('content-type', 'N/A')}")
            else:
                print(f"❌ Waveform file not accessible: {waveform_response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error accessing waveform: {str(e)}")
            return False
        
        # Test sprite accessibility
        sprite_full_url = f"{base_url}{sprite_url}"
        try:
            sprite_response = requests.head(sprite_full_url, timeout=10)
            if sprite_response.status_code == 200:
                print(f"✅ Sprite file accessible: {sprite_full_url}")
                print(f"   Content-Type: {sprite_response.headers.get('content-type', 'N/A')}")
            else:
                print(f"❌ Sprite file not accessible: {sprite_response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error accessing sprite: {str(e)}")
            return False
        
        # Test 3: Check if ZIP download includes timeline files
        print(f"\n🔍 Test 3: Checking if ZIP download includes timeline files...")
        
        try:
            download_response = requests.get(f"{base_url}/api/jobs/{job_id}/download", timeout=30)
            if download_response.status_code == 200:
                print(f"✅ ZIP download successful")
                print(f"   Content-Type: {download_response.headers.get('content-type', 'N/A')}")
                print(f"   Content-Length: {len(download_response.content)} bytes")
                
                # Save and inspect ZIP contents
                import zipfile
                import io
                
                zip_content = io.BytesIO(download_response.content)
                with zipfile.ZipFile(zip_content, 'r') as zip_file:
                    file_list = zip_file.namelist()
                    print(f"   ZIP contains {len(file_list)} files:")
                    
                    timeline_files = [f for f in file_list if f.startswith('timeline/')]
                    if timeline_files:
                        print(f"✅ Timeline files found in ZIP:")
                        for timeline_file in timeline_files:
                            print(f"     - {timeline_file}")
                    else:
                        print("❌ No timeline files found in ZIP")
                        return False
                        
                    # Check for specific timeline files
                    has_waveform = any('waveform.png' in f for f in file_list)
                    has_sprite = any('sprite.jpg' in f for f in file_list)
                    
                    if has_waveform:
                        print("✅ waveform.png found in ZIP")
                    else:
                        print("❌ waveform.png not found in ZIP")
                        return False
                        
                    if has_sprite:
                        print("✅ sprite.jpg found in ZIP")
                    else:
                        print("❌ sprite.jpg not found in ZIP")
                        return False
                        
            else:
                print(f"❌ ZIP download failed: {download_response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Error downloading ZIP: {str(e)}")
            return False
        
        print(f"\n🎉 All waveform and sprite tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Error during testing: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_waveform_sprite_features()
    sys.exit(0 if success else 1)
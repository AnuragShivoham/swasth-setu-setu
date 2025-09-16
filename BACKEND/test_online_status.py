import requests
import json

# Test the online status endpoint
def test_online_status():
    # First, let's try to login to get a valid token
    login_url = 'http://localhost:5000/auth/login'
    login_data = {
        'username': 'annu',  # Using one of the doctors from the check_db output
        'password': 'password'  # Assuming default password
    }

    try:
        print("Attempting to login...")
        login_response = requests.post(login_url, json=login_data)
        print(f"Login response status: {login_response.status_code}")

        if login_response.status_code == 200:
            login_result = login_response.json()
            token = login_result.get('access_token')

            if token:
                print("Login successful, got token")
                headers = {'Authorization': f'Bearer {token}'}

                # Test GET online status
                print("\nTesting GET /doctor/status/online...")
                get_response = requests.get('http://localhost:5000/doctor/status/online', headers=headers)
                print(f"GET response status: {get_response.status_code}")
                print(f"GET response: {get_response.text}")

                # Test POST online status
                print("\nTesting POST /doctor/status/online...")
                post_data = {'is_online': True}
                post_response = requests.post('http://localhost:5000/doctor/status/online', headers=headers, json=post_data)
                print(f"POST response status: {post_response.status_code}")
                print(f"POST response: {post_response.text}")

                # Test GET again to see if it changed
                print("\nTesting GET /doctor/status/online after POST...")
                get_response2 = requests.get('http://localhost:5000/doctor/status/online', headers=headers)
                print(f"GET response status: {get_response2.status_code}")
                print(f"GET response: {get_response2.text}")

            else:
                print("No token received from login")
        else:
            print(f"Login failed: {login_response.text}")

    except Exception as e:
        print(f"Error during testing: {e}")

if __name__ == "__main__":
    test_online_status()

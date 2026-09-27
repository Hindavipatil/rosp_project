import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_endpoint(name, path, method="POST", data=None):
    print(f"\n--- Testing {name} ({path}) ---")
    try:
        url = f"{BASE_URL}{path}"
        if method == "POST":
            response = requests.post(url, json=data)
        else:
            response = requests.get(url)
            
        if response.status_code == 200 or response.status_code == 201:
            print(f"✅ Success!")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        else:
            print(f"❌ Failed (Status: {response.status_code})")
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"💥 Error connecting to server: {e}")

if __name__ == "__main__":
    print("Starting ML Integration Tests...")

    # 1. Classification
    test_endpoint("Event Classification", "/classify-event", data={
        "title": "Blood Donation Drive",
        "description": "Helping local hospitals collect blood for emergencies."
    })

    test_endpoint("Initiative Tagging", "/classify-initiative", data={
        "title": "River Cleanup Project",
        "description": "Removing plastic waste from the Mula-Mutha riverbanks."
    })

    # 2. Duplicate Detection
    test_endpoint("Duplicate Detection", "/check-duplicate", data={
        "name": "Amit Kumar",
        "phone": "9876543210",
        "email": "amit@example.com",
        "participants": [
            {"name": "Amit K.", "phone": "9876543210", "email": "amit_k@test.com"}
        ]
    })

    # 3. Participation Prediction
    test_endpoint("Participation Prediction", "/predict-participation", data={
        "capacity": 50,
        "category": "Health",
        "registered_so_far": 20,
        "past_events": [
            {"capacity": 40, "actual_participants": 35, "category": "Health"},
            {"capacity": 60, "actual_participants": 55, "category": "Health"},
            {"capacity": 30, "actual_participants": 28, "category": "Health"}
        ]
    })

    # 4. Report Generation
    test_endpoint("Report Generation", "/generate-report", data={
        "events": [
            {"title": "Health Camp", "volunteerCap": 10, "participants": [{"role": "Volunteer"}, {"role": "Volunteer"}]}
        ],
        "initiatives": [
            {"title": "Food Drive", "impact_metrics": {"people_helped": 500}}
        ],
        "stats": {"duplicatesBlocked": 5}
    })

    # 5. Chatbot (The big one!)
    print("\n⚠️  Testing Chatbot (Gemini)... This might take a few seconds.")
    test_endpoint("Chatbot Assistant", "/chatbot", data={
        "message": "I want to help with a medical camp this weekend",
        "events": [
            {"_id": "e123", "title": "Community Medical Camp", "date": "2026-04-18", "category": "Health"}
        ]
    })

    print("\n--- All tests completed ---")

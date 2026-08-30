import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"
    assert "AgroPulse" in response.json()["system"]

def test_ai_price_recommendation():
    payload = {
        "crop_name": "Onion",
        "variety": "Garva Red",
        "quantity_kg": 2500,
        "quality_grade": "A",
        "location": "Nashik, Maharashtra",
        "season": "Kharif",
        "moisture_content": 11.0
    }
    response = client.post("/api/v1/ai/price-recommendation", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["crop_name"] == "Onion"
    assert data["recommended_min_per_kg"] > 15.0
    assert data["recommended_max_per_kg"] >= data["recommended_min_per_kg"]
    assert len(data["factors"]) >= 3

def test_ai_queue_prediction():
    payload = {
        "center_id": 1,
        "farmers_ahead": 4,
        "quantity_kg": 2000,
        "active_counters": 3,
        "crop_name": "Onion"
    }
    response = client.post("/api/v1/ai/queue-wait-time", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["estimated_wait_minutes"] > 0
    assert "mins" in data["confidence_interval"]

def test_procurement_centers_and_slots():
    res = client.get("/api/v1/procurement/centers")
    assert res.status_code == 200
    centers = res.json()
    assert len(centers) >= 4
    
    center_id = centers[0]["id"]
    slots_res = client.get(f"/api/v1/procurement/center/{center_id}/slots")
    assert slots_res.status_code == 200
    assert len(slots_res.json()) >= 1

def test_buyer_matching():
    # Produce ID 1 seeded in DB
    res = client.get("/api/v1/matching/for-produce/1")
    assert res.status_code == 200
    matches = res.json()
    assert len(matches) > 0
    assert matches[0]["overall_match_score"] >= 70.0
    assert "distance_km" in matches[0]

def test_live_queue_board():
    res = client.get("/api/v1/queue/center/1/live-board")
    assert res.status_code == 200
    board = res.json()
    assert "waiting_queue" in board
    assert "active_counters" in board

def test_analytics_summary():
    res = client.get("/api/v1/analytics/summary")
    assert res.status_code == 200
    data = res.json()
    assert data["total_farmers_active"] > 0
    assert len(data["crop_procurement_breakdown"]) >= 3

def test_sample_specimens():
    res = client.get("/api/v1/ai/sample-specimens")
    assert res.status_code == 200
    samples = res.json()
    assert len(samples) >= 5
    assert any(s["crop_name"] == "Apple" for s in samples)
    assert any(s["crop_name"] == "Banana" for s in samples)
    assert any(s["crop_name"] == "Mango" for s in samples)

def test_vision_quality_grading_sample():
    payload = {
        "crop_name": "Apple",
        "sample_key": "apple_grade_a",
        "auto_detect_produce": True
    }
    res = client.post("/api/v1/ai/grade-image", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["detected_fruit_or_crop"] == "Apple"
    assert data["fruit_category"] == "FRUIT"
    assert data["predicted_grade"] in ["A", "B", "C"]
    assert data["overall_quality_score"] >= 80.0
    assert "Optimal" in data["ripeness_stage"] or "Ripe" in data["ripeness_stage"]
    assert "AGMARK" in data["agmark_standard_summary"]
    assert "data:image/jpeg;base64," in data["analyzed_image_base64"]

def test_auto_fruit_detection_banana():
    payload = {
        "crop_name": "Auto-Detect",
        "sample_key": "banana_grade_a",
        "auto_detect_produce": True
    }
    res = client.post("/api/v1/ai/grade-image", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["detected_fruit_or_crop"] == "Banana"
    assert data["fruit_category"] == "FRUIT"
    assert data["predicted_grade"] in ["A", "B", "C"]
    assert data["fruit_detection_confidence"] >= 0.90

def test_auto_fruit_detection_tomato():
    payload = {
        "crop_name": "Auto-Detect",
        "sample_key": "tomato_grade_a",
        "auto_detect_produce": True
    }
    res = client.post("/api/v1/ai/grade-image", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["detected_fruit_or_crop"] == "Tomato"
    assert data["fruit_category"] == "VEGETABLE"
    assert data["predicted_grade"] in ["A", "B", "C"]
    assert data["produce_icon"] == "🍅"




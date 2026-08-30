import math
from typing import List, Dict, Any
from ..schemas import MatchedBuyerOut

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate geographical distance in km between two lat/lon coordinates."""
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 25.0  # Default average distance if coordinates unavailable

    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)

# Synthetic pool of registered verified agro-buyers across regional mandis
SAMPLE_BUYERS: List[Dict[str, Any]] = [
    {
        "id": 201,
        "name": "Rajesh Aggarwal",
        "company": "Kisan Agro Foods Pvt Ltd",
        "rating": 4.9,
        "location": "Nashik MIDC, Maharashtra",
        "lat": 19.9635,
        "lon": 73.8347,
        "payment_speed": "Instant UPI / 2 hrs",
        "price_willingness_factor": 1.05,  # Willing to pay 5% above baseline
        "preferred_crops": ["Onion", "Tomato", "Potato"],
        "max_qty_kg": 15000.0,
        "verified_purchases": 142
    },
    {
        "id": 202,
        "name": "Sunil Patil",
        "company": "Sahyadri Fresh Procurement",
        "rating": 4.8,
        "location": "Lasalgaon Market Yard, Maharashtra",
        "lat": 20.1472,
        "lon": 74.2257,
        "payment_speed": "Same Day DBT",
        "price_willingness_factor": 1.02,
        "preferred_crops": ["Onion", "Wheat", "Soybean"],
        "max_qty_kg": 25000.0,
        "verified_purchases": 320
    },
    {
        "id": 203,
        "name": "Amit Singhal",
        "company": "North Bharat Grain Mills",
        "rating": 4.7,
        "location": "Khanna APMC, Punjab",
        "lat": 30.7073,
        "lon": 76.2163,
        "payment_speed": "Next Day NEFT",
        "price_willingness_factor": 1.04,
        "preferred_crops": ["Wheat", "Rice (Paddy)", "Mustard"],
        "max_qty_kg": 50000.0,
        "verified_purchases": 215
    },
    {
        "id": 204,
        "name": "Venkat Reddy",
        "company": "Deccan Spices & Commodities",
        "rating": 4.9,
        "location": "Guntur Yard, Andhra Pradesh",
        "lat": 16.3067,
        "lon": 80.4365,
        "payment_speed": "Instant Escrow Release",
        "price_willingness_factor": 1.08,
        "preferred_crops": ["Cotton", "Mustard", "Soybean"],
        "max_qty_kg": 20000.0,
        "verified_purchases": 189
    },
    {
        "id": 205,
        "name": "Dharmesh Shah",
        "company": "Gujarat Bio-Oils & Feeds",
        "rating": 4.6,
        "location": "Rajkot Industrial Area, Gujarat",
        "lat": 22.3039,
        "lon": 70.8022,
        "payment_speed": "48 hrs Verified Bank Transfer",
        "price_willingness_factor": 0.99,
        "preferred_crops": ["Soybean", "Mustard", "Cotton"],
        "max_qty_kg": 40000.0,
        "verified_purchases": 98
    },
    {
        "id": 206,
        "name": "Priya Sharma",
        "company": "FreshDirect Hyperlocal",
        "rating": 4.95,
        "location": "Pune Wholesale Market, Maharashtra",
        "lat": 18.5204,
        "lon": 73.8567,
        "payment_speed": "Instant UPI Payout",
        "price_willingness_factor": 1.07,
        "preferred_crops": ["Tomato", "Onion", "Potato"],
        "max_qty_kg": 8000.0,
        "verified_purchases": 410
    }
]

class BuyerMatcher:
    def match_buyers_for_produce(
        self,
        crop_name: str,
        farmer_lat: float,
        farmer_lon: float,
        quantity_kg: float,
        expected_price_per_kg: float,
        ai_target_price_per_kg: float
    ) -> List[MatchedBuyerOut]:
        matched: List[MatchedBuyerOut] = []

        baseline_price = ai_target_price_per_kg or expected_price_per_kg

        for buyer in SAMPLE_BUYERS:
            # Check crop affinity bonus
            crop_match = any(crop_name.lower() in c.lower() or c.lower() in crop_name.lower() for c in buyer["preferred_crops"])
            
            # Offered price calculation based on willingness factor
            offered_price = round(baseline_price * buyer["price_willingness_factor"], 2)
            
            # Distance
            dist_km = haversine_distance(farmer_lat, farmer_lon, buyer["lat"], buyer["lon"])
            
            # 1. Price Score (0 - 100): Compares offered price with farmer's expected price
            price_ratio = offered_price / max(1.0, expected_price_per_kg)
            if price_ratio >= 1.05:
                price_score = 100.0
            elif price_ratio >= 0.95:
                price_score = 90.0 + ((price_ratio - 0.95) / 0.10) * 10.0
            else:
                price_score = max(50.0, 90.0 - ((0.95 - price_ratio) * 150.0))

            # 2. Distance Score (0 - 100): Lower distance = higher score
            if dist_km <= 15.0:
                dist_score = 100.0
            elif dist_km <= 50.0:
                dist_score = 90.0 - ((dist_km - 15.0) / 35.0) * 15.0
            elif dist_km <= 150.0:
                dist_score = 75.0 - ((dist_km - 50.0) / 100.0) * 25.0
            else:
                dist_score = max(35.0, 50.0 - ((dist_km - 150.0) / 300.0) * 15.0)

            # 3. Quantity Fit Score (0 - 100)
            if quantity_kg <= buyer["max_qty_kg"]:
                qty_score = 95.0
            else:
                qty_score = max(40.0, 95.0 - ((quantity_kg - buyer["max_qty_kg"]) / quantity_kg) * 50.0)

            # 4. Reliability Score (0 - 100) based on rating (4.0 - 5.0)
            rel_score = min(100.0, (buyer["rating"] / 5.0) * 100.0)

            # 5. Crop Relevance Penalty if buyer doesn't typically buy this crop
            relevance_mult = 1.0 if crop_match else 0.75

            # Weighted overall score
            # Weights: Price (35%), Distance (25%), Reliability (20%), Quantity Fit (20%)
            raw_score = (
                0.35 * price_score +
                0.25 * dist_score +
                0.20 * rel_score +
                0.20 * qty_score
            ) * relevance_mult

            overall_score = round(min(99.0, max(50.0, raw_score)), 1)

            # Feasibility Badge
            if overall_score >= 90.0:
                badge = "BEST OVERALL MATCH"
            elif offered_price > expected_price_per_kg:
                badge = "HIGHEST PAYOUT"
            elif dist_km < 30.0:
                badge = "NEARBY BUYER"
            else:
                badge = "VERIFIED INSTITUTIONAL"

            matched.append(MatchedBuyerOut(
                buyer_id=buyer["id"],
                buyer_name=buyer["name"],
                buyer_company=buyer["company"],
                buyer_rating=buyer["rating"],
                location=buyer["location"],
                distance_km=dist_km,
                offered_price_per_kg=offered_price,
                quantity_requested_kg=min(quantity_kg, buyer["max_qty_kg"]),
                overall_match_score=overall_score,
                price_score=round(price_score, 1),
                distance_score=round(dist_score, 1),
                reliability_score=round(rel_score, 1),
                payment_speed=buyer["payment_speed"],
                feasibility_badge=badge
            ))

        # Sort descending by match score
        matched.sort(key=lambda x: x.overall_match_score, reverse=True)
        return matched

buyer_matcher = BuyerMatcher()

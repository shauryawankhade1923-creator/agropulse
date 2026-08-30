import datetime
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- User & Auth Schemas ---
class UserBase(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    role: str = "FARMER"
    location: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None

class UserCreate(UserBase):
    password: Optional[str] = None

class UserOut(UserBase):
    id: int
    rating: float
    verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# --- Produce Schemas ---
class ProduceCreate(BaseModel):
    farmer_id: Optional[int] = 1
    crop_name: str
    variety: Optional[str] = None
    quantity_kg: float
    harvest_date: Optional[str] = None
    quality_grade: Optional[str] = "A"
    moisture_content: Optional[float] = 12.0
    location: str
    lat: Optional[float] = 19.9975
    lon: Optional[float] = 73.7898
    expected_price_per_kg: float
    notes: Optional[str] = None
    image_url: Optional[str] = None
    ai_vision_verified: Optional[bool] = False
    ai_quality_score: Optional[float] = None
    ai_ripeness_stage: Optional[str] = None
    ai_inspection_notes: Optional[str] = None

class ProduceOut(BaseModel):
    id: int
    farmer_id: int
    farmer_name: Optional[str] = None
    farmer_phone: Optional[str] = None
    crop_name: str
    variety: Optional[str] = None
    quantity_kg: float
    harvest_date: Optional[str] = None
    quality_grade: str
    moisture_content: float
    location: str
    lat: Optional[float] = None
    lon: Optional[float] = None
    expected_price_per_kg: float
    ai_recommended_min: Optional[float] = None
    ai_recommended_max: Optional[float] = None
    ai_confidence_score: Optional[float] = 0.9
    ai_vision_verified: Optional[bool] = False
    ai_quality_score: Optional[float] = None
    ai_ripeness_stage: Optional[str] = None
    ai_inspection_notes: Optional[str] = None
    status: str
    image_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- AI Recommendation Schemas ---
class FactorImpact(BaseModel):
    factor_name: str
    impact_pct: float
    description: str

class PriceRecommendationRequest(BaseModel):
    crop_name: str
    variety: Optional[str] = "Standard"
    quantity_kg: float
    location: str
    quality_grade: Optional[str] = "A"
    moisture_content: Optional[float] = 12.0
    season: Optional[str] = "Kharif"
    lat: Optional[float] = None
    lon: Optional[float] = None

class PriceRecommendationResponse(BaseModel):
    crop_name: str
    recommended_min_per_kg: float
    recommended_target_per_kg: float
    recommended_max_per_kg: float
    msp_price_per_kg: float
    historical_avg_per_kg: float
    confidence_score: float
    demand_trend: str
    factors: List[FactorImpact]
    market_insights: str

# --- Buyer Matching Schemas ---
class MatchedBuyerOut(BaseModel):
    buyer_id: int
    buyer_name: str
    buyer_company: str
    location: str
    distance_km: float
    buyer_rating: float
    offered_price_per_kg: float
    quantity_requested_kg: float
    overall_match_score: float
    feasibility_badge: str  # "HIGHLY FEASIBLE", "RECOMMENDED", "VIABLE"
    payment_speed: str

class BuyerOfferCreate(BaseModel):
    produce_id: int
    buyer_id: int
    offered_price_per_kg: float
    quantity_requested_kg: float
    message: Optional[str] = None

class BuyerOfferOut(BaseModel):
    id: int
    produce_id: int
    crop_name: Optional[str] = None
    buyer_id: int
    buyer_name: Optional[str] = None
    offered_price_per_kg: float
    quantity_requested_kg: float
    match_score: float
    status: str
    message: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# --- Procurement Center & Slot Schemas ---
class CenterOut(BaseModel):
    id: int
    name: str
    code: str
    location: str
    state: str
    lat: float
    lon: float
    total_counters: int
    active_counters: int
    avg_processing_mins: float
    daily_capacity_kg: float
    operating_hours: str
    distance_km: Optional[float] = None
    active_queue_count: Optional[int] = 0

    class Config:
        from_attributes = True

class SlotOut(BaseModel):
    id: int
    center_id: int
    date_str: str
    time_slot: str
    max_tokens: int
    booked_tokens: int
    available_tokens: int

    class Config:
        from_attributes = True

# --- Digital Token & Live Queue Schemas ---
class TokenBookRequest(BaseModel):
    farmer_id: int
    produce_id: int
    center_id: int
    slot_id: int

class DigitalTokenOut(BaseModel):
    id: int
    token_number: str
    farmer_id: int
    farmer_name: Optional[str] = None
    farmer_phone: Optional[str] = None
    produce_id: int
    crop_name: Optional[str] = None
    quantity_kg: Optional[float] = None
    center_id: int
    center_name: Optional[str] = None
    center_location: Optional[str] = None
    slot_time: Optional[str] = None
    slot_date: Optional[str] = None
    status: str
    assigned_counter: Optional[int] = None
    qr_payload: str
    estimated_wait_minutes: float
    queue_position: int
    created_at: datetime

    class Config:
        from_attributes = True

class QueueWaitPredictionRequest(BaseModel):
    center_id: int
    farmers_ahead: int
    quantity_kg: float
    active_counters: int = 3
    crop_name: Optional[str] = "Onion"

class QueueWaitPredictionResponse(BaseModel):
    estimated_wait_minutes: int
    confidence_interval: str  # e.g., "25 - 35 mins"
    processing_speed_kg_per_hr: float
    current_counter_workload: str  # "Normal", "Heavy", "Peak"
    recommended_arrival_time: str

class TokenAdvanceStageRequest(BaseModel):
    token_id: int
    new_stage: str  # CHECKED_IN, IN_INSPECTION, WEIGHING, APPROVED, REJECTED, COMPLETED
    counter_number: Optional[int] = 1
    measured_weight_kg: Optional[float] = None
    final_grade: Optional[str] = "A"
    final_rate_per_kg: Optional[float] = None
    notes: Optional[str] = None

# --- Procurement & Payment Schemas ---
class ProcurementRecordOut(BaseModel):
    id: int
    token_number: str
    farmer_name: str
    crop_name: str
    measured_weight_kg: float
    final_grade: str
    final_rate_per_kg: float
    gross_amount: float
    mandi_cess_deduction: float
    net_payable: float
    created_at: datetime

class PaymentRecordOut(BaseModel):
    id: int
    procurement_id: int
    token_number: Optional[str] = None
    farmer_name: Optional[str] = None
    crop_name: Optional[str] = None
    center_name: Optional[str] = None
    measured_weight_kg: Optional[float] = None
    final_grade: Optional[str] = None
    final_rate_per_kg: Optional[float] = None
    gross_amount: Optional[float] = None
    mandi_cess_deduction: Optional[float] = None
    amount: float
    payment_mode: str
    status: str
    transaction_ref: str
    utr_number: str
    bank_account_masked: str
    paid_at: datetime

    class Config:
        from_attributes = True

# --- Smart Freight & Logistics Pooling Schemas ---
class VehicleProviderOut(BaseModel):
    id: int
    driver_name: str
    phone: str
    vehicle_type: str
    vehicle_number: str
    max_capacity_kg: float
    rate_per_km: float
    rating: float
    verified: bool

    class Config:
        from_attributes = True

class PoolMemberOut(BaseModel):
    id: int
    pool_id: int
    farmer_id: int
    farmer_name: Optional[str] = None
    crop_name: Optional[str] = None
    pickup_location: str
    pickup_time: str
    loaded_weight_kg: float
    calculated_fare: float
    solo_alternative_fare: float
    savings_amount: float
    booking_status: str
    consignment_code: str
    created_at: datetime

    class Config:
        from_attributes = True

class LogisticsPoolOut(BaseModel):
    id: int
    pool_code: str
    vehicle_id: int
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    vehicle_type: Optional[str] = None
    vehicle_number: Optional[str] = None
    destination_center_id: int
    destination_mandi: Optional[str] = None
    departure_date: str
    departure_time_window: str
    route_summary: str
    total_capacity_kg: float
    booked_capacity_kg: float
    available_capacity_kg: Optional[float] = 0.0
    capacity_percentage: Optional[float] = 0.0
    status: str
    solo_estimated_cost: float
    pooled_base_fare: float
    estimated_savings_percent: float
    member_count: Optional[int] = 0
    members: Optional[List[PoolMemberOut]] = []

    class Config:
        from_attributes = True

class JoinPoolRequest(BaseModel):
    pool_id: int
    farmer_id: int
    produce_id: int
    pickup_location: str
    pickup_time: Optional[str] = "06:30 AM"

class CreatePoolRequest(BaseModel):
    vehicle_id: int
    destination_center_id: int
    departure_date: str
    departure_time_window: str
    route_summary: str
    total_capacity_kg: float
    solo_estimated_cost: Optional[float] = 3600.0

class FreightCostEstimateRequest(BaseModel):
    farmer_weight_kg: float
    pickup_distance_km: float
    destination_center_id: int

# --- Notification Schemas ---
class NotificationLogOut(BaseModel):
    id: int
    channel: str  # WHATSAPP, SMS, APP
    recipient_phone: str
    recipient_name: Optional[str] = None
    event_type: str
    title: str
    message_content: str
    status: str
    is_read: Optional[bool] = False
    reference_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SendNotificationRequest(BaseModel):
    channel: str = "SMS"  # WHATSAPP, SMS, APP
    recipient_phone: str
    recipient_name: Optional[str] = "Ramesh Patil"
    event_type: str = "BID_ACCEPTED"
    title: str
    message_content: str
    reference_id: Optional[str] = None

class SendSMSRequest(BaseModel):
    recipient_phone: str = "7020975052"
    recipient_name: Optional[str] = "Ramesh Patil"
    template_type: str = "BID_ALERT"  # BID_ALERT, DEAL_LOCKED, TOKEN_PASS, GATE_ENTRY, DBT_PAYOUT, FREIGHT_SLIP, CUSTOM
    message_text: Optional[str] = None
    reference_id: Optional[str] = None

class MarkNotificationReadRequest(BaseModel):
    notification_id: Optional[int] = None
    mark_all: bool = False
    phone: Optional[str] = None

# --- Analytics Schemas ---
class AnalyticsSummary(BaseModel):
    total_farmers_active: int
    total_produce_listed_kg: float
    total_procured_kg: float
    total_payments_disbursed: float
    active_tokens_today: int
    avg_waiting_time_minutes: float
    queue_throughput_per_hour: float
    crop_procurement_breakdown: List[Dict[str, Any]]
    price_trends_7d: List[Dict[str, Any]]
    mandi_performance: List[Dict[str, Any]]

# --- Trade Review & Reputation Schemas ---
class TradeReviewCreate(BaseModel):
    reviewer_id: int
    reviewee_id: int
    reviewer_role: str  # "FARMER" or "BUYER"
    produce_id: Optional[int] = None
    rating: float  # 1.0 to 5.0
    quality_score: Optional[float] = 5.0
    timeliness_score: Optional[float] = 5.0
    review_title: Optional[str] = None
    review_text: str
    trust_tags: Optional[str] = "Fair Price,Fast Payment,Accurate Weight"

class TradeReviewOut(BaseModel):
    id: int
    reviewer_id: int
    reviewer_name: Optional[str] = None
    reviewer_role: str
    reviewee_id: int
    reviewee_name: Optional[str] = None
    produce_id: Optional[int] = None
    crop_name: Optional[str] = None
    rating: float
    quality_score: float
    timeliness_score: float
    review_title: Optional[str] = None
    review_text: str
    trust_tags: Optional[str] = None
    is_verified_trade: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserReputationSummaryOut(BaseModel):
    user_id: int
    user_name: str
    role: str
    average_rating: float
    total_reviews: int
    verified_deals_count: int
    quality_avg: float
    timeliness_avg: float
    rating_distribution: Dict[str, int]
    top_trust_tags: List[str]
    recent_reviews: List[TradeReviewOut]

# --- AI Computer Vision Quality Grading Schemas ---
class VisualDefectMarker(BaseModel):
    defect_type: str  # "Surface Lesion", "Blemish", "Discoloration", "Sprouting", "Cracking", "Foreign Matter"
    severity: str     # "None", "Low", "Moderate", "High"
    confidence: float
    bounding_box: List[float]  # [ymin, xmin, ymax, xmax] as percentage 0-100
    description: str

class QualityScoreBreakdown(BaseModel):
    surface_integrity: float   # 0 to 100
    color_uniformity: float    # 0 to 100
    size_consistency: float    # 0 to 100
    maturity_index: float      # 0 to 100
    foreign_matter_pct: float  # e.g. 0.2%

class VisionQualityAnalysisRequest(BaseModel):
    crop_name: Optional[str] = "Auto-Detect"
    image_base64: Optional[str] = None
    sample_key: Optional[str] = None
    auto_detect_produce: bool = True

class VisionQualityAnalysisResponse(BaseModel):
    detected_fruit_or_crop: str
    fruit_category: str  # "FRUIT", "VEGETABLE", "GRAIN", "PULSE", "CASH_CROP"
    fruit_detection_confidence: float  # e.g. 0.98
    produce_icon: str  # e.g. "🍎", "🍌", "🥭", "🍊", "🍅", "🧅"
    variety_detected: str
    ripeness_stage: str  # "Optimal Ripe (Export Grade)", "Early Ripe", "Overripe", "Mature"
    predicted_grade: str  # "A", "B", "C"
    confidence_score: float  # 0.0 to 1.0 (e.g. 0.94)
    overall_quality_score: float  # 0 to 100 (e.g. 93.5)
    estimated_moisture_pct: float  # e.g. 11.2
    visual_scores: QualityScoreBreakdown
    defects_detected: List[VisualDefectMarker]
    price_multiplier: float  # e.g. 1.05 for Grade A premium, 0.82 for Grade C
    suggested_price_adjustment_pct: float  # e.g. +8.0% or -15.0%
    agmark_standard_summary: str
    inspection_notes: str
    classification_reasoning: str
    analyzed_image_base64: Optional[str] = None

class SampleSpecimenOut(BaseModel):
    key: str
    crop_name: str
    fruit_category: Optional[str] = "FRUIT"
    variety: str
    expected_grade: str
    title: str
    description: str
    thumbnail_icon: str
    image_base64: Optional[str] = None

# --- AI Real-Time Queue Detection & CCTV Vision Schemas ---
class DetectedQueueEntity(BaseModel):
    entity_type: str  # "TRACTOR", "TRUCK", "TEMPO", "FARMER"
    display_label: str
    confidence: float
    bounding_box: List[float]  # [ymin, xmin, ymax, xmax]

class EntityCountBreakdown(BaseModel):
    tractors: int
    heavy_trucks: int
    pickup_tempos: int
    farmers_pedestrians: int

class CounterLoadStatus(BaseModel):
    counter_id: int
    counter_name: str
    status: str  # "IDLE", "LOW_LOAD", "OPTIMAL", "CONGESTED"
    vehicles_queued: int
    load_percentage: float
    est_clearance_minutes: float

class QueueVisionAnalysisRequest(BaseModel):
    image_base64: Optional[str] = None
    sample_key: Optional[str] = None
    center_id: Optional[int] = 1
    active_counters: Optional[int] = 4

class QueueVisionAnalysisResponse(BaseModel):
    cctv_feed_name: str
    timestamp: str
    total_vehicles_detected: int
    entity_breakdown: EntityCountBreakdown
    queue_density_percentage: float
    queue_length_meters: float
    congestion_level: str  # "CLEAR", "MODERATE", "CONGESTED", "CRITICAL_BOTTLENECK"
    congestion_label: str
    congestion_color_hex: str
    estimated_wait_minutes: float
    confidence_interval: str
    bottleneck_warning: bool
    load_balancing_recommendation: str
    active_counters_status: List[CounterLoadStatus]
    detected_entities_list: List[DetectedQueueEntity]
    analyzed_cctv_frame_base64: Optional[str] = None

class CCTVQueueSpecimenOut(BaseModel):
    key: str
    title: str
    gate_name: str
    center_id: int
    description: str
    tractors_count: int
    trucks_count: int
    tempos_count: int
    farmers_count: int
    image_base64: Optional[str] = None

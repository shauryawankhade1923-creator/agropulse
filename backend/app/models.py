import datetime
import enum
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from .database import Base

class UserRole(str, enum.Enum):
    FARMER = "FARMER"
    BUYER = "BUYER"
    OPERATOR = "OPERATOR"
    ADMIN = "ADMIN"

class ProduceStatus(str, enum.Enum):
    LISTED = "LISTED"
    MATCHED = "MATCHED"
    SLOT_BOOKED = "SLOT_BOOKED"
    IN_TRANSIT = "IN_TRANSIT"
    PROCURED = "PROCURED"
    REJECTED = "REJECTED"

class TokenStatus(str, enum.Enum):
    BOOKED = "BOOKED"
    CHECKED_IN = "CHECKED_IN"
    IN_INSPECTION = "IN_INSPECTION"
    WEIGHING = "WEIGHING"
    APPROVED = "APPROVED"
    COMPLETED = "COMPLETED"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"

class OfferStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    COUNTERED = "COUNTERED"

class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    SETTLED = "SETTLED"
    FAILED = "FAILED"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=True)
    hashed_password = Column(String(200), nullable=True)
    role = Column(String(20), default=UserRole.FARMER.value)
    location = Column(String(200), nullable=True)
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)
    rating = Column(Float, default=4.8)
    review_count = Column(Integer, default=5)
    verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    produces = relationship("Produce", back_populates="farmer")
    tokens = relationship("DigitalToken", back_populates="farmer")
    buyer_offers = relationship("BuyerOffer", back_populates="buyer")

class Produce(Base):
    __tablename__ = "produces"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop_name = Column(String(100), nullable=False)
    variety = Column(String(100), nullable=True)
    quantity_kg = Column(Float, nullable=False)
    quality_grade = Column(String(10), default="A")
    moisture_content = Column(Float, default=12.0)
    location = Column(String(200), nullable=False)
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)
    expected_price_per_kg = Column(Float, nullable=False)
    ai_recommended_min = Column(Float, nullable=True)
    ai_recommended_max = Column(Float, nullable=True)
    ai_confidence_score = Column(Float, default=0.92)
    ai_vision_verified = Column(Boolean, default=False)
    ai_quality_score = Column(Float, nullable=True)
    ai_ripeness_stage = Column(String(100), nullable=True)
    ai_inspection_notes = Column(Text, nullable=True)
    status = Column(String(20), default=ProduceStatus.LISTED.value)
    image_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farmer = relationship("User", back_populates="produces")
    tokens = relationship("DigitalToken", back_populates="produce")
    offers = relationship("BuyerOffer", back_populates="produce")

class BuyerOffer(Base):
    __tablename__ = "buyer_offers"

    id = Column(Integer, primary_key=True, index=True)
    produce_id = Column(Integer, ForeignKey("produces.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    offered_price_per_kg = Column(Float, nullable=False)
    quantity_requested_kg = Column(Float, nullable=False)
    match_score = Column(Float, default=85.0)
    status = Column(String(20), default=OfferStatus.PENDING.value)
    message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    produce = relationship("Produce", back_populates="offers")
    buyer = relationship("User", back_populates="buyer_offers")

class ProcurementCenter(Base):
    __tablename__ = "procurement_centers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    code = Column(String(20), unique=True, index=True, nullable=False)
    location = Column(String(200), nullable=False)
    state = Column(String(100), default="Maharashtra")
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    total_counters = Column(Integer, default=4)
    active_counters = Column(Integer, default=3)
    avg_processing_mins = Column(Float, default=12.0)
    daily_capacity_kg = Column(Float, default=50000.0)
    contact_phone = Column(String(20), nullable=True)
    operating_hours = Column(String(100), default="08:00 AM - 06:00 PM")

    slots = relationship("Slot", back_populates="center")
    tokens = relationship("DigitalToken", back_populates="center")

class Slot(Base):
    __tablename__ = "slots"

    id = Column(Integer, primary_key=True, index=True)
    center_id = Column(Integer, ForeignKey("procurement_centers.id"), nullable=False)
    date_str = Column(String(20), nullable=False)  # YYYY-MM-DD
    time_slot = Column(String(50), nullable=False)  # e.g., "09:00 AM - 11:00 AM"
    max_tokens = Column(Integer, default=20)
    booked_tokens = Column(Integer, default=0)

    center = relationship("ProcurementCenter", back_populates="slots")
    tokens = relationship("DigitalToken", back_populates="slot")

class DigitalToken(Base):
    __tablename__ = "digital_tokens"

    id = Column(Integer, primary_key=True, index=True)
    token_number = Column(String(30), unique=True, index=True, nullable=False)  # e.g. AP-2026-0247
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    produce_id = Column(Integer, ForeignKey("produces.id"), nullable=False)
    center_id = Column(Integer, ForeignKey("procurement_centers.id"), nullable=False)
    slot_id = Column(Integer, ForeignKey("slots.id"), nullable=False)
    status = Column(String(20), default=TokenStatus.BOOKED.value)
    assigned_counter = Column(Integer, nullable=True)
    qr_payload = Column(Text, nullable=False)
    estimated_wait_minutes = Column(Float, default=25.0)
    queue_position = Column(Integer, default=1)
    checkin_time = Column(DateTime, nullable=True)
    completed_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farmer = relationship("User", back_populates="tokens")
    produce = relationship("Produce", back_populates="tokens")
    center = relationship("ProcurementCenter", back_populates="tokens")
    slot = relationship("Slot", back_populates="tokens")
    queue_entry = relationship("QueueEntry", back_populates="token", uselist=False)
    procurement_record = relationship("ProcurementRecord", back_populates="token", uselist=False)

class QueueEntry(Base):
    __tablename__ = "queue_entries"

    id = Column(Integer, primary_key=True, index=True)
    token_id = Column(Integer, ForeignKey("digital_tokens.id"), nullable=False, unique=True)
    center_id = Column(Integer, ForeignKey("procurement_centers.id"), nullable=False)
    counter_number = Column(Integer, default=1)
    stage = Column(String(30), default="WAITING")  # WAITING, INSPECTION, WEIGHING, SETTLEMENT, DONE
    priority = Column(Integer, default=1)  # 1 Normal, 2 High
    arrival_time = Column(DateTime, default=datetime.datetime.utcnow)
    stage_started_at = Column(DateTime, nullable=True)

    token = relationship("DigitalToken", back_populates="queue_entry")

class ProcurementRecord(Base):
    __tablename__ = "procurement_records"

    id = Column(Integer, primary_key=True, index=True)
    token_id = Column(Integer, ForeignKey("digital_tokens.id"), nullable=False, unique=True)
    produce_id = Column(Integer, ForeignKey("produces.id"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    center_id = Column(Integer, ForeignKey("procurement_centers.id"), nullable=False)
    operator_name = Column(String(100), default="APMC Senior Inspector")
    
    measured_weight_kg = Column(Float, nullable=False)
    final_grade = Column(String(10), default="A")
    moisture_tested = Column(Float, default=11.5)
    final_rate_per_kg = Column(Float, nullable=False)
    gross_amount = Column(Float, nullable=False)
    mandi_cess_deduction = Column(Float, default=0.0)
    net_payable = Column(Float, nullable=False)
    quality_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    token = relationship("DigitalToken", back_populates="procurement_record")
    payment = relationship("PaymentRecord", back_populates="procurement", uselist=False)

class PaymentRecord(Base):
    __tablename__ = "payment_records"

    id = Column(Integer, primary_key=True, index=True)
    procurement_id = Column(Integer, ForeignKey("procurement_records.id"), nullable=False, unique=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    payment_mode = Column(String(30), default="DIRECT_BANK_DBT")  # UPI, DIRECT_BANK_DBT, ESCROW
    status = Column(String(20), default=PaymentStatus.SETTLED.value)
    transaction_ref = Column(String(60), unique=True, nullable=False)
    utr_number = Column(String(50), nullable=False)
    bank_account_masked = Column(String(30), default="XXXX-XXXX-4819")
    paid_at = Column(DateTime, default=datetime.datetime.utcnow)

    procurement = relationship("ProcurementRecord", back_populates="payment")

# ==========================================
# SMART FREIGHT & KISAN LOGISTICS POOLING
# ==========================================

class VehicleProvider(Base):
    __tablename__ = "vehicle_providers"

    id = Column(Integer, primary_key=True, index=True)
    driver_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    vehicle_type = Column(String(50), nullable=False) # e.g. "Eicher Pro 10-Ton (6-Wheeler)", "Tata 407 (4-Ton)", "Mahindra Bolero Maxi Truck (2-Ton)"
    vehicle_number = Column(String(30), nullable=False) # e.g. "MH-15-EG-4821"
    max_capacity_kg = Column(Float, nullable=False) # e.g. 10000.0
    rate_per_km = Column(Float, default=32.0)
    base_fare = Column(Float, default=1200.0)
    rating = Column(Float, default=4.8)
    verified = Column(Boolean, default=True)

    pools = relationship("LogisticsPool", back_populates="vehicle")

class LogisticsPool(Base):
    __tablename__ = "logistics_pools"

    id = Column(Integer, primary_key=True, index=True)
    pool_code = Column(String(30), unique=True, index=True, nullable=False) # e.g. "POOL-NSK-084"
    vehicle_id = Column(Integer, ForeignKey("vehicle_providers.id"), nullable=False)
    destination_center_id = Column(Integer, ForeignKey("procurement_centers.id"), nullable=False)
    departure_date = Column(String(20), nullable=False) # YYYY-MM-DD
    departure_time_window = Column(String(50), nullable=False) # "06:00 AM - 08:00 AM"
    route_summary = Column(String(200), nullable=False) # "Niphad -> Dindori -> Nashik APMC Mandi"
    total_capacity_kg = Column(Float, nullable=False)
    booked_capacity_kg = Column(Float, default=0.0)
    status = Column(String(20), default="OPEN") # OPEN, FULL, DISPATCHED, COMPLETED
    solo_estimated_cost = Column(Float, default=3500.0)
    pooled_base_fare = Column(Float, default=1600.0)
    estimated_savings_percent = Column(Float, default=52.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    vehicle = relationship("VehicleProvider", back_populates="pools")
    destination_center = relationship("ProcurementCenter")
    members = relationship("PoolMember", back_populates="pool")

class PoolMember(Base):
    __tablename__ = "pool_members"

    id = Column(Integer, primary_key=True, index=True)
    pool_id = Column(Integer, ForeignKey("logistics_pools.id"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    produce_id = Column(Integer, ForeignKey("produces.id"), nullable=False)
    pickup_location = Column(String(200), nullable=False)
    pickup_time = Column(String(50), nullable=False) # "06:30 AM"
    loaded_weight_kg = Column(Float, nullable=False)
    calculated_fare = Column(Float, nullable=False)
    solo_alternative_fare = Column(Float, nullable=False)
    savings_amount = Column(Float, nullable=False)
    booking_status = Column(String(20), default="CONFIRMED") # CONFIRMED, PICKED_UP, DELIVERED
    consignment_code = Column(String(30), unique=True, nullable=False) # "FRG-2026-9021"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    pool = relationship("LogisticsPool", back_populates="members")
    farmer = relationship("User")
    produce = relationship("Produce")

# ==========================================
# WHATSAPP & SMS NOTIFICATION LOGS
# ==========================================

class NotificationLog(Base):
    __tablename__ = "notification_logs"

    id = Column(Integer, primary_key=True, index=True)
    channel = Column(String(20), default="SMS")  # WHATSAPP, SMS, APP
    recipient_phone = Column(String(30), nullable=False)
    recipient_name = Column(String(100), nullable=True)
    event_type = Column(String(50), nullable=False)  # BID_RECEIVED, BID_ACCEPTED, TOKEN_ISSUED, QUEUE_ALERT, PAYMENT_SETTLED, FREIGHT_BOOKED, ADVISORY
    title = Column(String(150), nullable=False)
    message_content = Column(Text, nullable=False)
    status = Column(String(20), default="DELIVERED")  # SENT, DELIVERED, READ, FAILED
    is_read = Column(Boolean, default=False)
    reference_id = Column(String(60), nullable=True)  # Token, Consignment, or UTR number
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# ==========================================
# TRADE & REPUTATION REVIEW SYSTEM
# ==========================================

class TradeReview(Base):
    __tablename__ = "trade_reviews"

    id = Column(Integer, primary_key=True, index=True)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reviewee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reviewer_role = Column(String(20), nullable=False) # "FARMER" or "BUYER"
    produce_id = Column(Integer, ForeignKey("produces.id"), nullable=True)
    rating = Column(Float, nullable=False) # 1.0 to 5.0
    quality_score = Column(Float, default=5.0) # Quality / Weighment
    timeliness_score = Column(Float, default=5.0) # Promptness / Payment speed
    review_title = Column(String(150), nullable=True)
    review_text = Column(Text, nullable=False)
    trust_tags = Column(String(250), nullable=True) # e.g. "Fast Payment,Accurate Weight,Good Packaging"
    is_verified_trade = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    reviewer = relationship("User", foreign_keys=[reviewer_id])
    reviewee = relationship("User", foreign_keys=[reviewee_id])
    produce = relationship("Produce")


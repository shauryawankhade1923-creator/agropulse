import sys
import os
import json
import uuid
from datetime import datetime, timedelta

# Ensure backend root is on python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import engine, Base, SessionLocal
from app.models import (
    User, UserRole, Produce, ProduceStatus, BuyerOffer, OfferStatus,
    ProcurementCenter, Slot, DigitalToken, TokenStatus, QueueEntry,
    ProcurementRecord, PaymentRecord, PaymentStatus,
    VehicleProvider, LogisticsPool, PoolMember, NotificationLog
)

def seed_all_data():
    print("[*] Rebuilding Database Tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    print("[*] Seeding Verified Farmers and Institutional Buyers...")
    farmer1 = User(
        name="Ramesh Patil",
        phone="7020975052",
        email="ramesh.patil@kisanmail.in",
        role=UserRole.FARMER.value,
        location="Pimpalgaon Baswant, Nashik, Maharashtra",
        lat=20.1691,
        lon=73.9877,
        rating=4.9,
        verified=True
    )
    farmer2 = User(
        name="Balvinder Singh",
        phone="9876543211",
        email="balvinder.singh@punjabkrishi.in",
        role=UserRole.FARMER.value,
        location="Samrala Road, Khanna, Punjab",
        lat=30.7073,
        lon=76.2163,
        rating=4.8,
        verified=True
    )
    farmer3 = User(
        name="Kishore Gaikwad",
        phone="9876543212",
        email="kishore.g@kisanmail.in",
        role=UserRole.FARMER.value,
        location="Lasalgaon Rural, Nashik, Maharashtra",
        lat=20.1472,
        lon=74.2257,
        rating=4.7,
        verified=True
    )

    buyer1 = User(
        name="Rajesh Aggarwal",
        phone="9812345678",
        email="procurement@kisanagrofoods.com",
        role=UserRole.BUYER.value,
        location="Nashik MIDC, Maharashtra",
        lat=19.9635,
        lon=73.8347,
        rating=4.9,
        verified=True
    )
    buyer2 = User(
        name="Suresh Deshmukh",
        phone="9812345679",
        email="suresh.export@mahadelta.com",
        role=UserRole.BUYER.value,
        location="Vashi APMC Market, Navi Mumbai",
        lat=19.0760,
        lon=72.9977,
        rating=4.8,
        verified=True
    )

    db.add_all([farmer1, farmer2, farmer3, buyer1, buyer2])
    db.commit()
    db.refresh(farmer1)
    db.refresh(farmer2)
    db.refresh(farmer3)
    db.refresh(buyer1)
    db.refresh(buyer2)

    print("[*] Seeding APMC Procurement Centers...")
    center1 = ProcurementCenter(
        name="Nashik Main APMC Market Yard",
        code="APMC-NSK-01",
        location="Panchavati, Nashik, Maharashtra",
        state="Maharashtra",
        lat=19.9975,
        lon=73.7898,
        total_counters=5,
        active_counters=4,
        avg_processing_mins=11.5,
        daily_capacity_kg=60000.0,
        contact_phone="+91-253-2512345",
        operating_hours="07:30 AM - 06:30 PM"
    )
    center2 = ProcurementCenter(
        name="Lasalgaon Onion Mega Mandi",
        code="APMC-LSG-02",
        location="Lasalgaon, Niphad, Nashik, Maharashtra",
        state="Maharashtra",
        lat=20.1472,
        lon=74.2257,
        total_counters=6,
        active_counters=5,
        avg_processing_mins=9.0,
        daily_capacity_kg=85000.0,
        contact_phone="+91-2550-266123",
        operating_hours="07:00 AM - 07:00 PM"
    )
    center3 = ProcurementCenter(
        name="Khanna Grain Market (Asia's Largest)",
        code="APMC-KHN-03",
        location="GT Road, Khanna, Ludhiana, Punjab",
        state="Punjab",
        lat=30.7073,
        lon=76.2163,
        total_counters=8,
        active_counters=6,
        avg_processing_mins=10.0,
        daily_capacity_kg=120000.0,
        contact_phone="+91-1628-223456",
        operating_hours="08:00 AM - 06:00 PM"
    )
    center4 = ProcurementCenter(
        name="Guntur Mirchi Yard",
        code="APMC-GNT-04",
        location="Chilli Market Yard, Guntur, Andhra Pradesh",
        state="Andhra Pradesh",
        lat=16.3067,
        lon=80.4365,
        total_counters=4,
        active_counters=3,
        avg_processing_mins=13.0,
        daily_capacity_kg=45000.0,
        contact_phone="+91-863-2223344",
        operating_hours="08:00 AM - 05:30 PM"
    )

    db.add_all([center1, center2, center3, center4])
    db.commit()
    db.refresh(center1)
    db.refresh(center2)
    db.refresh(center3)
    db.refresh(center4)

    print("[*] Seeding Procurement Slots...")
    today_str = datetime.now().strftime("%Y-%m-%d")

    slot1 = Slot(center_id=center1.id, date_str=today_str, time_slot="08:00 AM - 10:00 AM", max_tokens=25, booked_tokens=18)
    slot2 = Slot(center_id=center1.id, date_str=today_str, time_slot="10:00 AM - 12:00 PM", max_tokens=25, booked_tokens=22)
    slot3 = Slot(center_id=center1.id, date_str=today_str, time_slot="01:00 PM - 03:00 PM", max_tokens=25, booked_tokens=12)
    slot4 = Slot(center_id=center1.id, date_str=today_str, time_slot="03:00 PM - 05:00 PM", max_tokens=25, booked_tokens=5)

    slot_lsg1 = Slot(center_id=center2.id, date_str=today_str, time_slot="08:30 AM - 11:00 AM", max_tokens=30, booked_tokens=20)
    slot_lsg2 = Slot(center_id=center2.id, date_str=today_str, time_slot="11:30 AM - 02:00 PM", max_tokens=30, booked_tokens=15)

    db.add_all([slot1, slot2, slot3, slot4, slot_lsg1, slot_lsg2])
    db.commit()
    db.refresh(slot1)
    db.refresh(slot2)
    db.refresh(slot3)

    print("[*] Seeding Produce Lots...")
    produce1 = Produce(
        farmer_id=farmer1.id,
        crop_name="Onion",
        variety="Garva Red Onion (Nashik Export Grade)",
        quantity_kg=2500.0,
        expected_price_per_kg=23.5,
        ai_recommended_min=21.8,
        ai_recommended_max=24.5,
        quality_grade="A",
        moisture_content=11.2,
        location="Pimpalgaon Baswant, Nashik",
        lat=20.1691,
        lon=73.9877,
        status=ProduceStatus.SLOT_BOOKED.value
    )
    produce2 = Produce(
        farmer_id=farmer1.id,
        crop_name="Tomato",
        variety="Abhinav Hybrid",
        quantity_kg=1200.0,
        expected_price_per_kg=26.0,
        ai_recommended_min=24.0,
        ai_recommended_max=28.5,
        quality_grade="A",
        moisture_content=14.5,
        location="Pimpalgaon Baswant, Nashik",
        lat=20.1691,
        lon=73.9877,
        status=ProduceStatus.LISTED.value
    )
    produce3 = Produce(
        farmer_id=farmer2.id,
        crop_name="Wheat",
        variety="Sharbati Premium Gold",
        quantity_kg=4000.0,
        expected_price_per_kg=25.0,
        ai_recommended_min=23.5,
        ai_recommended_max=26.2,
        quality_grade="A",
        moisture_content=11.8,
        location="Samrala Road, Khanna",
        lat=30.7073,
        lon=76.2163,
        status=ProduceStatus.LISTED.value
    )
    produce4 = Produce(
        farmer_id=farmer3.id,
        crop_name="Soybean",
        variety="JS 335 Certified",
        quantity_kg=3500.0,
        expected_price_per_kg=49.0,
        ai_recommended_min=47.5,
        ai_recommended_max=50.5,
        quality_grade="A",
        moisture_content=9.8,
        location="Lasalgaon Rural, Nashik",
        lat=20.1472,
        lon=74.2257,
        status=ProduceStatus.PROCURED.value
    )

    db.add_all([produce1, produce2, produce3, produce4])
    db.commit()
    db.refresh(produce1)
    db.refresh(produce2)
    db.refresh(produce3)
    db.refresh(produce4)

    print("[*] Seeding Digital Tokens and Queue Entries...")
    token1 = DigitalToken(
        token_number="AP-2026-0247",
        farmer_id=farmer1.id,
        produce_id=produce1.id,
        center_id=center1.id,
        slot_id=slot2.id,
        status=TokenStatus.IN_INSPECTION.value,
        assigned_counter=2,
        qr_payload=json.dumps({
            "token": "AP-2026-0247",
            "farmer": "Ramesh Patil",
            "phone": "7020975052",
            "crop": "Onion",
            "qty": 2500,
            "center": "APMC-NSK-01"
        }),
        estimated_wait_minutes=12.0,
        queue_position=2,
        checkin_time=datetime.utcnow() - timedelta(minutes=15)
    )

    token2 = DigitalToken(
        token_number="AP-2026-0248",
        farmer_id=farmer2.id,
        produce_id=produce3.id,
        center_id=center1.id,
        slot_id=slot2.id,
        status=TokenStatus.CHECKED_IN.value,
        assigned_counter=1,
        qr_payload=json.dumps({
            "token": "AP-2026-0248",
            "farmer": "Balvinder Singh",
            "crop": "Wheat",
            "qty": 4000,
            "center": "APMC-NSK-01"
        }),
        estimated_wait_minutes=24.0,
        queue_position=3,
        checkin_time=datetime.utcnow() - timedelta(minutes=5)
    )

    token3 = DigitalToken(
        token_number="AP-2026-0240",
        farmer_id=farmer3.id,
        produce_id=produce4.id,
        center_id=center1.id,
        slot_id=slot1.id,
        status=TokenStatus.COMPLETED.value,
        assigned_counter=3,
        qr_payload=json.dumps({
            "token": "AP-2026-0240",
            "farmer": "Kishore Gaikwad",
            "crop": "Soybean",
            "qty": 3500,
            "center": "APMC-NSK-01"
        }),
        estimated_wait_minutes=0.0,
        queue_position=0,
        checkin_time=datetime.utcnow() - timedelta(hours=2),
        completed_time=datetime.utcnow() - timedelta(minutes=45)
    )

    db.add_all([token1, token2, token3])
    db.commit()
    db.refresh(token1)
    db.refresh(token2)
    db.refresh(token3)

    q1 = QueueEntry(token_id=token1.id, center_id=center1.id, counter_number=2, stage="INSPECTION")
    q2 = QueueEntry(token_id=token2.id, center_id=center1.id, counter_number=1, stage="WAITING")
    db.add_all([q1, q2])
    db.commit()

    proc3 = ProcurementRecord(
        token_id=token3.id,
        produce_id=produce4.id,
        farmer_id=farmer3.id,
        center_id=center1.id,
        operator_name="S. M. Joshi (Quality Officer)",
        measured_weight_kg=3520.0,
        final_grade="A+",
        moisture_tested=9.6,
        final_rate_per_kg=49.5,
        gross_amount=174240.0,
        mandi_cess_deduction=1742.4,
        net_payable=172497.6,
        quality_notes="Certified Grade A+ soybean. Instant payout approved under DBT scheme."
    )
    db.add(proc3)
    db.commit()
    db.refresh(proc3)

    pay3 = PaymentRecord(
        procurement_id=proc3.id,
        farmer_id=farmer3.id,
        amount=172497.6,
        payment_mode="DIRECT_BANK_DBT",
        status=PaymentStatus.SETTLED.value,
        transaction_ref=f"AGP-TXN-{uuid.uuid4().hex[:10].upper()}",
        utr_number="UTR2026082690412847",
        bank_account_masked="HDFC-XXXX-9102",
        paid_at=datetime.utcnow() - timedelta(minutes=40)
    )
    db.add(pay3)
    db.commit()

    # Buyer Offer
    offer1 = BuyerOffer(
        produce_id=produce2.id,
        buyer_id=buyer1.id,
        offered_price_per_kg=27.0,
        quantity_requested_kg=1200.0,
        match_score=94.5,
        status=OfferStatus.PENDING.value,
        message="Interested in entire 1200 kg batch. Immediate dispatch pickup truck ready."
    )
    db.add(offer1)
    db.commit()

    # Vehicles & Logistics Pools
    print("[*] Seeding Registered Kisan Freight Vehicles & Transport Pools...")
    v1 = VehicleProvider(
        driver_name="Ganesh Shinde",
        phone="9823114455",
        vehicle_type="Eicher Pro 10-Ton (6-Wheeler Tarpaulin)",
        vehicle_number="MH-15-EG-4821",
        max_capacity_kg=10000.0,
        rate_per_km=34.0,
        base_fare=1200.0,
        rating=4.9,
        verified=True
    )
    v2 = VehicleProvider(
        driver_name="Tukaram Bhalerao",
        phone="9823117788",
        vehicle_type="Tata 407 (4-Ton High Deck)",
        vehicle_number="MH-15-AB-7702",
        max_capacity_kg=4000.0,
        rate_per_km=26.0,
        base_fare=850.0,
        rating=4.8,
        verified=True
    )
    v3 = VehicleProvider(
        driver_name="Praveen Jagtap",
        phone="9823119900",
        vehicle_type="Mahindra Bolero Maxi Truck (2-Ton)",
        vehicle_number="MH-15-CZ-3310",
        max_capacity_kg=2200.0,
        rate_per_km=19.0,
        base_fare=500.0,
        rating=4.7,
        verified=True
    )

    db.add_all([v1, v2, v3])
    db.commit()
    db.refresh(v1)
    db.refresh(v2)
    db.refresh(v3)

    pool1 = LogisticsPool(
        pool_code="POOL-NSK-084",
        vehicle_id=v1.id,
        destination_center_id=center1.id,
        departure_date=today_str,
        departure_time_window="06:30 AM - 08:00 AM",
        route_summary="Niphad -> Pimpalgaon -> Dindori -> Nashik Main APMC",
        total_capacity_kg=10000.0,
        booked_capacity_kg=5500.0,
        status="OPEN",
        solo_estimated_cost=3800.0,
        pooled_base_fare=1450.0,
        estimated_savings_percent=61.8
    )

    pool2 = LogisticsPool(
        pool_code="POOL-LSG-042",
        vehicle_id=v2.id,
        destination_center_id=center2.id,
        departure_date=today_str,
        departure_time_window="07:00 AM - 08:30 AM",
        route_summary="Chandwad -> Vani Road -> Lasalgaon Mega Mandi",
        total_capacity_kg=4000.0,
        booked_capacity_kg=1800.0,
        status="OPEN",
        solo_estimated_cost=2600.0,
        pooled_base_fare=1100.0,
        estimated_savings_percent=57.6
    )

    db.add_all([pool1, pool2])
    db.commit()
    db.refresh(pool1)
    db.refresh(pool2)

    m1 = PoolMember(
        pool_id=pool1.id,
        farmer_id=farmer2.id,
        produce_id=produce3.id,
        pickup_location="Pimpalgaon Rural Hub, Nashik",
        pickup_time="06:45 AM",
        loaded_weight_kg=4000.0,
        calculated_fare=1650.0,
        solo_alternative_fare=3800.0,
        savings_amount=2150.0,
        booking_status="CONFIRMED",
        consignment_code="FRG-2026-1048"
    )
    m2 = PoolMember(
        pool_id=pool1.id,
        farmer_id=farmer3.id,
        produce_id=produce4.id,
        pickup_location="Dindori Highway Junction",
        pickup_time="07:15 AM",
        loaded_weight_kg=1500.0,
        calculated_fare=850.0,
        solo_alternative_fare=2400.0,
        savings_amount=1550.0,
        booking_status="CONFIRMED",
        consignment_code="FRG-2026-1049"
    )
    db.add_all([m1, m2])
    db.commit()

    # ==========================================
    # SEEDING REALISTIC WHATSAPP & SMS LOGS
    # ==========================================
    print("[*] Seeding WhatsApp & SMS Notification Logs...")
    n1 = NotificationLog(
        channel="WHATSAPP",
        recipient_phone="7020975052",
        recipient_name="Ramesh Patil",
        event_type="BID_RECEIVED",
        title="📩 New Bid Received for Tomato (1,200 kg)",
        message_content=(
            "🌾 *AgroPulse Kisan Mandi Alert*\n\n"
            "Namaste *Ramesh Patil* ji,\n"
            "Buyer *Rajesh Aggarwal (Kisan Agro Foods)* has placed a verified bid for your *Tomato* lot!\n\n"
            "💰 *Offered Rate:* ₹27.00 / kg\n"
            "📦 *Quantity:* 1,200 kg (12.0 Quintals)\n"
            "💵 *Total Deal Value:* ₹32,400.00\n\n"
            "👉 Open AgroPulse to *Accept* or *Counter* this bid instantly.\n"
            "🔗 Link: https://agropulse.gov.in/bids/1"
        ),
        status="DELIVERED",
        reference_id="BID-1",
        created_at=datetime.utcnow() - timedelta(minutes=30)
    )

    n2 = NotificationLog(
        channel="WHATSAPP",
        recipient_phone="7020975052",
        recipient_name="Ramesh Patil",
        event_type="TOKEN_ISSUED",
        title="🎟️ Mandi E-Pass & QR Token: AP-2026-0247",
        message_content=(
            "🎟️ *AgroPulse Electronic Mandi Pass & QR Token*\n\n"
            "Namaste *Ramesh Patil* ji,\n"
            "Your procurement slot appointment has been confirmed!\n\n"
            "🏷️ *Token Number:* `AP-2026-0247`\n"
            "🏛️ *Mandi Center:* Nashik Main APMC Market Yard\n"
            "📅 *Arrival Date:* " + today_str + "\n"
            "⏰ *Time Slot:* 10:00 AM - 12:00 PM\n"
            "🏬 *Assigned Weighbridge:* Counter #2\n"
            "⏳ *AI Wait Time Estimate:* ~12 mins\n\n"
            "📲 *Scan & Go QR Pass:* Show this token or scan your QR at the APMC entrance gate camera for fast-track entry.\n"
            "🔗 E-Pass Link: https://agropulse.gov.in/token/AP-2026-0247"
        ),
        status="DELIVERED",
        reference_id="AP-2026-0247",
        created_at=datetime.utcnow() - timedelta(minutes=15)
    )

    n3 = NotificationLog(
        channel="WHATSAPP",
        recipient_phone="7020975052",
        recipient_name="Ramesh Patil",
        event_type="PAYMENT_SETTLED",
        title="💰 Instant DBT Payment Disbursed: ₹57,500.00",
        message_content=(
            "✅ *Government APMC Mandi Settlement & DBT Receipt*\n\n"
            "Namaste *Ramesh Patil* ji,\n"
            "Your crop inspection & weighing is COMPLETE and Direct Bank DBT has been disbursed!\n\n"
            "🌾 *Produce:* Onion (Grade A)\n"
            "⚖️ *Certified Net Weight:* 2,500.0 kg\n"
            "💰 *Net Payable Disbursed:* *₹57,500.00*\n"
            "🏦 *Transferred To:* SBIN-XXXX-4819\n"
            "🆔 *Banking UTR / Ref:* `UTR20260830771239`\n"
            "📜 *Digital Certificate:* Verified by Mandi Quality Officer S. M. Joshi\n\n"
            "Thank you for transacting on AgroPulse APMC Portal."
        ),
        status="DELIVERED",
        reference_id="UTR20260830771239",
        created_at=datetime.utcnow() - timedelta(minutes=40)
    )

    # ==========================================
    # SEEDING REALISTIC TRADE & REPUTATION REVIEWS
    # ==========================================
    print("[*] Seeding Verified Trade Reviews & Trust Scores...")
    from app.models import TradeReview

    rev1 = TradeReview(
        reviewer_id=buyer1.id,
        reviewee_id=farmer1.id,
        reviewer_role="BUYER",
        produce_id=produce1.id,
        rating=5.0,
        quality_score=5.0,
        timeliness_score=4.9,
        review_title="Exceptional Garva Onion Quality & Clean Packaging",
        review_text="Ramesh ji delivered genuine export-grade Nashik Red Onions. Sorting and moisture level were exactly as specified in the assay report. Very reliable farmer!",
        trust_tags="Grade A Quality,Accurate Assay,Proper Gunny Bags,Honest Weight",
        is_verified_trade=True,
        created_at=datetime.utcnow() - timedelta(days=2)
    )
    rev2 = TradeReview(
        reviewer_id=buyer2.id,
        reviewee_id=farmer1.id,
        reviewer_role="BUYER",
        produce_id=produce2.id,
        rating=4.8,
        quality_score=4.9,
        timeliness_score=4.7,
        review_title="Prompt Delivery & Consistent Hybrid Tomatoes",
        review_text="Consistent crate packing with zero transit damage. Smooth APMC weighbridge handoff.",
        trust_tags="Zero Damage,Grade A Quality,Punctual Dispatch",
        is_verified_trade=True,
        created_at=datetime.utcnow() - timedelta(days=5)
    )

    # Reviews given by Farmers to Buyer Rajesh Aggarwal
    rev3 = TradeReview(
        reviewer_id=farmer1.id,
        reviewee_id=buyer1.id,
        reviewer_role="FARMER",
        produce_id=produce1.id,
        rating=5.0,
        quality_score=5.0,
        timeliness_score=5.0,
        review_title="Instant Bank Settlement & Transparent Weighbridge Process",
        review_text="Kisan Agro Foods disbursed full agreed payment within 20 minutes of weighbridge approval. No unexpected deduction or rate cuts. Highly trusted institutional buyer!",
        trust_tags="Instant Payment,Fair Negotiation,Zero Hidden Deductions,APMC Verified",
        is_verified_trade=True,
        created_at=datetime.utcnow() - timedelta(days=1)
    )
    rev4 = TradeReview(
        reviewer_id=farmer2.id,
        reviewee_id=buyer1.id,
        reviewer_role="FARMER",
        produce_id=produce3.id,
        rating=4.9,
        quality_score=4.8,
        timeliness_score=5.0,
        review_title="Reliable Procurement & Professional Team",
        review_text="Offered above MSP rates for Sharbati wheat. Quick digital weighment assay acknowledgment.",
        trust_tags="Fair Price,Fast Payment,Professional Staff",
        is_verified_trade=True,
        created_at=datetime.utcnow() - timedelta(days=4)
    )

    db.add_all([rev1, rev2, rev3, rev4])
    db.commit()

    db.close()
    print("[SUCCESS] Realistic Indian AgroPulse Dataset & 7020975052 Seeded Successfully!")

if __name__ == "__main__":
    seed_all_data()

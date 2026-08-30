import uuid
import json
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import ProcurementCenter, Slot, DigitalToken, Produce, User, QueueEntry, TokenStatus, ProduceStatus
from ..schemas import CenterOut, SlotOut, TokenBookRequest, DigitalTokenOut
from ..ml.buyer_matcher import haversine_distance
from ..ml.queue_engine import queue_predictor
from ..services.notification_service import notification_service

router = APIRouter(prefix="/procurement", tags=["Procurement & Tokens"])

@router.get("/centers", response_model=List[CenterOut])
def list_procurement_centers(
    lat: Optional[float] = 19.9975,
    lon: Optional[float] = 73.7898,
    db: Session = Depends(get_db)
):
    centers = db.query(ProcurementCenter).all()
    results = []
    for c in centers:
        dto = CenterOut.model_validate(c)
        dto.distance_km = haversine_distance(lat, lon, c.lat, c.lon)
        # Count active queue
        dto.active_queue_count = db.query(DigitalToken).filter(
            DigitalToken.center_id == c.id,
            DigitalToken.status.in_([TokenStatus.CHECKED_IN.value, TokenStatus.IN_INSPECTION.value, TokenStatus.WEIGHING.value])
        ).count()
        results.append(dto)
    results.sort(key=lambda x: x.distance_km or 999.0)
    return results

@router.get("/center/{center_id}/slots", response_model=List[SlotOut])
def get_center_slots(center_id: int, db: Session = Depends(get_db)):
    slots = db.query(Slot).filter(Slot.center_id == center_id).all()
    out = []
    for s in slots:
        dto = SlotOut(
            id=s.id,
            center_id=s.center_id,
            date_str=s.date_str,
            time_slot=s.time_slot,
            max_tokens=s.max_tokens,
            booked_tokens=s.booked_tokens,
            available_tokens=max(0, s.max_tokens - s.booked_tokens)
        )
        out.append(dto)
    return out

@router.post("/book-token", response_model=DigitalTokenOut)
def book_procurement_slot(req: TokenBookRequest, db: Session = Depends(get_db)):
    center = db.query(ProcurementCenter).filter(ProcurementCenter.id == req.center_id).first()
    if not center:
        raise HTTPException(status_code=404, detail="Procurement center not found")

    slot = db.query(Slot).filter(Slot.id == req.slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")

    if slot.booked_tokens >= slot.max_tokens:
        raise HTTPException(status_code=400, detail="Selected slot is fully booked")

    produce = db.query(Produce).filter(Produce.id == req.produce_id).first()
    if not produce:
        raise HTTPException(status_code=404, detail="Produce not found")

    farmer = db.query(User).filter(User.id == req.farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    # Generate unique Token Number e.g., AP-2026-1082
    token_num = f"AP-{datetime.now().year}-{str(uuid.uuid4().int)[:4]}"

    # Increment slot count
    slot.booked_tokens += 1
    produce.status = ProduceStatus.SLOT_BOOKED.value

    # Current queue position
    queue_pos = db.query(DigitalToken).filter(
        DigitalToken.center_id == req.center_id,
        DigitalToken.status.in_([TokenStatus.BOOKED.value, TokenStatus.CHECKED_IN.value])
    ).count() + 1

    # AI Wait estimate
    pred = queue_predictor.predict_wait_time(
        farmers_ahead=max(0, queue_pos - 1),
        quantity_kg=produce.quantity_kg,
        active_counters=center.active_counters,
        crop_name=produce.crop_name
    )

    qr_data = json.dumps({
        "token_number": token_num,
        "farmer_id": farmer.id,
        "farmer_name": farmer.name,
        "farmer_phone": farmer.phone,
        "crop": produce.crop_name,
        "qty_kg": produce.quantity_kg,
        "center_code": center.code,
        "slot_time": slot.time_slot,
        "issued_at": datetime.now().isoformat()
    })

    token = DigitalToken(
        token_number=token_num,
        farmer_id=farmer.id,
        produce_id=produce.id,
        center_id=center.id,
        slot_id=slot.id,
        status=TokenStatus.BOOKED.value,
        assigned_counter=1,
        qr_payload=qr_data,
        estimated_wait_minutes=pred.estimated_wait_minutes,
        queue_position=queue_pos
    )
    db.add(token)
    db.commit()
    db.refresh(token)

    # Attach queue entry
    q_entry = QueueEntry(
        token_id=token.id,
        center_id=center.id,
        counter_number=1,
        stage="WAITING",
        priority=1
    )
    db.add(q_entry)
    db.commit()

    # Trigger Automated WhatsApp Delivery of QR Token E-Pass
    try:
        notification_service.send_token_qr_delivery(
            db=db,
            farmer_phone=farmer.phone,
            farmer_name=farmer.name,
            token_number=token_num,
            crop_name=produce.crop_name,
            center_name=center.name,
            slot_date=slot.date_str,
            slot_time=slot.time_slot,
            assigned_counter=1,
            estimated_wait_mins=pred.estimated_wait_minutes
        )
    except Exception as e:
        print("[Notification Error] QR Delivery:", e)

    dto = DigitalTokenOut.model_validate(token)
    dto.farmer_name = farmer.name
    dto.farmer_phone = farmer.phone
    dto.crop_name = produce.crop_name
    dto.quantity_kg = produce.quantity_kg
    dto.center_name = center.name
    dto.center_location = center.location
    dto.slot_time = slot.time_slot
    dto.slot_date = slot.date_str
    return dto

@router.get("/tokens/farmer/{farmer_id}", response_model=List[DigitalTokenOut])
def get_farmer_tokens(farmer_id: int, db: Session = Depends(get_db)):
    tokens = db.query(DigitalToken).filter(DigitalToken.farmer_id == farmer_id).order_by(DigitalToken.created_at.desc()).all()
    results = []
    for t in tokens:
        dto = DigitalTokenOut.model_validate(t)
        if t.farmer:
            dto.farmer_name = t.farmer.name
            dto.farmer_phone = t.farmer.phone
        if t.produce:
            dto.crop_name = t.produce.crop_name
            dto.quantity_kg = t.produce.quantity_kg
        if t.center:
            dto.center_name = t.center.name
            dto.center_location = t.center.location
        if t.slot:
            dto.slot_time = t.slot.time_slot
            dto.slot_date = t.slot.date_str
        results.append(dto)
    return results

@router.get("/token/{token_number}", response_model=DigitalTokenOut)
def get_token_by_number(token_number: str, db: Session = Depends(get_db)):
    t = db.query(DigitalToken).filter(DigitalToken.token_number == token_number).first()
    if not t:
        raise HTTPException(status_code=404, detail="Token not found")
    
    dto = DigitalTokenOut.model_validate(t)
    if t.farmer:
        dto.farmer_name = t.farmer.name
        dto.farmer_phone = t.farmer.phone
    if t.produce:
        dto.crop_name = t.produce.crop_name
        dto.quantity_kg = t.produce.quantity_kg
    if t.center:
        dto.center_name = t.center.name
        dto.center_location = t.center.location
    if t.slot:
        dto.slot_time = t.slot.time_slot
        dto.slot_date = t.slot.date_str
    return dto

@router.get("/token-by-id/{token_id}", response_model=DigitalTokenOut)
def get_token_by_id(token_id: int, db: Session = Depends(get_db)):
    t = db.query(DigitalToken).filter(DigitalToken.id == token_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Token not found")
    
    dto = DigitalTokenOut.model_validate(t)
    if t.farmer:
        dto.farmer_name = t.farmer.name
        dto.farmer_phone = t.farmer.phone
    if t.produce:
        dto.crop_name = t.produce.crop_name
        dto.quantity_kg = t.produce.quantity_kg
    if t.center:
        dto.center_name = t.center.name
        dto.center_location = t.center.location
    if t.slot:
        dto.slot_time = t.slot.time_slot
        dto.slot_date = t.slot.date_str
    return dto

@router.put("/token/{token_id}/cancel", response_model=DigitalTokenOut)
def cancel_procurement_token(token_id: int, db: Session = Depends(get_db)):
    t = db.query(DigitalToken).filter(DigitalToken.id == token_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Token not found")
    
    t.status = TokenStatus.CANCELLED.value

    # Free up slot token capacity
    if t.slot and t.slot.booked_tokens > 0:
        t.slot.booked_tokens -= 1

    # Release produce back to listed
    if t.produce:
        t.produce.status = ProduceStatus.LISTED.value
        
        # Mark linked accepted buyer offers as CANCELLED/REJECTED with clear notice
        from ..models import BuyerOffer, OfferStatus
        linked_offers = db.query(BuyerOffer).filter(
            BuyerOffer.produce_id == t.produce_id,
            BuyerOffer.status == OfferStatus.ACCEPTED.value
        ).all()
        for o in linked_offers:
            o.status = OfferStatus.REJECTED.value
            o.message = f"Mandi QR Token {t.token_number} cancelled by farmer. Deal revoked and lot relisted."

    db.commit()
    db.refresh(t)

    # Trigger Automated WhatsApp Cancellation Alert
    farmer = t.farmer
    farmer_phone = farmer.phone if farmer else "7020975052"
    farmer_name = farmer.name if farmer else "Ramesh Patil"
    crop_name = t.produce.crop_name if t.produce else "Agricultural Produce"
    center_name = t.center.name if t.center else "APMC Mandi"
    slot_time = t.slot.time_slot if t.slot else "Today"

    try:
        notification_service.send_token_cancelled_alert(
            db=db,
            farmer_phone=farmer_phone,
            farmer_name=farmer_name,
            token_number=t.token_number,
            crop_name=crop_name,
            center_name=center_name,
            slot_time=slot_time
        )
    except Exception as e:
        print("[Notification Error] Token Cancellation Alert:", e)

    dto = DigitalTokenOut.model_validate(t)
    if t.farmer:
        dto.farmer_name = t.farmer.name
        dto.farmer_phone = t.farmer.phone
    if t.produce:
        dto.crop_name = t.produce.crop_name
        dto.quantity_kg = t.produce.quantity_kg
    if t.center:
        dto.center_name = t.center.name
        dto.center_location = t.center.location
    if t.slot:
        dto.slot_time = t.slot.time_slot
        dto.slot_date = t.slot.date_str
    return dto


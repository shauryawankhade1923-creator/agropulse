import uuid
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import DigitalToken, QueueEntry, ProcurementRecord, PaymentRecord, User, TokenStatus, ProduceStatus, PaymentStatus
from ..schemas import TokenAdvanceStageRequest, DigitalTokenOut
from ..services.notification_service import notification_service

router = APIRouter(prefix="/queue", tags=["Live Queue Management"])

@router.get("/center/{center_id}/live-board")
def get_live_queue_board(center_id: int, db: Session = Depends(get_db)):
    active_tokens = db.query(DigitalToken).filter(
        DigitalToken.center_id == center_id,
        DigitalToken.status.in_([
            TokenStatus.BOOKED.value,
            TokenStatus.CHECKED_IN.value,
            TokenStatus.IN_INSPECTION.value,
            TokenStatus.WEIGHING.value
        ])
    ).order_by(DigitalToken.created_at.asc()).all()

    counters = {
        1: {"counter_number": 1, "active_token": None, "current_farmer": None, "current_crop": None, "stage": "IDLE"},
        2: {"counter_number": 2, "active_token": None, "current_farmer": None, "current_crop": None, "stage": "IDLE"},
        3: {"counter_number": 3, "active_token": None, "current_farmer": None, "current_crop": None, "stage": "IDLE"},
        4: {"counter_number": 4, "active_token": None, "current_farmer": None, "current_crop": None, "stage": "IDLE"},
    }

    waiting_list = []

    for t in active_tokens:
        dto = DigitalTokenOut.model_validate(t)
        if t.farmer:
            dto.farmer_name = t.farmer.name
            dto.farmer_phone = t.farmer.phone
        if t.produce:
            dto.crop_name = t.produce.crop_name
            dto.quantity_kg = t.produce.quantity_kg
        if t.slot:
            dto.slot_time = t.slot.time_slot
            dto.slot_date = t.slot.date_str

        c_num = t.assigned_counter or 1
        if t.status in [TokenStatus.IN_INSPECTION.value, TokenStatus.WEIGHING.value]:
            if c_num in counters and not counters[c_num]["active_token"]:
                counters[c_num]["active_token"] = t.token_number
                counters[c_num]["current_farmer"] = t.farmer.name if t.farmer else "Farmer"
                counters[c_num]["current_crop"] = f"{t.produce.crop_name} ({t.produce.quantity_kg} kg)" if t.produce else "Crop"
                counters[c_num]["stage"] = t.status
        else:
            waiting_list.append(dto)

    return {
        "center_id": center_id,
        "active_counters": list(counters.values()),
        "waiting_queue": waiting_list,
        "total_in_queue": len(active_tokens),
        "avg_wait_minutes": 18.5,
        "throughput_today": 42
    }

@router.post("/advance-stage", response_model=DigitalTokenOut)
def advance_token_stage(req: TokenAdvanceStageRequest, db: Session = Depends(get_db)):
    token = db.query(DigitalToken).filter(DigitalToken.id == req.token_id).first()
    if not token:
        raise HTTPException(status_code=404, detail="Token not found")

    old_status = token.status
    token.status = req.new_stage
    if req.counter_number:
        token.assigned_counter = req.counter_number

    if req.new_stage == TokenStatus.CHECKED_IN.value:
        token.checkin_time = datetime.utcnow()
        # Trigger Gate Check-in SMS Alert
        try:
            farmer = token.farmer
            if farmer:
                notification_service.send_queue_gate_alert(
                    db=db,
                    farmer_phone=farmer.phone,
                    farmer_name=farmer.name,
                    token_number=token.token_number,
                    counter_num=token.assigned_counter or 1,
                    queue_pos=token.queue_position or 1,
                    estimated_wait_mins=token.estimated_wait_minutes or 15.0
                )
        except Exception as e:
            print("[Notification Error] Gate Checkin Alert:", e)

    # If stage is COMPLETED or APPROVED with final measurements, create Procurement & Payment records
    if req.new_stage in [TokenStatus.APPROVED.value, TokenStatus.COMPLETED.value]:
        token.completed_time = datetime.utcnow()
        if token.produce:
            token.produce.status = ProduceStatus.PROCURED.value

        measured_weight = req.measured_weight_kg or (token.produce.quantity_kg if token.produce else 1000.0)
        rate = req.final_rate_per_kg or (token.produce.expected_price_per_kg if token.produce else 22.0)
        gross = round(measured_weight * rate, 2)
        cess = round(gross * 0.01, 2)  # 1% Mandi market development cess
        net = gross - cess

        # Check if record already exists
        rec = db.query(ProcurementRecord).filter(ProcurementRecord.token_id == token.id).first()
        if not rec:
            rec = ProcurementRecord(
                token_id=token.id,
                produce_id=token.produce_id,
                farmer_id=token.farmer_id,
                center_id=token.center_id,
                measured_weight_kg=measured_weight,
                final_grade=req.final_grade or "A",
                final_rate_per_kg=rate,
                gross_amount=gross,
                mandi_cess_deduction=cess,
                net_payable=net,
                quality_notes=req.notes or "Inspected and approved by APMC Quality Wing"
            )
            db.add(rec)
            db.commit()
            db.refresh(rec)

            # Auto-disburse Direct Payment simulation
            ref = f"AGP-TXN-{str(uuid.uuid4().hex)[:10].upper()}"
            utr = f"UTR{datetime.now().strftime('%Y%m%d')}{str(uuid.uuid4().int)[:8]}"
            pay = PaymentRecord(
                procurement_id=rec.id,
                farmer_id=token.farmer_id,
                amount=net,
                payment_mode="DIRECT_BANK_DBT",
                status=PaymentStatus.SETTLED.value,
                transaction_ref=ref,
                utr_number=utr,
                bank_account_masked="SBIN-XXXX-4819"
            )
            db.add(pay)
            db.commit()

            # Trigger Automated WhatsApp DBT Settlement Receipt Delivery
            try:
                farmer = token.farmer
                crop_name = token.produce.crop_name if token.produce else "Crop"
                if farmer:
                    notification_service.send_dbt_payout_voucher(
                        db=db,
                        farmer_phone=farmer.phone,
                        farmer_name=farmer.name,
                        token_number=token.token_number,
                        crop_name=crop_name,
                        weight_kg=measured_weight,
                        grade=rec.final_grade,
                        net_payable=net,
                        utr_number=utr,
                        bank_masked="SBIN-XXXX-4819"
                    )
            except Exception as e:
                print("[Notification Error] DBT Payout WhatsApp Delivery:", e)

    db.commit()
    db.refresh(token)

    dto = DigitalTokenOut.model_validate(token)
    if token.farmer:
        dto.farmer_name = token.farmer.name
        dto.farmer_phone = token.farmer.phone
    if token.produce:
        dto.crop_name = token.produce.crop_name
        dto.quantity_kg = token.produce.quantity_kg
    if token.center:
        dto.center_name = token.center.name
        dto.center_location = token.center.location
    if token.slot:
        dto.slot_time = token.slot.time_slot
        dto.slot_date = token.slot.date_str
    return dto

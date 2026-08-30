import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import (
    LogisticsPool, VehicleProvider, PoolMember, Produce, User, ProcurementCenter
)
from ..schemas import (
    LogisticsPoolOut, PoolMemberOut, VehicleProviderOut, JoinPoolRequest, CreatePoolRequest,
    FreightCostEstimateRequest
)
from ..ml.freight_optimizer import freight_optimizer
from ..services.notification_service import notification_service

router = APIRouter(prefix="/logistics", tags=["Smart Freight & Kisan Logistics Pooling"])

@router.get("/vehicles", response_model=List[VehicleProviderOut])
def get_registered_vehicles(db: Session = Depends(get_db)):
    return db.query(VehicleProvider).all()

@router.get("/pools", response_model=List[LogisticsPoolOut])
def list_available_pools(
    destination_center_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(LogisticsPool)
    if destination_center_id:
        query = query.filter(LogisticsPool.destination_center_id == destination_center_id)
    
    pools = query.order_by(LogisticsPool.created_at.desc()).all()
    results = []
    
    for p in pools:
        dto = LogisticsPoolOut.model_validate(p)
        dto.available_capacity_kg = max(0.0, p.total_capacity_kg - p.booked_capacity_kg)
        dto.capacity_percentage = round((p.booked_capacity_kg / max(1.0, p.total_capacity_kg)) * 100.0, 1)
        dto.member_count = len(p.members) if p.members else 0
        
        if p.vehicle:
            dto.driver_name = p.vehicle.driver_name
            dto.driver_phone = p.vehicle.phone
            dto.vehicle_type = p.vehicle.vehicle_type
            dto.vehicle_number = p.vehicle.vehicle_number
        
        if p.destination_center:
            dto.destination_mandi = p.destination_center.name

        members_dto = []
        for m in p.members:
            mdto = PoolMemberOut.model_validate(m)
            if m.farmer:
                mdto.farmer_name = m.farmer.name
            if m.produce:
                mdto.crop_name = m.produce.crop_name
            members_dto.append(mdto)
        
        dto.members = members_dto
        results.append(dto)
        
    return results

@router.post("/join-pool", response_model=PoolMemberOut)
def join_freight_pool(req: JoinPoolRequest, db: Session = Depends(get_db)):
    pool = db.query(LogisticsPool).filter(LogisticsPool.id == req.pool_id).first()
    if not pool:
        raise HTTPException(status_code=404, detail="Logistics pool not found")

    produce = db.query(Produce).filter(Produce.id == req.produce_id).first()
    if not produce:
        raise HTTPException(status_code=404, detail="Produce lot not found")

    farmer = db.query(User).filter(User.id == req.farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    avail = pool.total_capacity_kg - pool.booked_capacity_kg
    if produce.quantity_kg > avail:
        raise HTTPException(
            status_code=400, 
            detail=f"Cargo exceeds pool capacity. Available: {avail} kg, Your lot: {produce.quantity_kg} kg"
        )

    # Calculate optimal shared fare vs solo fare
    split_calc = freight_optimizer.calculate_farmer_freight_split(
        farmer_weight_kg=produce.quantity_kg,
        total_pool_weight_kg=pool.booked_capacity_kg + produce.quantity_kg,
        farmer_distance_km=22.5,
        avg_route_distance_km=35.0,
        vehicle_base_trip_cost=pool.vehicle.base_fare if pool.vehicle else 1200.0,
        vehicle_rate_per_km=pool.vehicle.rate_per_km if pool.vehicle else 32.0
    )

    consignment = f"FRG-{datetime.now().year}-{str(uuid.uuid4().int)[:4]}"

    member = PoolMember(
        pool_id=pool.id,
        farmer_id=farmer.id,
        produce_id=produce.id,
        pickup_location=req.pickup_location or produce.location,
        pickup_time=req.pickup_time or "06:30 AM",
        loaded_weight_kg=produce.quantity_kg,
        calculated_fare=split_calc["pooled_fare"],
        solo_alternative_fare=split_calc["solo_cost"],
        savings_amount=split_calc["savings_amount"],
        booking_status="CONFIRMED",
        consignment_code=consignment
    )
    db.add(member)

    # Update booked capacity
    pool.booked_capacity_kg += produce.quantity_kg
    if pool.booked_capacity_kg >= pool.total_capacity_kg:
        pool.status = "FULL"

    db.commit()
    db.refresh(member)

    # Trigger Automated WhatsApp Freight Dispatch Slip Delivery
    try:
        driver_name = pool.vehicle.driver_name if pool.vehicle else "Ganesh Shinde"
        driver_phone = pool.vehicle.phone if pool.vehicle else "9823114455"
        v_type = pool.vehicle.vehicle_type if pool.vehicle else "Eicher 10-Ton"
        v_num = pool.vehicle.vehicle_number if pool.vehicle else "MH-15-EG-4821"

        notification_service.send_freight_booking_slip(
            db=db,
            farmer_phone=farmer.phone,
            farmer_name=farmer.name,
            consignment_code=consignment,
            driver_name=driver_name,
            driver_phone=driver_phone,
            vehicle_type=v_type,
            vehicle_number=v_num,
            pickup_location=member.pickup_location,
            pickup_time=member.pickup_time,
            pooled_fare=member.calculated_fare,
            saved_amount=member.savings_amount
        )
    except Exception as e:
        print("[Notification Error] Freight Slip Delivery:", e)

    dto = PoolMemberOut.model_validate(member)
    dto.farmer_name = farmer.name
    dto.crop_name = produce.crop_name
    return dto

@router.get("/farmer/{farmer_id}/bookings", response_model=List[PoolMemberOut])
def get_farmer_freight_bookings(farmer_id: int, db: Session = Depends(get_db)):
    bookings = db.query(PoolMember).filter(PoolMember.farmer_id == farmer_id).order_by(PoolMember.created_at.desc()).all()
    results = []
    for b in bookings:
        dto = PoolMemberOut.model_validate(b)
        if b.farmer:
            dto.farmer_name = b.farmer.name
        if b.produce:
            dto.crop_name = b.produce.crop_name
        results.append(dto)
    return results

@router.post("/estimate-fare")
def estimate_freight_fare(req: FreightCostEstimateRequest, db: Session = Depends(get_db)):
    split_calc = freight_optimizer.calculate_farmer_freight_split(
        farmer_weight_kg=req.farmer_weight_kg,
        total_pool_weight_kg=req.farmer_weight_kg + 3500.0,
        farmer_distance_km=req.pickup_distance_km,
        avg_route_distance_km=max(25.0, req.pickup_distance_km + 10.0),
        vehicle_base_trip_cost=1200.0,
        vehicle_rate_per_km=32.0
    )
    return split_calc

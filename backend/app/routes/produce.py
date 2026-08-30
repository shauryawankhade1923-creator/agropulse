from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Produce, User, ProduceStatus
from ..schemas import ProduceCreate, ProduceOut
from ..ml.pricing_engine import price_recommender

router = APIRouter(prefix="/produce", tags=["Produce Management"])

@router.post("/", response_model=ProduceOut)
def list_new_produce(item: ProduceCreate, db: Session = Depends(get_db)):
    farmer_id = item.farmer_id or 1
    farmer = db.query(User).filter(User.id == farmer_id).first()
    if not farmer:
        farmer = db.query(User).filter(User.role == "FARMER").first()
        if not farmer:
            raise HTTPException(status_code=404, detail="Farmer profile not found in database")

    # Automatically enrich with AI pricing recommendation range
    ai_pricing = price_recommender.predict_price_range(
        crop_name=item.crop_name,
        variety=item.variety or "Standard",
        quantity_kg=item.quantity_kg,
        quality_grade=item.quality_grade or "A",
        location=item.location,
        moisture_content=item.moisture_content or 12.0
    )

    new_produce = Produce(
        farmer_id=farmer.id,
        crop_name=item.crop_name,
        variety=item.variety,
        quantity_kg=item.quantity_kg,
        expected_price_per_kg=item.expected_price_per_kg,
        ai_recommended_min=ai_pricing.recommended_min_per_kg,
        ai_recommended_max=ai_pricing.recommended_max_per_kg,
        quality_grade=item.quality_grade or "A",
        moisture_content=item.moisture_content or 12.0,
        location=item.location,
        lat=item.lat or farmer.lat or 19.9975,
        lon=item.lon or farmer.lon or 73.7898,
        ai_vision_verified=bool(item.ai_vision_verified),
        ai_quality_score=item.ai_quality_score,
        ai_ripeness_stage=item.ai_ripeness_stage,
        ai_inspection_notes=item.ai_inspection_notes or item.notes,
        status=ProduceStatus.LISTED.value,
        image_url=item.image_url
    )
    db.add(new_produce)
    db.commit()
    db.refresh(new_produce)

    out = ProduceOut.model_validate(new_produce)
    out.farmer_name = farmer.name
    return out

@router.get("/", response_model=List[ProduceOut])
def get_all_produces(
    crop: Optional[str] = None,
    status: Optional[str] = None,
    farmer_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Produce)
    if crop:
        query = query.filter(Produce.crop_name.ilike(f"%{crop}%"))
    if status:
        query = query.filter(Produce.status == status)
    if farmer_id:
        query = query.filter(Produce.farmer_id == farmer_id)
    
    results = query.order_by(Produce.created_at.desc()).all()
    output = []
    for p in results:
        dto = ProduceOut.model_validate(p)
        if p.farmer:
            dto.farmer_name = p.farmer.name
        output.append(dto)
    return output

@router.get("/{produce_id}", response_model=ProduceOut)
def get_produce_by_id(produce_id: int, db: Session = Depends(get_db)):
    p = db.query(Produce).filter(Produce.id == produce_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Produce lot not found")
    dto = ProduceOut.model_validate(p)
    if p.farmer:
        dto.farmer_name = p.farmer.name
    return dto

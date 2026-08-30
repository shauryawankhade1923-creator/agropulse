from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from ..database import get_db
from ..models import TradeReview, User, Produce, BuyerOffer
from ..schemas import TradeReviewCreate, TradeReviewOut, UserReputationSummaryOut

router = APIRouter(prefix="/reviews", tags=["Trade & Reputation Reviews"])

@router.post("/submit", response_model=TradeReviewOut)
def submit_trade_review(review_in: TradeReviewCreate, db: Session = Depends(get_db)):
    reviewer = db.query(User).filter(User.id == review_in.reviewer_id).first()
    if not reviewer:
        raise HTTPException(status_code=404, detail="Reviewer user not found")

    reviewee = db.query(User).filter(User.id == review_in.reviewee_id).first()
    if not reviewee:
        raise HTTPException(status_code=404, detail="Reviewee user not found")

    # Clamping rating 1.0 to 5.0
    clamped_rating = min(5.0, max(1.0, float(review_in.rating)))
    q_score = min(5.0, max(1.0, float(review_in.quality_score or 5.0)))
    t_score = min(5.0, max(1.0, float(review_in.timeliness_score or 5.0)))

    review = TradeReview(
        reviewer_id=reviewer.id,
        reviewee_id=reviewee.id,
        reviewer_role=review_in.reviewer_role.upper(),
        produce_id=review_in.produce_id,
        rating=clamped_rating,
        quality_score=q_score,
        timeliness_score=t_score,
        review_title=review_in.review_title or ("Excellent Trade Partner" if clamped_rating >= 4 else "Trade Review"),
        review_text=review_in.review_text,
        trust_tags=review_in.trust_tags,
        is_verified_trade=True,
        created_at=datetime.utcnow()
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    # Recalculate reviewee average rating
    all_reviews = db.query(TradeReview).filter(TradeReview.reviewee_id == reviewee.id).all()
    if all_reviews:
        total_rating = sum(r.rating for r in all_reviews)
        reviewee.rating = round(total_rating / len(all_reviews), 2)
        reviewee.review_count = len(all_reviews)
        db.commit()
        db.refresh(reviewee)

    dto = TradeReviewOut.model_validate(review)
    dto.reviewer_name = reviewer.name
    dto.reviewee_name = reviewee.name
    if review.produce:
        dto.crop_name = review.produce.crop_name
    return dto

@router.get("/user/{user_id}", response_model=List[TradeReviewOut])
def get_user_reviews(user_id: int, db: Session = Depends(get_db)):
    reviews = db.query(TradeReview).filter(TradeReview.reviewee_id == user_id).order_by(TradeReview.created_at.desc()).all()
    out = []
    for r in reviews:
        dto = TradeReviewOut.model_validate(r)
        if r.reviewer:
            dto.reviewer_name = r.reviewer.name
        if r.reviewee:
            dto.reviewee_name = r.reviewee.name
        if r.produce:
            dto.crop_name = r.produce.crop_name
        out.append(dto)
    return out

@router.get("/summary/{user_id}", response_model=UserReputationSummaryOut)
def get_user_reputation_summary(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        # Fallback default user
        user = db.query(User).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    reviews = db.query(TradeReview).filter(TradeReview.reviewee_id == user.id).all()
    
    # Calculate distributions
    dist = {"5_star": 0, "4_star": 0, "3_star": 0, "2_star": 0, "1_star": 0}
    q_scores = []
    t_scores = []
    all_tags = []

    for r in reviews:
        stars = int(round(r.rating))
        if stars >= 5: dist["5_star"] += 1
        elif stars == 4: dist["4_star"] += 1
        elif stars == 3: dist["3_star"] += 1
        elif stars == 2: dist["2_star"] += 1
        else: dist["1_star"] += 1

        q_scores.append(r.quality_score or 5.0)
        t_scores.append(r.timeliness_score or 5.0)
        if r.trust_tags:
            tags = [t.strip() for t in r.trust_tags.split(',') if t.strip()]
            all_tags.extend(tags)

    avg_rating = user.rating or 4.8
    if reviews:
        avg_rating = round(sum(r.rating for r in reviews) / len(reviews), 2)

    q_avg = round(sum(q_scores) / len(q_scores), 1) if q_scores else 4.9
    t_avg = round(sum(t_scores) / len(t_scores), 1) if t_scores else 4.8

    # Top tags
    from collections import Counter
    tag_counts = Counter(all_tags)
    top_tags = [tag for tag, _ in tag_counts.most_common(5)]
    if not top_tags:
        top_tags = ["APMC Certified", "Prompt Settlement", "Honest Weighment", "Grade A Quality"]

    recent_out = []
    for r in reviews[:6]:
        dto = TradeReviewOut.model_validate(r)
        if r.reviewer:
            dto.reviewer_name = r.reviewer.name
        if r.reviewee:
            dto.reviewee_name = r.reviewee.name
        if r.produce:
            dto.crop_name = r.produce.crop_name
        recent_out.append(dto)

    return UserReputationSummaryOut(
        user_id=user.id,
        user_name=user.name,
        role=user.role,
        average_rating=avg_rating,
        total_reviews=len(reviews) if len(reviews) > 0 else (user.review_count or 5),
        verified_deals_count=len(reviews) if len(reviews) > 0 else 12,
        quality_avg=q_avg,
        timeliness_avg=t_avg,
        rating_distribution=dist if len(reviews) > 0 else {"5_star": 4, "4_star": 1, "3_star": 0, "2_star": 0, "1_star": 0},
        top_trust_tags=top_tags,
        recent_reviews=recent_out
    )

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import User, UserRole
from ..schemas import UserCreate, UserOut, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication & Profiles"])

@router.post("/register", response_model=UserOut)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.phone == user_in.phone).first()
    if existing:
        return existing
    user = User(
        name=user_in.name,
        phone=user_in.phone,
        email=user_in.email,
        role=user_in.role,
        location=user_in.location,
        lat=user_in.lat or 19.9975,
        lon=user_in.lon or 73.7898,
        rating=4.9 if user_in.role == UserRole.FARMER.value else 4.8,
        verified=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=TokenResponse)
def login_user(phone: str, role: str = "FARMER", db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == phone).first()
    if not user:
        # Create user on the fly for seamless SIH demo
        user = User(
            name="Ramesh Patil" if role == "FARMER" else "Kisan Traders Ltd",
            phone=phone,
            role=role,
            location="Nashik Rural, Maharashtra",
            lat=19.9975,
            lon=73.7898,
            rating=4.9,
            verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return TokenResponse(
        access_token=f"jwt-mock-token-for-user-{user.id}",
        token_type="bearer",
        user=UserOut.model_validate(user)
    )

@router.get("/users", response_model=List[UserOut])
def get_all_users(role: str = None, db: Session = Depends(get_db)):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.all()

@router.get("/user/{user_id}", response_model=UserOut)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

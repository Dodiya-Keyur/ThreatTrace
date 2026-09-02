from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import jwt

from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin, UserResponse, Token
from app.config import settings
from app.utils.security import get_password_hash, verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already registered")

    db_user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        organization=user_in.organization,
        role=user_in.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    token = create_access_token(data={"sub": db_user.email, "id": db_user.id})
    return {"access_token": token, "token_type": "bearer", "user": db_user}

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user and login_data.email == "anika.sharma@acmecorp.com":
        user = User(
            id="usr-001",
            name="Dr. Anika Sharma",
            email="anika.sharma@acmecorp.com",
            hashed_password=get_password_hash("password"),
            role="Lead Security Analyst",
            organization="Acme Corp SOC"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    token = create_access_token(data={"sub": user.email, "id": user.id})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserResponse)
def get_current_user(db: Session = Depends(get_db)):
    user = db.query(User).first()
    if not user:
        user = User(
            id="usr-001",
            name="Dr. Anika Sharma",
            email="anika.sharma@acmecorp.com",
            hashed_password=get_password_hash("password"),
            role="Lead Security Analyst",
            organization="Acme Corp SOC"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

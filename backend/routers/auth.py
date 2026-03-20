from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import uuid

from models.database import get_db
from models.user import User
from config import get_settings

settings = get_settings()
router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ─── Schemas ──────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class OAuthRequest(BaseModel):
    provider: str        # "google" | "github"
    provider_id: str
    email: str
    name: str
    avatar_url: str | None = None


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ─── Helpers ──────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: str, role: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode(
        {"sub": user_id, "role": role, "exp": expire},
        settings.secret_key,
        algorithm="HS256",
    )


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


# ─── Routes ───────────────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse, status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        id=uuid.uuid4(),
        name=body.name,
        email=body.email,
        hashed_password=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(str(user.id), user.role)
    return TokenResponse(
        access_token=token,
        user=UserResponse(id=str(user.id), name=user.name, email=user.email, role=user.role),
    )


@router.post("/login", response_model=TokenResponse)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not user.hashed_password or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(str(user.id), user.role)
    return TokenResponse(
        access_token=token,
        user=UserResponse(id=str(user.id), name=user.name, email=user.email, role=user.role),
    )


@router.post("/oauth", response_model=TokenResponse)
def oauth_login(body: OAuthRequest, db: Session = Depends(get_db)):
    print(f"[OAuth] provider={body.provider} email={body.email} name={body.name}")
    """
    Called by NextAuth after Google/GitHub sign-in.
    Creates user if not exists, returns backend JWT.
    """
    # Check if user exists by email
    user = db.query(User).filter(User.email == body.email).first()

    if not user:
        # New user — create account (no password for OAuth users)
        user = User(
            id=uuid.uuid4(),
            name=body.name,
            email=body.email,
            hashed_password="",   # OAuth users have no password
            oauth_provider=body.provider,
            oauth_provider_id=body.provider_id,
            avatar_url=body.avatar_url,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Existing user — update OAuth fields if needed
        if not user.oauth_provider:
            user.oauth_provider = body.provider
            user.oauth_provider_id = body.provider_id
        if body.avatar_url and not user.avatar_url:
            user.avatar_url = body.avatar_url
        db.commit()

    token = create_access_token(str(user.id), user.role)
    return TokenResponse(
        access_token=token,
        user=UserResponse(id=str(user.id), name=user.name, email=user.email, role=user.role),
    )


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user.id),
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
    )


# ─── Profile ──────────────────────────────────────────────────────

class ProfileUpdateRequest(BaseModel):
    name: str | None = None
    headline: str | None = None
    bio: str | None = None
    location: str | None = None
    phone: str | None = None
    years_experience: int | None = None
    target_role: str | None = None
    education_level: str | None = None
    college: str | None = None
    linkedin_url: str | None = None
    github_url: str | None = None
    portfolio_url: str | None = None


class ProfileResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    avatar_url: str | None = None
    headline: str | None = None
    bio: str | None = None
    location: str | None = None
    phone: str | None = None
    years_experience: int | None = None
    target_role: str | None = None
    education_level: str | None = None
    college: str | None = None
    linkedin_url: str | None = None
    github_url: str | None = None
    portfolio_url: str | None = None
    oauth_provider: str | None = None
    created_at: str | None = None

    class Config:
        from_attributes = True


@router.get("/profile", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return ProfileResponse(
        id=str(current_user.id),
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        avatar_url=current_user.avatar_url,
        headline=current_user.headline,
        bio=current_user.bio,
        location=current_user.location,
        phone=current_user.phone,
        years_experience=current_user.years_experience,
        target_role=current_user.target_role,
        education_level=current_user.education_level,
        college=current_user.college,
        linkedin_url=current_user.linkedin_url,
        github_url=current_user.github_url,
        portfolio_url=current_user.portfolio_url,
        oauth_provider=current_user.oauth_provider,
        created_at=str(current_user.created_at) if current_user.created_at else None,
    )


@router.put("/profile", response_model=ProfileResponse)
def update_profile(
    body: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    fields = body.model_dump(exclude_none=True)
    for key, val in fields.items():
        setattr(current_user, key, val)
    db.commit()
    db.refresh(current_user)
    return get_profile(current_user)
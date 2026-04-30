from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.modules.auth.models import User
from app.modules.auth.schemas import (
    ChangePasswordRequest,
    LoginRequest,
    UserCreate,
    UserResponse,
)
from app.modules.auth.service import AuthService

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/register", response_model=dict, status_code=201)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    service = AuthService(db)
    data = service.register(payload)
    return {
        "success": True,
        "message": "User berhasil dibuat.",
        "data": UserResponse.model_validate(data),
    }


@router.post("/login", response_model=dict)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    data = service.login(payload)
    return {"success": True, "message": "Login berhasil.", "data": data}


@router.get("/me", response_model=dict)
def me(current_user: User = Depends(get_current_user)):
    return {
        "success": True,
        "message": "OK",
        "data": UserResponse.model_validate(current_user),
    }


@router.post("/change-password", response_model=dict)
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    service.change_password(current_user.id, payload)
    return {"success": True, "message": "Password berhasil diubah.", "data": {}}

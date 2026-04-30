from fastapi import Depends, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.database.session import get_db
from app.modules.auth.exceptions import InactiveUserException, InvalidTokenException
from app.modules.auth.repository import UserRepository

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme),
    db: Session = Depends(get_db),
):
    try:
        payload = decode_access_token(credentials.credentials)
        user_id: int = int(payload["sub"])
    except (ValueError, KeyError):
        raise InvalidTokenException()

    user = UserRepository(db).get_by_id(user_id)
    if not user:
        raise InvalidTokenException()
    if not user.is_active:
        raise InactiveUserException()
    return user


def require_roles(*roles: str):
    def _checker(current_user=Depends(get_current_user)):
        from fastapi import HTTPException, status

        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Akses ditolak. Role '{current_user.role}' tidak diizinkan.",
            )
        return current_user

    return _checker

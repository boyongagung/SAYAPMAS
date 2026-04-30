from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.modules.auth.exceptions import (
    EmailDuplicateException,
    InactiveUserException,
    InvalidCredentialsException,
    UsernameDuplicateException,
    UserNotFoundException,
    WrongPasswordException,
)
from app.modules.auth.models import User
from app.modules.auth.repository import UserRepository
from app.modules.auth.schemas import (
    ChangePasswordRequest,
    LoginRequest,
    TokenResponse,
    UserCreate,
    UserResponse,
)


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = UserRepository(db)

    def register(self, payload: UserCreate) -> User:
        with self.db.begin():
            if self.repo.get_by_username(payload.username):
                raise UsernameDuplicateException(payload.username)
            if self.repo.get_by_email(payload.email):
                raise EmailDuplicateException(payload.email)

            user = User(
                username=payload.username,
                email=payload.email,
                hashed_password=hash_password(payload.password),
                role=payload.role,
                id_salesman=payload.id_salesman,
            )
            return self.repo.create(user)

    def login(self, payload: LoginRequest) -> TokenResponse:
        with self.db.begin():
            user = self.repo.get_by_username(payload.username)
            if not user or not verify_password(payload.password, user.hashed_password):
                raise InvalidCredentialsException()
            if not user.is_active:
                raise InactiveUserException()

            # Update last_login
            self.repo.update(user, {"last_login": datetime.now(timezone.utc)})

            token = create_access_token(
                subject=user.id,
                extra={"role": user.role, "username": user.username},
            )
            return TokenResponse(
                access_token=token,
                user=UserResponse.model_validate(user),
            )

    def change_password(self, user_id: int, payload: ChangePasswordRequest) -> None:
        with self.db.begin():
            user = self.repo.get_by_id(user_id)
            if not user:
                raise UserNotFoundException()
            if not verify_password(payload.old_password, user.hashed_password):
                raise WrongPasswordException()
            self.repo.update(
                user, {"hashed_password": hash_password(payload.new_password)}
            )

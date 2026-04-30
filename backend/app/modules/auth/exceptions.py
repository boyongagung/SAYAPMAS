from fastapi import HTTPException, status


class UserNotFoundException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND, detail="User tidak ditemukan."
        )


class UsernameDuplicateException(HTTPException):
    def __init__(self, username: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Username '{username}' sudah digunakan.",
        )


class EmailDuplicateException(HTTPException):
    def __init__(self, email: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Email '{email}' sudah digunakan.",
        )


class InvalidCredentialsException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah.",
            headers={"WWW-Authenticate": "Bearer"},
        )


class InvalidTokenException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token tidak valid atau sudah expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )


class InactiveUserException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN, detail="Akun tidak aktif."
        )


class WrongPasswordException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password lama tidak sesuai.",
        )

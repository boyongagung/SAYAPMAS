from fastapi import HTTPException, status


class OrderNotFoundException(HTTPException):
    def __init__(self, order_id: int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order id={order_id} tidak ditemukan.",
        )


class OrderStatusInvalidTransitionException(HTTPException):
    def __init__(self, current: str, target: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Transisi status '{current}' → '{target}' tidak diizinkan.",
        )


class OrderGeofenceViolationException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Salesman berada di luar radius 100m dari lokasi customer.",
        )

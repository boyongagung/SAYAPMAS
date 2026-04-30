from fastapi import HTTPException, status


class DeliveryNotFoundException(HTTPException):
    def __init__(self, delivery_id: int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Delivery id={delivery_id} tidak ditemukan.",
        )


class DeliveryAlreadyExistsException(HTTPException):
    def __init__(self, order_id: int):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Order id={order_id} sudah memiliki delivery.",
        )


class DeliveryStatusInvalidTransitionException(HTTPException):
    def __init__(self, current: str, target: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Transisi status '{current}' → '{target}' tidak diizinkan.",
        )


class DeliveryOrderNotConfirmedException(HTTPException):
    def __init__(self, order_id: int):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Order id={order_id} harus berstatus 'confirmed' sebelum dibuat delivery.",
        )

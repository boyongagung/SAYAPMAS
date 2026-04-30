from decimal import Decimal

from fastapi import HTTPException, status


class FinanceRecordNotFoundException(HTTPException):
    def __init__(self, record_id: int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Finance record id={record_id} tidak ditemukan.",
        )


class FinanceRecordAlreadyExistsException(HTTPException):
    def __init__(self, order_id: int):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Finance record untuk order id={order_id} sudah ada.",
        )


class PaymentExceedsRemainingException(HTTPException):
    def __init__(self, paid: Decimal, remaining: Decimal):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Pembayaran {paid} melebihi sisa tagihan {remaining}.",
        )

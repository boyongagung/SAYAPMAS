from fastapi import HTTPException, status


class CustomerNotFoundException(HTTPException):
    def __init__(self, customer_id: int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer id={customer_id} tidak ditemukan.",
        )


class CustomerCodeDuplicateException(HTTPException):
    def __init__(self, code: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"customer_code '{code}' sudah digunakan.",
        )


class CustomerGPSDuplicateException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail="Koordinat GPS sudah terdaftar pada customer lain.",
        )

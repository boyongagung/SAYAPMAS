from fastapi import HTTPException, status


class ProductNotFoundException(HTTPException):
    def __init__(self, product_id: int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product id={product_id} tidak ditemukan.",
        )


class ProductCodeDuplicateException(HTTPException):
    def __init__(self, code: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"product_code '{code}' sudah digunakan.",
        )


class ProductStockInsufficientException(HTTPException):
    def __init__(self, product_id: int, requested: int, available: int):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Product id={product_id} stok tidak cukup. Request={requested}, Available={available}.",
        )

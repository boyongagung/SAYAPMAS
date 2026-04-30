from fastapi import HTTPException, status


class SalesmanNotFound(HTTPException):
    def __init__(self, salesman_id: int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Salesman id={salesman_id} not found.",
        )


class SalesmanCodeDuplicate(HTTPException):
    def __init__(self, code: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"salesman_code '{code}' already exists.",
        )

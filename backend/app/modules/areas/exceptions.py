from fastapi import HTTPException, status


class AreaNotFoundException(HTTPException):
    def __init__(self, area_id: int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Area id={area_id} tidak ditemukan.",
        )


class AreaAlreadyExistsException(HTTPException):
    def __init__(self, name: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Area '{name}' sudah ada.",
        )

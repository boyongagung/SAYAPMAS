from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class SalesmanCreate(BaseModel):
    salesman_code: str = Field(..., max_length=50)
    nama: str = Field(..., max_length=150)
    phone: Optional[str] = Field(None, max_length=20)
    id_area: int
    is_active: bool = True


class SalesmanUpdate(BaseModel):
    nama: Optional[str] = Field(None, max_length=150)
    phone: Optional[str] = Field(None, max_length=20)
    id_area: Optional[int] = None
    is_active: Optional[bool] = None


class SalesmanResponse(BaseModel):
    id: int
    salesman_code: str
    nama: str
    phone: Optional[str]
    id_area: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class CustomerCreate(BaseModel):
    customer_code: str = Field(..., max_length=50)
    nama: str = Field(..., max_length=150)
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = Field(None, max_length=300)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    id_area: int
    id_salesman: int
    is_active: bool = True


class CustomerUpdate(BaseModel):
    nama: Optional[str] = Field(None, max_length=150)
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = Field(None, max_length=300)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    id_area: Optional[int] = None
    id_salesman: Optional[int] = None
    is_active: Optional[bool] = None


class CustomerResponse(BaseModel):
    id: int
    customer_code: str
    nama: str
    phone: Optional[str]
    address: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    id_area: int
    id_salesman: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

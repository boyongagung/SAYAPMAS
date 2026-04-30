from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ProductCreate(BaseModel):
    product_code: str = Field(..., max_length=50)
    nama: str = Field(..., max_length=150)
    description: Optional[str] = None
    unit: str = Field(..., max_length=20)
    price: Decimal = Field(..., ge=0)
    stock_available: int = Field(0, ge=0)
    is_active: bool = True


class ProductUpdate(BaseModel):
    nama: Optional[str] = Field(None, max_length=150)
    description: Optional[str] = None
    unit: Optional[str] = Field(None, max_length=20)
    price: Optional[Decimal] = Field(None, ge=0)
    is_active: Optional[bool] = None


class ProductResponse(BaseModel):
    id: int
    product_code: str
    nama: str
    description: Optional[str]
    unit: str
    price: Decimal
    stock_available: int
    stock_booked: int
    stock_in_transit: int
    stock_delivered: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

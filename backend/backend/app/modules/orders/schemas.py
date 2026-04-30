from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class OrderItemCreate(BaseModel):
    id_product: int
    qty: int = Field(..., gt=0)


class OrderCreate(BaseModel):
    id_customer: int
    id_salesman: int
    salesman_latitude: Optional[float] = None
    salesman_longitude: Optional[float] = None
    notes: Optional[str] = None
    items: list[OrderItemCreate] = Field(..., min_length=1)


class OrderStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(confirmed|in_transit|delivered|cancelled)$")


class OrderItemResponse(BaseModel):
    id: int
    id_product: int
    qty: int
    price_at_order: Decimal
    subtotal: Decimal

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    order_code: str
    id_customer: int
    id_salesman: int
    status: str
    salesman_latitude: Optional[float]
    salesman_longitude: Optional[float]
    geofence_valid: Optional[int]
    notes: Optional[str]
    total_amount: Decimal
    items: list[OrderItemResponse]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class DeliveryCreate(BaseModel):
    id_order: int
    id_salesman: int
    notes: Optional[str] = None


class DeliveryStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(in_transit|delivered|failed)$")
    delivery_latitude: Optional[float] = None
    delivery_longitude: Optional[float] = None
    notes: Optional[str] = None


class DeliveryResponse(BaseModel):
    id: int
    delivery_code: str
    id_order: int
    id_salesman: int
    status: str
    delivery_latitude: Optional[float]
    delivery_longitude: Optional[float]
    notes: Optional[str]
    delivered_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

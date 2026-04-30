from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class AreaCreate(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None


class AreaUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None


class AreaResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class AuditLogCreate(BaseModel):
    user_id: int
    action: str
    table_name: str
    record_id: int
    old_value: Optional[str] = None
    new_value: Optional[str] = None


class AuditLogResponse(BaseModel):
    id: int
    action: str
    table_name: str
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)

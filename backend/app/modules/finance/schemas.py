from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class FinanceRecordCreate(BaseModel):
    id_order: int
    id_customer: int
    id_salesman: int
    type: str = Field(..., pattern="^(receivable|payment|adjustment)$")
    total_amount: Decimal = Field(..., gt=0)
    notes: Optional[str] = None
    due_date: Optional[datetime] = None


class PaymentCreate(BaseModel):
    amount: Decimal = Field(..., gt=0)
    method: str = Field("cash", pattern="^(cash|transfer|credit)$")
    notes: Optional[str] = None


class PaymentResponse(BaseModel):
    id: int
    payment_code: str
    id_finance_record: int
    amount: Decimal
    method: str
    notes: Optional[str]
    paid_at: datetime
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class FinanceRecordResponse(BaseModel):
    id: int
    record_code: str
    id_order: int
    id_customer: int
    id_salesman: int
    type: str
    status: str
    total_amount: Decimal
    paid_amount: Decimal
    remaining_amount: Decimal
    notes: Optional[str]
    due_date: Optional[datetime]
    payments: list[PaymentResponse]
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

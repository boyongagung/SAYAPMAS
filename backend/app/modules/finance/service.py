from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy.orm import Session

from app.modules.finance.constants import (
    DEFAULT_PAGE_SIZE,
    PAYMENT_CODE_PREFIX,
    PAYMENT_STATUS_PAID,
    PAYMENT_STATUS_PARTIAL,
    PAYMENT_STATUS_UNPAID,
    RECORD_CODE_PREFIX,
)
from app.modules.finance.exceptions import (
    FinanceRecordAlreadyExistsException,
    FinanceRecordNotFoundException,
    PaymentExceedsRemainingException,
)
from app.modules.finance.models import FinanceRecord, Payment
from app.modules.finance.repository import FinanceRepository
from app.modules.finance.schemas import FinanceRecordCreate, PaymentCreate


def _generate_record_code() -> str:
    ts = datetime.now().strftime("%Y%m%d%H%M%S%f")[:18]
    return f"{RECORD_CODE_PREFIX}-{ts}"


def _generate_payment_code() -> str:
    ts = datetime.now().strftime("%Y%m%d%H%M%S%f")[:18]
    return f"{PAYMENT_CODE_PREFIX}-{ts}"


def _resolve_status(paid: Decimal, total: Decimal) -> str:
    if paid <= 0:
        return PAYMENT_STATUS_UNPAID
    if paid >= total:
        return PAYMENT_STATUS_PAID
    return PAYMENT_STATUS_PARTIAL


class FinanceService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = FinanceRepository(db)

    def get_all(
        self,
        skip: int = 0,
        limit: int = DEFAULT_PAGE_SIZE,
        status: Optional[str] = None,
        id_customer: Optional[int] = None,
        id_salesman: Optional[int] = None,
    ) -> list[FinanceRecord]:
        return self.repo.get_all(
            skip=skip,
            limit=limit,
            status=status,
            id_customer=id_customer,
            id_salesman=id_salesman,
        )

    def get_by_id(self, record_id: int) -> FinanceRecord:
        record = self.repo.get_by_id(record_id)
        if not record:
            raise FinanceRecordNotFoundException(record_id)
        return record

    def create_from_order(self, payload: FinanceRecordCreate) -> FinanceRecord:
        with self.db.begin():
            if self.repo.get_by_order_id(payload.id_order):
                raise FinanceRecordAlreadyExistsException(payload.id_order)
            record = FinanceRecord(
                record_code=_generate_record_code(),
                id_order=payload.id_order,
                id_customer=payload.id_customer,
                id_salesman=payload.id_salesman,
                type=payload.type,
                status=PAYMENT_STATUS_UNPAID,
                total_amount=payload.total_amount,
                paid_amount=Decimal("0"),
                remaining_amount=payload.total_amount,
                notes=payload.notes,
                due_date=payload.due_date,
            )
            return self.repo.create(record)

    def add_payment(self, record_id: int, payload: PaymentCreate) -> FinanceRecord:
        with self.db.begin():
            record = self.repo.get_by_id(record_id)
            if not record:
                raise FinanceRecordNotFoundException(record_id)
            if payload.amount > record.remaining_amount:
                raise PaymentExceedsRemainingException(
                    payload.amount, record.remaining_amount
                )
            payment = Payment(
                payment_code=_generate_payment_code(),
                id_finance_record=record.id,
                amount=payload.amount,
                method=payload.method,
                notes=payload.notes,
            )
            self.repo.add_payment(payment)
            new_paid = record.paid_amount + payload.amount
            new_remaining = record.total_amount - new_paid
            return self.repo.update(
                record,
                {
                    "paid_amount": new_paid,
                    "remaining_amount": new_remaining,
                    "status": _resolve_status(new_paid, record.total_amount),
                },
            )

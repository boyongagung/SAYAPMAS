from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.modules.finance.models import FinanceRecord, Payment


class FinanceRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, record_id: int) -> Optional[FinanceRecord]:
        stmt = (
            select(FinanceRecord)
            .options(selectinload(FinanceRecord.payments))
            .where(FinanceRecord.id == record_id)
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def get_by_order_id(self, order_id: int) -> Optional[FinanceRecord]:
        stmt = select(FinanceRecord).where(FinanceRecord.id_order == order_id)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_all(
        self,
        skip: int = 0,
        limit: int = 20,
        status: Optional[str] = None,
        id_customer: Optional[int] = None,
        id_salesman: Optional[int] = None,
    ) -> list[FinanceRecord]:
        stmt = select(FinanceRecord).options(selectinload(FinanceRecord.payments))
        if status:
            stmt = stmt.where(FinanceRecord.status == status)
        if id_customer:
            stmt = stmt.where(FinanceRecord.id_customer == id_customer)
        if id_salesman:
            stmt = stmt.where(FinanceRecord.id_salesman == id_salesman)
        stmt = stmt.order_by(FinanceRecord.created_at.desc()).offset(skip).limit(limit)
        return list(self.db.execute(stmt).scalars().all())

    def create(self, record: FinanceRecord) -> FinanceRecord:
        self.db.add(record)
        self.db.flush()
        self.db.refresh(record)
        return record

    def add_payment(self, payment: Payment) -> Payment:
        self.db.add(payment)
        self.db.flush()
        return payment

    def update(self, record: FinanceRecord, data: dict) -> FinanceRecord:
        for key, value in data.items():
            setattr(record, key, value)
        self.db.flush()
        self.db.refresh(record)
        return record

from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.deliveries.models import Delivery


class DeliveryRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, delivery_id: int) -> Optional[Delivery]:
        stmt = select(Delivery).where(Delivery.id == delivery_id)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_by_order_id(self, order_id: int) -> Optional[Delivery]:
        stmt = select(Delivery).where(Delivery.id_order == order_id)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_all(
        self,
        skip: int = 0,
        limit: int = 20,
        status: Optional[str] = None,
        id_salesman: Optional[int] = None,
    ) -> list[Delivery]:
        stmt = select(Delivery)
        if status:
            stmt = stmt.where(Delivery.status == status)
        if id_salesman:
            stmt = stmt.where(Delivery.id_salesman == id_salesman)
        stmt = stmt.order_by(Delivery.created_at.desc()).offset(skip).limit(limit)
        return list(self.db.execute(stmt).scalars().all())

    def create(self, delivery: Delivery) -> Delivery:
        self.db.add(delivery)
        self.db.flush()
        self.db.refresh(delivery)
        return delivery

    def update(self, delivery: Delivery, data: dict) -> Delivery:
        for key, value in data.items():
            setattr(delivery, key, value)
        self.db.flush()
        self.db.refresh(delivery)
        return delivery

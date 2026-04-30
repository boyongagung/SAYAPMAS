from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.modules.orders.models import Order, OrderItem


class OrderRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, order_id: int) -> Optional[Order]:
        stmt = (
            select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def get_all(
        self,
        skip: int = 0,
        limit: int = 20,
        status: Optional[str] = None,
        id_salesman: Optional[int] = None,
        id_customer: Optional[int] = None,
    ) -> list[Order]:
        stmt = select(Order).options(selectinload(Order.items))
        if status:
            stmt = stmt.where(Order.status == status)
        if id_salesman:
            stmt = stmt.where(Order.id_salesman == id_salesman)
        if id_customer:
            stmt = stmt.where(Order.id_customer == id_customer)
        stmt = stmt.order_by(Order.created_at.desc()).offset(skip).limit(limit)
        return list(self.db.execute(stmt).scalars().all())

    def create(self, order: Order) -> Order:
        self.db.add(order)
        self.db.flush()
        self.db.refresh(order)
        return order

    def add_item(self, item: OrderItem) -> OrderItem:
        self.db.add(item)
        self.db.flush()
        return item

    def update(self, order: Order, data: dict) -> Order:
        for key, value in data.items():
            setattr(order, key, value)
        self.db.flush()
        self.db.refresh(order)
        return order

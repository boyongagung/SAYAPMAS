from typing import Optional

from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.modules.customers.models import Customer


class CustomerRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, customer_id: int) -> Optional[Customer]:
        stmt = select(Customer).where(Customer.id == customer_id)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_by_code(self, customer_code: str) -> Optional[Customer]:
        stmt = select(Customer).where(Customer.customer_code == customer_code)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_by_gps(
        self, latitude: float, longitude: float, exclude_id: Optional[int] = None
    ) -> Optional[Customer]:
        conditions = [
            Customer.latitude == latitude,
            Customer.longitude == longitude,
        ]
        if exclude_id:
            conditions.append(Customer.id != exclude_id)
        stmt = select(Customer).where(and_(*conditions))
        return self.db.execute(stmt).scalar_one_or_none()

    def get_all(
        self, skip: int = 0, limit: int = 20, is_active: Optional[bool] = None
    ) -> list[Customer]:
        stmt = select(Customer)
        if is_active is not None:
            stmt = stmt.where(Customer.is_active == is_active)
        stmt = stmt.offset(skip).limit(limit)
        return list(self.db.execute(stmt).scalars().all())

    def create(self, customer: Customer) -> Customer:
        self.db.add(customer)
        self.db.flush()
        self.db.refresh(customer)
        return customer

    def update(self, customer: Customer, data: dict) -> Customer:
        for key, value in data.items():
            setattr(customer, key, value)
        self.db.flush()
        self.db.refresh(customer)
        return customer

    def delete(self, customer: Customer) -> None:
        self.db.delete(customer)
        self.db.flush()

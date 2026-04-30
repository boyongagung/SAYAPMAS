from typing import Optional

from sqlalchemy.orm import Session

from app.modules.customers.exceptions import (
    CustomerCodeDuplicateException,
    CustomerGPSDuplicateException,
    CustomerNotFoundException,
)
from app.modules.customers.models import Customer
from app.modules.customers.repository import CustomerRepository
from app.modules.customers.schemas import CustomerCreate, CustomerUpdate


class CustomerService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = CustomerRepository(db)

    def get_all(
        self, skip: int = 0, limit: int = 20, is_active: Optional[bool] = None
    ) -> list[Customer]:
        return self.repo.get_all(skip=skip, limit=limit, is_active=is_active)

    def get_by_id(self, customer_id: int) -> Customer:
        customer = self.repo.get_by_id(customer_id)
        if not customer:
            raise CustomerNotFoundException(customer_id)
        return customer

    def create(self, payload: CustomerCreate) -> Customer:
        with self.db.begin():
            if self.repo.get_by_code(payload.customer_code):
                raise CustomerCodeDuplicateException(payload.customer_code)
            if payload.latitude and payload.longitude:
                if self.repo.get_by_gps(payload.latitude, payload.longitude):
                    raise CustomerGPSDuplicateException()
            customer = Customer(**payload.model_dump())
            return self.repo.create(customer)

    def update(self, customer_id: int, payload: CustomerUpdate) -> Customer:
        with self.db.begin():
            customer = self.repo.get_by_id(customer_id)
            if not customer:
                raise CustomerNotFoundException(customer_id)
            data = payload.model_dump(exclude_none=True)
            if "latitude" in data and "longitude" in data:
                if self.repo.get_by_gps(
                    data["latitude"], data["longitude"], exclude_id=customer_id
                ):
                    raise CustomerGPSDuplicateException()
            return self.repo.update(customer, data)

    def delete(self, customer_id: int) -> None:
        with self.db.begin():
            customer = self.repo.get_by_id(customer_id)
            if not customer:
                raise CustomerNotFoundException(customer_id)
            self.repo.delete(customer)

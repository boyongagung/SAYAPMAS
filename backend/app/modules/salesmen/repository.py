from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.salesmen.models import Salesman


class SalesmanRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, salesman_id: int) -> Optional[Salesman]:
        return self.db.execute(
            select(Salesman).where(Salesman.id == salesman_id)
        ).scalar_one_or_none()

    def get_by_code(self, code: str) -> Optional[Salesman]:
        return self.db.execute(
            select(Salesman).where(Salesman.salesman_code == code)
        ).scalar_one_or_none()

    def get_all(self, skip: int = 0, limit: int = 20) -> list[Salesman]:
        return list(
            self.db.execute(select(Salesman).offset(skip).limit(limit)).scalars().all()
        )

    def create(self, salesman: Salesman) -> Salesman:
        self.db.add(salesman)
        self.db.flush()
        self.db.refresh(salesman)
        return salesman

    def update(self, salesman: Salesman, data: dict) -> Salesman:
        for key, value in data.items():
            setattr(salesman, key, value)
        self.db.flush()
        self.db.refresh(salesman)
        return salesman

    def delete(self, salesman: Salesman) -> None:
        self.db.delete(salesman)
        self.db.flush()

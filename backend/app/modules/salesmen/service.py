from sqlalchemy.orm import Session

from app.modules.salesmen.exceptions import SalesmanCodeDuplicate, SalesmanNotFound
from app.modules.salesmen.models import Salesman
from app.modules.salesmen.repository import SalesmanRepository
from app.modules.salesmen.schemas import SalesmanCreate, SalesmanUpdate


class SalesmanService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = SalesmanRepository(db)

    def get_all(self, skip: int = 0, limit: int = 20) -> list[Salesman]:
        return self.repo.get_all(skip=skip, limit=limit)

    def get_by_id(self, salesman_id: int) -> Salesman:
        salesman = self.repo.get_by_id(salesman_id)
        if not salesman:
            raise SalesmanNotFound(salesman_id)
        return salesman

    def create(self, payload: SalesmanCreate) -> Salesman:
        with self.db.begin():
            if self.repo.get_by_code(payload.salesman_code):
                raise SalesmanCodeDuplicate(payload.salesman_code)
            salesman = Salesman(**payload.model_dump())
            return self.repo.create(salesman)

    def update(self, salesman_id: int, payload: SalesmanUpdate) -> Salesman:
        with self.db.begin():
            salesman = self.repo.get_by_id(salesman_id)
            if not salesman:
                raise SalesmanNotFound(salesman_id)
            data = payload.model_dump(exclude_none=True)
            return self.repo.update(salesman, data)

    def delete(self, salesman_id: int) -> None:
        with self.db.begin():
            salesman = self.repo.get_by_id(salesman_id)
            if not salesman:
                raise SalesmanNotFound(salesman_id)
            self.repo.delete(salesman)

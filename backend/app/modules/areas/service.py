from sqlalchemy.orm import Session

from app.modules.areas.exceptions import (
    AreaAlreadyExistsException,
    AreaNotFoundException,
)
from app.modules.areas.models import Area
from app.modules.areas.repository import AreaRepository
from app.modules.areas.schemas import AreaCreate, AreaUpdate


class AreaService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = AreaRepository(db)

    def get_all(self, skip: int = 0, limit: int = 20) -> list[Area]:
        return self.repo.get_all(skip=skip, limit=limit)

    def get_by_id(self, area_id: int) -> Area:
        area = self.repo.get_by_id(area_id)
        if not area:
            raise AreaNotFoundException(area_id)
        return area

    def create(self, payload: AreaCreate) -> Area:
        with self.db.begin():
            if self.repo.get_by_name(payload.name):
                raise AreaAlreadyExistsException(payload.name)
            area = Area(name=payload.name, description=payload.description)
            return self.repo.create(area)

    def update(self, area_id: int, payload: AreaUpdate) -> Area:
        with self.db.begin():
            area = self.repo.get_by_id(area_id)
            if not area:
                raise AreaNotFoundException(area_id)
            data = payload.model_dump(exclude_none=True)
            return self.repo.update(area, data)

    def delete(self, area_id: int) -> None:
        with self.db.begin():
            area = self.repo.get_by_id(area_id)
            if not area:
                raise AreaNotFoundException(area_id)
            self.repo.delete(area)

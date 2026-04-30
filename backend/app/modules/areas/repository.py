from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.areas.models import Area


class AreaRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, area_id: int) -> Optional[Area]:
        stmt = select(Area).where(Area.id == area_id)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_by_name(self, name: str) -> Optional[Area]:
        stmt = select(Area).where(Area.name == name)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_all(self, skip: int = 0, limit: int = 20) -> list[Area]:
        stmt = select(Area).offset(skip).limit(limit)
        return list(self.db.execute(stmt).scalars().all())

    def create(self, area: Area) -> Area:
        self.db.add(area)
        self.db.flush()
        self.db.refresh(area)
        return area

    def update(self, area: Area, data: dict) -> Area:
        for key, value in data.items():
            setattr(area, key, value)
        self.db.flush()
        self.db.refresh(area)
        return area

    def delete(self, area: Area) -> None:
        self.db.delete(area)
        self.db.flush()

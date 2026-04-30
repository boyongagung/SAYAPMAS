from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.modules.areas.schemas import AreaCreate, AreaResponse, AreaUpdate
from app.modules.areas.service import AreaService

router = APIRouter(prefix="/api/v1/areas", tags=["areas"])


@router.get("/", response_model=dict)
def list_areas(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    service = AreaService(db)
    data = service.get_all(skip=skip, limit=limit)
    return {
        "success": True,
        "message": "OK",
        "data": [AreaResponse.model_validate(a) for a in data],
    }


@router.get("/{area_id}", response_model=dict)
def get_area(area_id: int, db: Session = Depends(get_db)):
    service = AreaService(db)
    data = service.get_by_id(area_id)
    return {"success": True, "message": "OK", "data": AreaResponse.model_validate(data)}


@router.post("/", response_model=dict, status_code=201)
def create_area(payload: AreaCreate, db: Session = Depends(get_db)):
    service = AreaService(db)
    data = service.create(payload)
    return {"success": True, "message": "OK", "data": AreaResponse.model_validate(data)}


@router.patch("/{area_id}", response_model=dict)
def update_area(area_id: int, payload: AreaUpdate, db: Session = Depends(get_db)):
    service = AreaService(db)
    data = service.update(area_id, payload)
    return {"success": True, "message": "OK", "data": AreaResponse.model_validate(data)}


@router.delete("/{area_id}", response_model=dict)
def delete_area(area_id: int, db: Session = Depends(get_db)):
    service = AreaService(db)
    service.delete(area_id)
    return {"success": True, "message": "Area deleted", "data": {}}

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.modules.salesmen.schemas import (
    SalesmanCreate,
    SalesmanResponse,
    SalesmanUpdate,
)
from app.modules.salesmen.service import SalesmanService

router = APIRouter(prefix="/api/v1/salesmen", tags=["salesmen"])


@router.get("/", response_model=dict)
def list_salesmen(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    data = SalesmanService(db).get_all(skip=skip, limit=limit)
    return {
        "success": True,
        "message": "OK",
        "data": [SalesmanResponse.model_validate(s) for s in data],
    }


@router.get("/{salesman_id}", response_model=dict)
def get_salesman(salesman_id: int, db: Session = Depends(get_db)):
    data = SalesmanService(db).get_by_id(salesman_id)
    return {
        "success": True,
        "message": "OK",
        "data": SalesmanResponse.model_validate(data),
    }


@router.post("/", response_model=dict, status_code=201)
def create_salesman(payload: SalesmanCreate, db: Session = Depends(get_db)):
    data = SalesmanService(db).create(payload)
    return {
        "success": True,
        "message": "OK",
        "data": SalesmanResponse.model_validate(data),
    }


@router.patch("/{salesman_id}", response_model=dict)
def update_salesman(
    salesman_id: int, payload: SalesmanUpdate, db: Session = Depends(get_db)
):
    data = SalesmanService(db).update(salesman_id, payload)
    return {
        "success": True,
        "message": "OK",
        "data": SalesmanResponse.model_validate(data),
    }


@router.delete("/{salesman_id}", response_model=dict)
def delete_salesman(salesman_id: int, db: Session = Depends(get_db)):
    SalesmanService(db).delete(salesman_id)
    return {"success": True, "message": "Salesman deleted.", "data": {}}

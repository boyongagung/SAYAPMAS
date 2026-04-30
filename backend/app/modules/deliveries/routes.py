from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.modules.deliveries.schemas import (
    DeliveryCreate,
    DeliveryResponse,
    DeliveryStatusUpdate,
)
from app.modules.deliveries.service import DeliveryService

router = APIRouter(prefix="/api/v1/deliveries", tags=["deliveries"])


@router.get("/", response_model=dict)
def list_deliveries(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    id_salesman: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    service = DeliveryService(db)
    data = service.get_all(
        skip=skip, limit=limit, status=status, id_salesman=id_salesman
    )
    return {
        "success": True,
        "message": "OK",
        "data": [DeliveryResponse.model_validate(d) for d in data],
    }


@router.get("/{delivery_id}", response_model=dict)
def get_delivery(delivery_id: int, db: Session = Depends(get_db)):
    service = DeliveryService(db)
    data = service.get_by_id(delivery_id)
    return {
        "success": True,
        "message": "OK",
        "data": DeliveryResponse.model_validate(data),
    }


@router.post("/", response_model=dict, status_code=201)
def create_delivery(payload: DeliveryCreate, db: Session = Depends(get_db)):
    service = DeliveryService(db)
    data = service.create(payload)
    return {
        "success": True,
        "message": "OK",
        "data": DeliveryResponse.model_validate(data),
    }


@router.patch("/{delivery_id}/status", response_model=dict)
def update_delivery_status(
    delivery_id: int, payload: DeliveryStatusUpdate, db: Session = Depends(get_db)
):
    service = DeliveryService(db)
    data = service.update_status(delivery_id, payload)
    return {
        "success": True,
        "message": "OK",
        "data": DeliveryResponse.model_validate(data),
    }

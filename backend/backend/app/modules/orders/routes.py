from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.modules.orders.schemas import OrderCreate, OrderResponse, OrderStatusUpdate
from app.modules.orders.service import OrderService

router = APIRouter(prefix="/api/v1/orders", tags=["orders"])


@router.get("/", response_model=dict)
def list_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    id_salesman: Optional[int] = Query(None),
    id_customer: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    service = OrderService(db)
    data = service.get_all(
        skip=skip,
        limit=limit,
        status=status,
        id_salesman=id_salesman,
        id_customer=id_customer,
    )
    return {
        "success": True,
        "message": "OK",
        "data": [OrderResponse.model_validate(o) for o in data],
    }


@router.get("/{order_id}", response_model=dict)
def get_order(order_id: int, db: Session = Depends(get_db)):
    service = OrderService(db)
    data = service.get_by_id(order_id)
    return {
        "success": True,
        "message": "OK",
        "data": OrderResponse.model_validate(data),
    }


@router.post("/", response_model=dict, status_code=201)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    service = OrderService(db)
    data = service.create(payload)
    return {
        "success": True,
        "message": "OK",
        "data": OrderResponse.model_validate(data),
    }


@router.patch("/{order_id}/status", response_model=dict)
def update_order_status(
    order_id: int, payload: OrderStatusUpdate, db: Session = Depends(get_db)
):
    service = OrderService(db)
    data = service.update_status(order_id, payload)
    return {
        "success": True,
        "message": "OK",
        "data": OrderResponse.model_validate(data),
    }

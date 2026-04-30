from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.modules.customers.schemas import (
    CustomerCreate,
    CustomerResponse,
    CustomerUpdate,
)
from app.modules.customers.service import CustomerService

router = APIRouter(prefix="/api/v1/customers", tags=["customers"])


@router.get("/", response_model=dict)
def list_customers(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
):
    data = CustomerService(db).get_all(skip=skip, limit=limit, is_active=is_active)
    return {
        "success": True,
        "message": "OK",
        "data": [CustomerResponse.model_validate(c) for c in data],
    }


@router.get("/{customer_id}", response_model=dict)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    data = CustomerService(db).get_by_id(customer_id)
    return {
        "success": True,
        "message": "OK",
        "data": CustomerResponse.model_validate(data),
    }


@router.post("/", response_model=dict, status_code=201)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    data = CustomerService(db).create(payload)
    return {
        "success": True,
        "message": "OK",
        "data": CustomerResponse.model_validate(data),
    }


@router.patch("/{customer_id}", response_model=dict)
def update_customer(
    customer_id: int, payload: CustomerUpdate, db: Session = Depends(get_db)
):
    data = CustomerService(db).update(customer_id, payload)
    return {
        "success": True,
        "message": "OK",
        "data": CustomerResponse.model_validate(data),
    }


@router.delete("/{customer_id}", response_model=dict)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    CustomerService(db).delete(customer_id)
    return {"success": True, "message": "Customer deleted.", "data": {}}

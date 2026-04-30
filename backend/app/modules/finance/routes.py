from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.modules.finance.schemas import (
    FinanceRecordCreate,
    FinanceRecordResponse,
    PaymentCreate,
)
from app.modules.finance.service import FinanceService

router = APIRouter(prefix="/api/v1/finance", tags=["finance"])


@router.get("/", response_model=dict)
def list_finance_records(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    id_customer: Optional[int] = Query(None),
    id_salesman: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    service = FinanceService(db)
    data = service.get_all(
        skip=skip,
        limit=limit,
        status=status,
        id_customer=id_customer,
        id_salesman=id_salesman,
    )
    return {
        "success": True,
        "message": "OK",
        "data": [FinanceRecordResponse.model_validate(r) for r in data],
    }


@router.get("/{record_id}", response_model=dict)
def get_finance_record(record_id: int, db: Session = Depends(get_db)):
    service = FinanceService(db)
    data = service.get_by_id(record_id)
    return {
        "success": True,
        "message": "OK",
        "data": FinanceRecordResponse.model_validate(data),
    }


@router.post("/", response_model=dict, status_code=201)
def create_finance_record(payload: FinanceRecordCreate, db: Session = Depends(get_db)):
    service = FinanceService(db)
    data = service.create_from_order(payload)
    return {
        "success": True,
        "message": "OK",
        "data": FinanceRecordResponse.model_validate(data),
    }


@router.post("/{record_id}/payments", response_model=dict, status_code=201)
def add_payment(record_id: int, payload: PaymentCreate, db: Session = Depends(get_db)):
    service = FinanceService(db)
    data = service.add_payment(record_id, payload)
    return {
        "success": True,
        "message": "OK",
        "data": FinanceRecordResponse.model_validate(data),
    }

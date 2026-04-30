from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.modules.products.schemas import ProductCreate, ProductResponse, ProductUpdate
from app.modules.products.service import ProductService

router = APIRouter(prefix="/api/v1/products", tags=["products"])


@router.get("/", response_model=dict)
def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
):
    service = ProductService(db)
    data = service.get_all(skip=skip, limit=limit, is_active=is_active)
    return {
        "success": True,
        "message": "OK",
        "data": [ProductResponse.model_validate(p) for p in data],
    }


@router.get("/{product_id}", response_model=dict)
def get_product(product_id: int, db: Session = Depends(get_db)):
    service = ProductService(db)
    data = service.get_by_id(product_id)
    return {
        "success": True,
        "message": "OK",
        "data": ProductResponse.model_validate(data),
    }


@router.post("/", response_model=dict, status_code=201)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    service = ProductService(db)
    data = service.create(payload)
    return {
        "success": True,
        "message": "OK",
        "data": ProductResponse.model_validate(data),
    }


@router.put("/{product_id}", response_model=dict)
def update_product(
    product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)
):
    service = ProductService(db)
    data = service.update(product_id, payload)
    return {
        "success": True,
        "message": "OK",
        "data": ProductResponse.model_validate(data),
    }


@router.delete("/{product_id}", response_model=dict)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    service = ProductService(db)
    service.delete(product_id)
    return {"success": True, "message": "Product deleted", "data": {}}

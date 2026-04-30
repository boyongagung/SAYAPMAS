from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.products.models import Product


class ProductRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, product_id: int) -> Optional[Product]:
        stmt = select(Product).where(Product.id == product_id)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_by_code(self, product_code: str) -> Optional[Product]:
        stmt = select(Product).where(Product.product_code == product_code)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_all(
        self, skip: int = 0, limit: int = 20, is_active: Optional[bool] = None
    ) -> list[Product]:
        stmt = select(Product)
        if is_active is not None:
            stmt = stmt.where(Product.is_active == is_active)
        stmt = stmt.offset(skip).limit(limit)
        return list(self.db.execute(stmt).scalars().all())

    def create(self, product: Product) -> Product:
        self.db.add(product)
        self.db.flush()
        self.db.refresh(product)
        return product

    def update(self, product: Product, data: dict) -> Product:
        for key, value in data.items():
            setattr(product, key, value)
        self.db.flush()
        self.db.refresh(product)
        return product

    def delete(self, product: Product) -> None:
        self.db.delete(product)
        self.db.flush()

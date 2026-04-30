from decimal import Decimal
from typing import Optional

from sqlalchemy.orm import Session

from app.modules.products.constants import DEFAULT_PAGE_SIZE
from app.modules.products.exceptions import (
    ProductCodeDuplicateException,
    ProductNotFoundException,
    ProductStockInsufficientException,
)
from app.modules.products.models import Product
from app.modules.products.repository import ProductRepository
from app.modules.products.schemas import ProductCreate, ProductUpdate


class ProductService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ProductRepository(db)

    def get_all(
        self,
        skip: int = 0,
        limit: int = DEFAULT_PAGE_SIZE,
        is_active: Optional[bool] = None,
    ) -> list[Product]:
        return self.repo.get_all(skip=skip, limit=limit, is_active=is_active)

    def get_by_id(self, product_id: int) -> Product:
        product = self.repo.get_by_id(product_id)
        if not product:
            raise ProductNotFoundException(product_id)
        return product

    def create(self, payload: ProductCreate) -> Product:
        with self.db.begin():
            if self.repo.get_by_code(payload.product_code):
                raise ProductCodeDuplicateException(payload.product_code)
            product = Product(**payload.model_dump())
            return self.repo.create(product)

    def update(self, product_id: int, payload: ProductUpdate) -> Product:
        with self.db.begin():
            product = self.repo.get_by_id(product_id)
            if not product:
                raise ProductNotFoundException(product_id)
            data = payload.model_dump(exclude_none=True)
            if "price" in data and Decimal(str(data["price"])) != product.price:
                pass  # TODO: audit log
            return self.repo.update(product, data)

    def delete(self, product_id: int) -> None:
        with self.db.begin():
            product = self.repo.get_by_id(product_id)
            if not product:
                raise ProductNotFoundException(product_id)
            self.repo.delete(product)

    def book_stock(self, product_id: int, qty: int) -> Product:
        with self.db.begin():
            product = self.repo.get_by_id(product_id)
            if not product:
                raise ProductNotFoundException(product_id)
            if product.stock_available < qty:
                raise ProductStockInsufficientException(
                    product_id, qty, product.stock_available
                )
            return self.repo.update(
                product,
                {
                    "stock_available": product.stock_available - qty,
                    "stock_booked": product.stock_booked + qty,
                },
            )

    def transit_stock(self, product_id: int, qty: int) -> Product:
        with self.db.begin():
            product = self.repo.get_by_id(product_id)
            if not product:
                raise ProductNotFoundException(product_id)
            return self.repo.update(
                product,
                {
                    "stock_booked": product.stock_booked - qty,
                    "stock_in_transit": product.stock_in_transit + qty,
                },
            )

    def deliver_stock(self, product_id: int, qty: int) -> Product:
        with self.db.begin():
            product = self.repo.get_by_id(product_id)
            if not product:
                raise ProductNotFoundException(product_id)
            return self.repo.update(
                product,
                {
                    "stock_in_transit": product.stock_in_transit - qty,
                    "stock_delivered": product.stock_delivered + qty,
                },
            )

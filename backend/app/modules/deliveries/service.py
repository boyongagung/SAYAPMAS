from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.modules.deliveries.constants import (
    DEFAULT_PAGE_SIZE,
    DELIVERY_CODE_PREFIX,
    DELIVERY_TO_ORDER_STATUS,
    STATUS_TRANSITIONS,
)
from app.modules.deliveries.exceptions import (
    DeliveryAlreadyExistsException,
    DeliveryNotFoundException,
    DeliveryOrderNotConfirmedException,
    DeliveryStatusInvalidTransitionException,
)
from app.modules.deliveries.models import Delivery
from app.modules.deliveries.repository import DeliveryRepository
from app.modules.deliveries.schemas import DeliveryCreate, DeliveryStatusUpdate
from app.modules.orders.repository import OrderRepository
from app.modules.products.repository import ProductRepository


def _generate_delivery_code() -> str:
    ts = datetime.now().strftime("%Y%m%d%H%M%S%f")[:18]
    return f"{DELIVERY_CODE_PREFIX}-{ts}"


class DeliveryService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = DeliveryRepository(db)
        self.order_repo = OrderRepository(db)
        self.product_repo = ProductRepository(db)

    def get_all(
        self,
        skip: int = 0,
        limit: int = DEFAULT_PAGE_SIZE,
        status: Optional[str] = None,
        id_salesman: Optional[int] = None,
    ) -> list[Delivery]:
        return self.repo.get_all(
            skip=skip, limit=limit, status=status, id_salesman=id_salesman
        )

    def get_by_id(self, delivery_id: int) -> Delivery:
        delivery = self.repo.get_by_id(delivery_id)
        if not delivery:
            raise DeliveryNotFoundException(delivery_id)
        return delivery

    def create(self, payload: DeliveryCreate) -> Delivery:
        with self.db.begin():
            order = self.order_repo.get_by_id(payload.id_order)
            if not order or order.status != "confirmed":
                raise DeliveryOrderNotConfirmedException(payload.id_order)

            if self.repo.get_by_order_id(payload.id_order):
                raise DeliveryAlreadyExistsException(payload.id_order)

            delivery = Delivery(
                delivery_code=_generate_delivery_code(),
                id_order=payload.id_order,
                id_salesman=payload.id_salesman,
                status="assigned",
                notes=payload.notes,
            )
            return self.repo.create(delivery)

    def update_status(
        self, delivery_id: int, payload: DeliveryStatusUpdate
    ) -> Delivery:
        with self.db.begin():
            delivery = self.repo.get_by_id(delivery_id)
            if not delivery:
                raise DeliveryNotFoundException(delivery_id)

            allowed = STATUS_TRANSITIONS.get(delivery.status, [])
            if payload.status not in allowed:
                raise DeliveryStatusInvalidTransitionException(
                    delivery.status, payload.status
                )

            update_data: dict = {
                "status": payload.status,
                "delivery_latitude": payload.delivery_latitude,
                "delivery_longitude": payload.delivery_longitude,
                "notes": payload.notes,
            }

            order = self.order_repo.get_by_id(delivery.id_order)

            if payload.status == "in_transit":
                for item in order.items:
                    product = self.product_repo.get_by_id(item.id_product)
                    if product:
                        product.stock_booked -= item.qty
                        product.stock_in_transit += item.qty
                        self.db.flush()

            elif payload.status == "delivered":
                for item in order.items:
                    product = self.product_repo.get_by_id(item.id_product)
                    if product:
                        product.stock_in_transit -= item.qty
                        product.stock_delivered += item.qty
                        self.db.flush()
                update_data["delivered_at"] = datetime.now(timezone.utc)

            if payload.status in DELIVERY_TO_ORDER_STATUS:
                order.status = DELIVERY_TO_ORDER_STATUS[payload.status]
                self.db.flush()

            return self.repo.update(delivery, update_data)

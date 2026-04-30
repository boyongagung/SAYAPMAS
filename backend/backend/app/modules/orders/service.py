import math
from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy.orm import Session

from app.modules.customers.repository import CustomerRepository
from app.modules.orders.constants import (
    GEOFENCE_RADIUS_METER,
    ORDER_CODE_PREFIX,
    DEFAULT_PAGE_SIZE,
    STATUS_TRANSITIONS,
)
from app.modules.orders.exceptions import (
    OrderGeofenceViolationException,
    OrderNotFoundException,
    OrderStatusInvalidTransitionException,
)
from app.modules.orders.models import Order, OrderItem
from app.modules.orders.repository import OrderRepository
from app.modules.orders.schemas import OrderCreate, OrderStatusUpdate
from app.modules.products.repository import ProductRepository
from app.modules.products.exceptions import ProductStockInsufficientException


def _haversine_meter(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6_371_000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = (
        math.sin(dphi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _generate_order_code() -> str:
    ts = datetime.now().strftime("%Y%m%d%H%M%S%f")[:18]
    return f"{ORDER_CODE_PREFIX}-{ts}"


class OrderService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = OrderRepository(db)
        self.customer_repo = CustomerRepository(db)
        self.product_repo = ProductRepository(db)

    def get_all(
        self,
        skip: int = 0,
        limit: int = DEFAULT_PAGE_SIZE,
        status: Optional[str] = None,
        id_salesman: Optional[int] = None,
        id_customer: Optional[int] = None,
    ) -> list[Order]:
        return self.repo.get_all(
            skip=skip,
            limit=limit,
            status=status,
            id_salesman=id_salesman,
            id_customer=id_customer,
        )

    def get_by_id(self, order_id: int) -> Order:
        order = self.repo.get_by_id(order_id)
        if not order:
            raise OrderNotFoundException(order_id)
        return order

    def create(self, payload: OrderCreate) -> Order:
        with self.db.begin():
            # 1. Geofencing validation
            geofence_valid = 0
            if payload.salesman_latitude and payload.salesman_longitude:
                customer = self.customer_repo.get_by_id(payload.id_customer)
                if customer and customer.latitude and customer.longitude:
                    distance = _haversine_meter(
                        payload.salesman_latitude,
                        payload.salesman_longitude,
                        customer.latitude,
                        customer.longitude,
                    )
                    if distance <= GEOFENCE_RADIUS_METER:
                        geofence_valid = 1
                    else:
                        raise OrderGeofenceViolationException()

            # 2. Buat order header
            order = Order(
                order_code=_generate_order_code(),
                id_customer=payload.id_customer,
                id_salesman=payload.id_salesman,
                status="pending",
                salesman_latitude=payload.salesman_latitude,
                salesman_longitude=payload.salesman_longitude,
                geofence_valid=geofence_valid,
                notes=payload.notes,
                total_amount=Decimal("0"),
            )
            self.repo.create(order)

            # 3. Proses items + book stock
            total = Decimal("0")
            for item_payload in payload.items:
                product = self.product_repo.get_by_id(item_payload.id_product)
                if product.stock_available < item_payload.qty:
                    raise ProductStockInsufficientException(
                        product.id, item_payload.qty, product.stock_available
                    )
                # book stock inline (dalam transaksi yang sama)
                product.stock_available -= item_payload.qty
                product.stock_booked += item_payload.qty
                self.db.flush()

                subtotal = product.price * item_payload.qty
                item = OrderItem(
                    id_order=order.id,
                    id_product=product.id,
                    qty=item_payload.qty,
                    price_at_order=product.price,
                    subtotal=subtotal,
                )
                self.repo.add_item(item)
                total += subtotal

            # 4. Update total
            self.repo.update(order, {"total_amount": total})
            return self.repo.get_by_id(order.id)

    def update_status(self, order_id: int, payload: OrderStatusUpdate) -> Order:
        with self.db.begin():
            order = self.repo.get_by_id(order_id)
            if not order:
                raise OrderNotFoundException(order_id)

            allowed = STATUS_TRANSITIONS.get(order.status, [])
            if payload.status not in allowed:
                raise OrderStatusInvalidTransitionException(
                    order.status, payload.status
                )

            # Jika cancelled, kembalikan stok
            if payload.status == "cancelled":
                for item in order.items:
                    product = self.product_repo.get_by_id(item.id_product)
                    if product:
                        product.stock_booked -= item.qty
                        product.stock_available += item.qty
                        self.db.flush()

            return self.repo.update(order, {"status": payload.status})

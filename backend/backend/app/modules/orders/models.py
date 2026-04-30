from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from app.database.base import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_code = Column(String(50), unique=True, nullable=False, index=True)
    id_customer = Column(Integer, ForeignKey("customers.id"), nullable=False)
    id_salesman = Column(Integer, ForeignKey("salesmen.id"), nullable=False)
    status = Column(String(30), nullable=False, default="pending")
    # status: pending | confirmed | in_transit | delivered | cancelled
    salesman_latitude = Column(Float, nullable=True)
    salesman_longitude = Column(Float, nullable=True)
    geofence_valid = Column(Integer, nullable=True)  # 1=valid, 0=invalid
    notes = Column(Text, nullable=True)
    total_amount = Column(Numeric(15, 2), nullable=False, default=0)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    customer = relationship("Customer", backref="orders")
    salesman = relationship("Salesman", backref="orders")
    items = relationship(
        "OrderItem", back_populates="order", cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    id_order = Column(Integer, ForeignKey("orders.id"), nullable=False)
    id_product = Column(Integer, ForeignKey("products.id"), nullable=False)
    qty = Column(Integer, nullable=False)
    price_at_order = Column(Numeric(15, 2), nullable=False)  # snapshot harga saat order
    subtotal = Column(Numeric(15, 2), nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    order = relationship("Order", back_populates="items")
    product = relationship("Product", backref="order_items")

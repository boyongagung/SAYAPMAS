from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from app.database.base import Base


class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)
    delivery_code = Column(String(50), unique=True, nullable=False, index=True)
    id_order = Column(Integer, ForeignKey("orders.id"), nullable=False)
    id_salesman = Column(Integer, ForeignKey("salesmen.id"), nullable=False)
    status = Column(String(30), nullable=False, default="assigned")
    # status: assigned | in_transit | delivered | failed
    delivery_latitude = Column(Float, nullable=True)
    delivery_longitude = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    order = relationship("Order", backref="delivery")
    salesman = relationship("Salesman", backref="deliveries")

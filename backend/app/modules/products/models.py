from sqlalchemy import Boolean, Column, DateTime, Integer, Numeric, String, Text, func

from app.database.base import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    product_code = Column(String(50), unique=True, nullable=False, index=True)
    nama = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    unit = Column(String(20), nullable=False)
    price = Column(Numeric(15, 2), nullable=False)
    stock_available = Column(Integer, default=0, nullable=False)
    stock_booked = Column(Integer, default=0, nullable=False)
    stock_in_transit = Column(Integer, default=0, nullable=False)
    stock_delivered = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

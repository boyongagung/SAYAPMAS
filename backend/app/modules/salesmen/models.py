from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from app.database.base import Base


class Salesman(Base):
    __tablename__ = "salesmen"

    id = Column(Integer, primary_key=True, index=True)
    salesman_code = Column(String(50), unique=True, nullable=False, index=True)
    nama = Column(String(150), nullable=False)
    phone = Column(String(20), nullable=True)
    id_area = Column(Integer, ForeignKey("areas.id"), nullable=False)
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

    area = relationship("Area", back_populates="salesmen")
    customers = relationship("Customer", back_populates="salesman")

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from app.database.base import Base


class FinanceRecord(Base):
    __tablename__ = "finance_records"

    id = Column(Integer, primary_key=True, index=True)
    record_code = Column(String(50), unique=True, nullable=False, index=True)
    id_order = Column(Integer, ForeignKey("orders.id"), nullable=False)
    id_customer = Column(Integer, ForeignKey("customers.id"), nullable=False)
    id_salesman = Column(Integer, ForeignKey("salesmen.id"), nullable=False)
    type = Column(String(30), nullable=False)
    status = Column(String(30), nullable=False, default="unpaid")
    total_amount = Column(Numeric(15, 2), nullable=False)
    paid_amount = Column(Numeric(15, 2), nullable=False, default=0)
    remaining_amount = Column(Numeric(15, 2), nullable=False)
    notes = Column(Text, nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    order = relationship("Order", backref="finance_record")
    customer = relationship("Customer", backref="finance_records")
    salesman = relationship("Salesman", backref="finance_records")
    payments = relationship(
        "Payment", back_populates="finance_record", cascade="all, delete-orphan"
    )


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    payment_code = Column(String(50), unique=True, nullable=False, index=True)
    id_finance_record = Column(
        Integer, ForeignKey("finance_records.id"), nullable=False
    )
    amount = Column(Numeric(15, 2), nullable=False)
    method = Column(String(30), nullable=False, default="cash")
    notes = Column(Text, nullable=True)
    paid_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    finance_record = relationship("FinanceRecord", back_populates="payments")

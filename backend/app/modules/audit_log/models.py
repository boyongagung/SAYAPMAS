from sqlalchemy import Column, Integer, String, DateTime, Text
from app.database.base import Base
from datetime import datetime


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    action = Column(String(50))
    table_name = Column(String(50))
    record_id = Column(Integer)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

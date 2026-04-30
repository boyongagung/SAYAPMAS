from sqlalchemy.orm import Session
from app.modules.audit_log.models import AuditLog


class AuditLogRepository:
    def create_log(self, db: Session, log_data: dict):
        # Repository dilarang keras melakukan commit()
        db_log = AuditLog(**log_data)
        db.add(db_log)
        return db_log

    def get_logs(self, db: Session, limit: int = 100):
        # Operasi baca dilakukan di layer repository
        return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()

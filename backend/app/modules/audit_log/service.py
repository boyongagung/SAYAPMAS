from sqlalchemy.orm import Session
from app.modules.audit_log.repository import AuditLogRepository


class AuditLogService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = AuditLogRepository()

    def record_activity(self, log_data: dict):
        # Operasi tulis wajib dalam blok transaction
        with self.db.begin():
            return self.repo.create_log(self.db, log_data)

    def fetch_logs(self):
        return self.repo.get_logs(self.db)

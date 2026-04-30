from sqlalchemy.orm import Session
from app.modules.reporting.repository import ReportingRepository


class ReportingService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ReportingRepository()

    def get_dashboard_data(self):
        # Operasi baca tidak wajib with self.db.begin() tapi disarankan untuk konsistensi
        mtd = self.repo.get_mtd_sales(self.db)
        perf = self.repo.get_salesman_performance(self.db)

        return {"mtd_sales": mtd, "salesman_performance": [dict(row) for row in perf]}

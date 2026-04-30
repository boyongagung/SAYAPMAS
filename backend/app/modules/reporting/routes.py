from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import require_roles
from app.modules.reporting.service import ReportingService

router = APIRouter(prefix="/reports", tags=["Reporting"])


@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("admin", "manager", "owner")),
):
    service = ReportingService(db)
    data = service.get_dashboard_data()
    return {"success": True, "message": "OK", "data": data}

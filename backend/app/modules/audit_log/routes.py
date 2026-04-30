from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import require_roles
from app.modules.audit_log.service import AuditLogService

router = APIRouter(prefix="/audit", tags=["Audit Log"])


@router.get("/")
def list_logs(
    db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "owner"))
):
    # Route dilarang query DB langsung
    service = AuditLogService(db)
    logs = service.fetch_logs()
    # Standard Response Wrapper
    return {"success": True, "message": "OK", "data": logs}

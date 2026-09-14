"""Manager dashboard endpoint (MASTER 22, FR-015)."""

from fastapi import APIRouter, Depends

from app.api.deps import get_dashboard_service, require_permission
from app.schemas.dashboard import DashboardRead
from app.security.permissions import Permission
from app.security.principal import Principal
from app.services.dashboard_service import DashboardService

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard", response_model=DashboardRead)
async def get_dashboard(
    principal: Principal = Depends(require_permission(Permission.REPORTS_VIEW)),
    service: DashboardService = Depends(get_dashboard_service),
) -> DashboardRead:
    return await service.get_overview(principal)

"""GET /api/v1/me — the caller's identity and resolved permissions."""

from fastapi import APIRouter, Depends

from app.api.deps import get_principal
from app.schemas.me import MeRead
from app.security.principal import Principal

router = APIRouter(tags=["me"])


@router.get("/me", response_model=MeRead)
async def read_me(principal: Principal = Depends(get_principal)) -> MeRead:
    return MeRead(
        user_id=principal.user_id,
        organization_id=principal.organization_id,
        roles=sorted(principal.roles),
        permissions=sorted(str(p) for p in principal.permissions),
    )

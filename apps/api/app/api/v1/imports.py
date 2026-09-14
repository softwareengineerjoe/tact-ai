"""Import endpoints (MASTER FR-019, section 22).

Bulk-load employees from CSV. The MVP accepts the raw CSV content as JSON and
processes it synchronously, returning a reviewable job with per-row results.
"""

import uuid

from fastapi import APIRouter, Depends, status

from app.api.deps import get_import_service, get_principal
from app.schemas.import_job import ImportCreate, ImportJobRead
from app.security.principal import Principal
from app.services.import_service import ImportService

router = APIRouter(prefix="/imports", tags=["imports"])


@router.post("", response_model=ImportJobRead, status_code=status.HTTP_201_CREATED)
async def create_import(
    payload: ImportCreate,
    principal: Principal = Depends(get_principal),
    service: ImportService = Depends(get_import_service),
) -> ImportJobRead:
    job = await service.import_employees(principal, payload)
    return ImportJobRead.model_validate(job)


@router.get("/{import_id}", response_model=ImportJobRead)
async def get_import(
    import_id: uuid.UUID,
    principal: Principal = Depends(get_principal),
    service: ImportService = Depends(get_import_service),
) -> ImportJobRead:
    job = await service.get_import(principal, import_id)
    return ImportJobRead.model_validate(job)

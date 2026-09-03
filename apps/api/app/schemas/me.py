"""Current-user schema (GET /api/v1/me)."""

import uuid

from pydantic import BaseModel


class MeRead(BaseModel):
    user_id: uuid.UUID
    organization_id: uuid.UUID
    roles: list[str]
    permissions: list[str]

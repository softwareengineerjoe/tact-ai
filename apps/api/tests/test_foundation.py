"""Foundation tests: app boots, health + /me respond, RBAC primitives work."""

import uuid

import pytest
from app.core.exceptions import PermissionDenied
from app.main import app
from app.security.permissions import Permission
from app.security.principal import Principal
from httpx import ASGITransport, AsyncClient


@pytest.mark.asyncio
async def test_health_live() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health/live")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_me_returns_permissions() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/me")
    assert response.status_code == 200
    body = response.json()
    assert "projects.view" in body["permissions"]
    assert response.headers["X-Correlation-Id"]


def test_principal_require_raises_when_missing() -> None:
    principal = Principal(
        user_id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        roles=frozenset(),
        permissions=frozenset({Permission.PROJECTS_VIEW}),
    )
    principal.require(Permission.PROJECTS_VIEW)
    with pytest.raises(PermissionDenied):
        principal.require(Permission.PROJECTS_CREATE)

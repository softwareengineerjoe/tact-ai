# Backend Coding Standards

**Status:** Binding standard. Derived from [MASTER.md](MASTER.md) (sections 18.2, 19, 20–23, 28).

The single source of truth is [MASTER.md](MASTER.md). This document defines the
**mandatory** structure, naming, and patterns for the FastAPI backend in
[apps/api](../apps/api). Every route, schema, model, repository, and service
MUST follow these rules. When anything here conflicts with the master, the
master wins unless an approved ADR changes it.

---

## 0. Simplicity First (read before everything else)

The highest priority is **clean, simple, maintainable code**. Prefer the smallest
solution that satisfies the requirement and the standards below. When two
approaches both comply, **choose the one with less code and fewer moving parts.**

Mandatory mindset:

1. **Solve the problem in front of you** — build for today's requirement, not an
   imagined future one (YAGNI). No speculative parameters, config flags, hooks,
   or extension points "just in case."
2. **Less code wins.** Fewer classes, fewer layers of indirection, fewer
   dependencies. Delete code before adding it; reuse an existing service or
   repository method before writing a new one.
3. **No premature abstraction.** Do not add base classes, generic managers,
   mixins, or metaclasses until at least two real cases demand them. A little
   duplication is cheaper than the wrong abstraction.
4. **Readable over clever.** Straightforward, explicit code beats compact magic.
   Avoid dynamic dispatch, deep inheritance, and over-generic typing when a plain
   function or a couple of `if`s is clearer.
5. **Respect the layers — no more.** `api → services → repositories → models` is
   the required structure; do not invent extra layers (managers, facades,
   unit-of-work wrappers, custom DI containers) on top of it without an ADR.
6. **Boring by default.** Use plain FastAPI, SQLAlchemy, and Pydantic the way the
   templates show. Reach for advanced patterns only when a concrete, present need
   proves them necessary.
7. **Match the templates, don't gold-plate them.** The templates here are the
   ceiling of complexity for common cases, not a floor to build on.

A change that adds abstraction, indirection, or configuration must justify its
complexity in the PR. If it cannot, simplify it. "It might be useful later" is
not a justification.

---

## 1. Non-Negotiable Rules

1. **Layered architecture**, one direction only:
   `api → services → repositories → models`. Never skip or reverse layers.
2. **Routers contain no business logic** — only request/response mapping and dependency wiring.
3. **All business rules live in services.** Services are framework-agnostic.
4. **All DB access lives in repositories.** No ORM queries in routers or services-callers.
5. **The AI layer never touches the DB directly** — it calls services (MASTER 15.5, 39.6).
6. **Every query is scoped by organization and permission** (MASTER section 21).
7. **Permissions are enforced in the backend**, not assumed from the client (MASTER 28).
8. **Pydantic v2 schemas** validate every request and shape every response.
9. Fully **async** stack (`async def`, `asyncpg`, `AsyncSession`). No blocking I/O in request path.
10. **Type-checked with mypy (strict)**; linted/formatted with **Ruff**. No `# type: ignore` without a reason comment.

---

## 2. Folder Structure

Aligned with MASTER section 19. `apps/api/app`:

```text
app/
├── api/              # Routers (versioned under v1) + dependencies
│   ├── v1/
│   │   ├── projects.py
│   │   ├── people.py
│   │   ├── tickets.py
│   │   └── ...
│   ├── deps.py       # Shared FastAPI dependencies (auth, db, pagination)
│   └── router.py     # Aggregates v1 routers under /api/v1
├── core/             # Config, settings, logging, security primitives, errors
├── models/           # SQLAlchemy ORM models (one module per aggregate)
├── schemas/          # Pydantic v2 request/response models
├── repositories/     # DB access objects (one per aggregate)
├── services/         # Business logic (one per domain)
├── agents/           # TACT Orchestrator agent + secured tools
├── integrations/     # Provider adapters (excel, jira, workday, ...)
├── security/         # RBAC, permission checks, field-level access, auth
└── main.py           # App factory, middleware, lifespan
```

One aggregate/domain = one module in each of models, schemas, repositories,
services, and api/v1. Keep names parallel: `projects.py` in every layer.

---

## 3. Naming Conventions

| Artifact               | Case              | Example                       |
| ---------------------- | ----------------- | ----------------------------- |
| Module / file          | snake_case        | `project_service.py`, `projects.py` |
| Class (model/schema/service) | PascalCase  | `Project`, `ProjectService`   |
| Function / method      | snake_case        | `create_project`              |
| Variable               | snake_case        | `project_id`                  |
| Constant               | UPPER_SNAKE       | `MAX_TEAM_SIZE`               |
| SQLAlchemy model       | PascalCase (singular) | `Project`, `ProjectAssignment` |
| Table name             | snake_case (plural)   | `projects`, `project_assignments` |
| Pydantic request       | `<Entity>Create` / `<Entity>Update` | `ProjectCreate` |
| Pydantic response      | `<Entity>Read` / `<Entity>Summary` | `ProjectRead`  |
| Repository class       | `<Entity>Repository` | `ProjectRepository`        |
| Service class          | `<Entity>Service` | `ProjectService`              |
| Enum                   | PascalCase + members UPPER_SNAKE | `ProjectStatus.ACTIVE` |
| Router variable        | `router`          | `router = APIRouter(...)`     |
| Dependency function    | snake_case        | `get_current_user`            |

Booleans: `is_/has_/can_/should_`. Async fns are named by intent, not with an
`async_` prefix.

---

## 4. Settings & Config Standard

* Central `Settings` (pydantic-settings) in `core/config.py`, loaded once.
* No secrets in code; read from env / Azure Key Vault (MASTER 18.5, 28).
* **Model deployment names are configuration**, never hardcoded (MASTER 18.4).

```python
# core/config.py
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "local"
    database_url: str
    ai_model_deployment: str
    ai_embedding_deployment: str


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]  # values sourced from env
```

---

## 5. Models Standard (SQLAlchemy 2.x)

* Use typed `Mapped[...]` / `mapped_column`. UUID PKs, UTC timestamps (MASTER 21).
* A shared `Base` provides `id`, `created_at`, `updated_at`, `version` (optimistic concurrency), and soft-delete `deleted_at`.
* Business records are **soft-deleted**, never physically removed (MASTER 21, 39.12).
* Every org-scoped table carries `organization_id` and indexes it.

```python
# models/base.py
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Integer, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID


class Base(DeclarativeBase):
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(),
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
```

```python
# models/project.py
import uuid
from sqlalchemy import String, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base


class Project(Base):
    __tablename__ = "projects"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False,
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="draft")

    __table_args__ = (Index("ix_projects_org", "organization_id"),)
```

Enums are defined once in `core/enums.py` (or the model module) and reused by
schemas — do not redefine allowed values in two places.

---

## 6. Schemas Standard (Pydantic v2)

* Separate `Create`, `Update`, and `Read` models. Never accept ORM models as input.
* `Read` models set `model_config = ConfigDict(from_attributes=True)`.
* Timestamps serialize as ISO 8601 (MASTER 23). Use `datetime`, let Pydantic format.
* Updates use record `version`/ETag for optimistic concurrency (MASTER 23).

```python
# schemas/project.py
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.core.enums import ProjectStatus


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str | None = None
    manager_id: uuid.UUID | None = None


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    status: ProjectStatus | None = None
    version: int  # required for optimistic concurrency


class ProjectRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    name: str
    status: ProjectStatus
    start_date: datetime | None
    target_end_date: datetime | None
    version: int
    created_at: datetime
    updated_at: datetime
```

Paginated responses use a shared generic envelope:

```python
# schemas/common.py
from typing import Generic, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
```

---

## 7. Repository Standard

* One repository per aggregate. Repositories take an `AsyncSession`.
* **Every read/write is scoped by `organization_id`** and excludes soft-deleted rows.
* Repositories return ORM models; they never build HTTP responses.
* No business rules here — only persistence and query construction.

```python
# repositories/project_repository.py
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.project import Project


class ProjectRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get(self, organization_id: uuid.UUID, project_id: uuid.UUID) -> Project | None:
        stmt = (
            select(Project)
            .where(
                Project.id == project_id,
                Project.organization_id == organization_id,
                Project.deleted_at.is_(None),
            )
        )
        return await self._session.scalar(stmt)

    async def list(
        self, organization_id: uuid.UUID, *, limit: int, offset: int,
    ) -> list[Project]:
        stmt = (
            select(Project)
            .where(
                Project.organization_id == organization_id,
                Project.deleted_at.is_(None),
            )
            .order_by(Project.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(await self._session.scalars(stmt))

    async def add(self, project: Project) -> Project:
        self._session.add(project)
        await self._session.flush()
        return project
```

---

## 8. Service Standard

* Services hold **all** business logic and enforce domain rules (MASTER sections 12–14).
* Services receive the acting principal (user + permissions) and **check authorization** (MASTER 28).
* Services orchestrate repositories; they own the transaction boundary.
* Services raise typed domain exceptions (see section 10), never `HTTPException`.
* Recommendation/fit scoring is **deterministic** in services; the AI never computes it (MASTER 39.8).

```python
# services/project_service.py
import uuid
from app.models.project import Project
from app.repositories.project_repository import ProjectRepository
from app.schemas.project import ProjectCreate
from app.security.principal import Principal
from app.core.exceptions import PermissionDenied, NotFound, ConflictError


class ProjectService:
    def __init__(self, repository: ProjectRepository) -> None:
        self._repository = repository

    async def create_project(self, principal: Principal, data: ProjectCreate) -> Project:
        principal.require("projects.create")

        project = Project(
            organization_id=principal.organization_id,
            name=data.name,
            status="draft",
        )
        return await self._repository.add(project)

    async def get_project(self, principal: Principal, project_id: uuid.UUID) -> Project:
        principal.require("projects.view")
        project = await self._repository.get(principal.organization_id, project_id)
        if project is None:
            raise NotFound("Project not found")
        return project
```

Optimistic concurrency: services compare the incoming `version`; a mismatch
raises `ConflictError` (surfaced as HTTP 409). Never silently overwrite (MASTER 32).

---

## 9. Router Standard (FastAPI, `/api/v1`)

* All endpoints under `/api/v1` and match the paths in MASTER section 22.
* Routers only: validate input (schema), resolve dependencies, call a service, map result.
* Use dependency injection for `Principal`, DB session, and pagination.
* List endpoints support pagination, filtering, sorting (MASTER 23).
* Declare `response_model`, status codes, and error responses explicitly.

```python
# api/v1/projects.py
import uuid
from fastapi import APIRouter, Depends, status
from app.api.deps import get_principal, get_project_service, PageParams, page_params
from app.schemas.common import Page
from app.schemas.project import ProjectCreate, ProjectRead
from app.security.principal import Principal
from app.services.project_service import ProjectService

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=Page[ProjectRead])
async def list_projects(
    principal: Principal = Depends(get_principal),
    service: ProjectService = Depends(get_project_service),
    params: PageParams = Depends(page_params),
) -> Page[ProjectRead]:
    items, total = await service.list_projects(principal, params)
    return Page(items=items, total=total, page=params.page, page_size=params.page_size)


@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
async def create_project(
    payload: ProjectCreate,
    principal: Principal = Depends(get_principal),
    service: ProjectService = Depends(get_project_service),
) -> ProjectRead:
    project = await service.create_project(principal, payload)
    return ProjectRead.model_validate(project)


@router.get("/{project_id}", response_model=ProjectRead)
async def get_project(
    project_id: uuid.UUID,
    principal: Principal = Depends(get_principal),
    service: ProjectService = Depends(get_project_service),
) -> ProjectRead:
    project = await service.get_project(principal, project_id)
    return ProjectRead.model_validate(project)
```

### Dependencies

```python
# api/deps.py
from dataclasses import dataclass
from fastapi import Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db import get_session
from app.repositories.project_repository import ProjectRepository
from app.services.project_service import ProjectService
from app.security.principal import Principal, resolve_principal


async def get_principal(...) -> Principal:
    return await resolve_principal(...)


def get_project_service(session: AsyncSession = Depends(get_session)) -> ProjectService:
    return ProjectService(ProjectRepository(session))


@dataclass
class PageParams:
    page: int
    page_size: int
    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


def page_params(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
) -> PageParams:
    return PageParams(page=page, page_size=page_size)
```

---

## 10. Error Handling Standard

* Domain exceptions in `core/exceptions.py`; a single exception handler maps them
  to the consistent structured error envelope (MASTER 23).
* Include `correlation_id` in every error response; never leak stack traces or PII.

```python
# core/exceptions.py
class DomainError(Exception):
    code: str = "domain_error"
    status_code: int = 400


class NotFound(DomainError):
    code = "not_found"
    status_code = 404


class PermissionDenied(DomainError):
    code = "permission_denied"
    status_code = 403


class ConflictError(DomainError):
    code = "conflict"
    status_code = 409
```

```json
{
  "error": {
    "code": "permission_denied",
    "message": "You do not have permission to view this project.",
    "correlationId": "..."
  }
}
```

---

## 11. Security & Permissions Standard (MASTER 11, 28)

RBAC is enforced in the backend as a standardized, layered structure:

1. **Authentication** resolves the user and their organization.
2. **Role → permission resolution** produces the caller's permission set once.
3. **Router dependency guard** provides coarse, declarative defense-in-depth.
4. **Service authorization** is the authoritative check for every domain rule.
5. **Field-level access** strips sensitive fields the caller may not read.
6. **Audit** records access to sensitive records and every write.

General rules:

* `Principal` carries user id, organization id, roles, and the resolved permission set.
* `principal.require("<permission>")` raises `PermissionDenied` when missing.
* Field-level access is applied in the service/schema layer for sensitive data
  (e.g. private feedback), never only hidden in the UI.
* Private feedback is excluded from general search and document retrieval; access is audited.
* The AI assistant runs with the **caller's** permissions and can never exceed them (MASTER 11, 39.6).

### 11.1 Single permission catalog

Permissions are defined **once** and mirror the frontend catalog and MASTER
section 11. Never scatter permission strings across the codebase.

```python
# security/permissions.py
from enum import StrEnum


class Permission(StrEnum):
    ORGANIZATION_MANAGE = "organization.manage"
    USERS_MANAGE = "users.manage"
    ROLES_MANAGE = "roles.manage"
    INTEGRATIONS_MANAGE = "integrations.manage"
    AUDIT_VIEW = "audit.view"

    PROJECTS_CREATE = "projects.create"
    PROJECTS_VIEW = "projects.view"
    PROJECTS_EDIT = "projects.edit"
    PROJECTS_ARCHIVE = "projects.archive"
    PROJECTS_CLOSE = "projects.close"

    PEOPLE_VIEW = "people.view"
    PEOPLE_EDIT = "people.edit"
    PEOPLE_SKILLS_MANAGE = "people.skills.manage"
    PEOPLE_AVAILABILITY_VIEW = "people.availability.view"
    PEOPLE_AVAILABILITY_MANAGE = "people.availability.manage"
    PEOPLE_WORKLOAD_VIEW = "people.workload.view"

    TEAM_RECOMMEND = "team.recommend"
    TEAM_ASSIGN = "team.assign"
    TEAM_REMOVE = "team.remove"
    TEAM_OVERRIDE_CAPACITY = "team.override_capacity"

    TICKETS_VIEW = "tickets.view"
    TICKETS_CREATE = "tickets.create"
    TICKETS_EDIT = "tickets.edit"
    TICKETS_ASSIGN = "tickets.assign"
    TICKETS_TRANSITION = "tickets.transition"

    FEEDBACK_CREATE = "feedback.create"
    FEEDBACK_VIEW_SHARED = "feedback.view_shared"
    FEEDBACK_VIEW_PRIVATE = "feedback.view_private"
    FEEDBACK_EDIT = "feedback.edit"
    FEEDBACK_ACKNOWLEDGE = "feedback.acknowledge"

    REPORTS_VIEW = "reports.view"
    REPORTS_GENERATE = "reports.generate"

    ASSISTANT_USE = "assistant.use"
    ASSISTANT_PROPOSE_ACTIONS = "assistant.propose_actions"
    ASSISTANT_APPROVE_ACTIONS = "assistant.approve_actions"
```

### 11.2 Principal

The `Principal` is the standardized authorization subject passed into every
service. It resolves its permission set once and exposes explicit checks.

```python
# security/principal.py
import uuid
from dataclasses import dataclass, field
from collections.abc import Iterable
from app.core.exceptions import PermissionDenied
from app.security.permissions import Permission


@dataclass(frozen=True, slots=True)
class Principal:
    user_id: uuid.UUID
    organization_id: uuid.UUID
    roles: frozenset[str]
    permissions: frozenset[Permission]
    # Project-scoped grants: project_id -> permissions valid only on that project.
    project_permissions: dict[uuid.UUID, frozenset[Permission]] = field(default_factory=dict)

    def has(self, permission: Permission) -> bool:
        return permission in self.permissions

    def require(self, permission: Permission) -> None:
        if permission not in self.permissions:
            raise PermissionDenied(f"Missing permission: {permission}")

    def require_any(self, permissions: Iterable[Permission]) -> None:
        if not any(p in self.permissions for p in permissions):
            raise PermissionDenied("Missing all of the required permissions")

    def require_all(self, permissions: Iterable[Permission]) -> None:
        missing = [p for p in permissions if p not in self.permissions]
        if missing:
            raise PermissionDenied(f"Missing permissions: {', '.join(missing)}")

    def require_on_project(self, project_id: uuid.UUID, permission: Permission) -> None:
        """Authoritative for project-scoped access (MASTER 10.3, 28)."""
        if permission in self.permissions:
            return
        if permission in self.project_permissions.get(project_id, frozenset()):
            return
        raise PermissionDenied(f"Missing project permission: {permission}")
```

### 11.3 Router dependency guard (defense in depth)

A declarative dependency provides a coarse first check at the edge. It does
**not** replace the service-level check.

```python
# api/deps.py
from collections.abc import Callable
from fastapi import Depends
from app.security.permissions import Permission
from app.security.principal import Principal


def require_permission(permission: Permission) -> Callable[[Principal], Principal]:
    def _dep(principal: Principal = Depends(get_principal)) -> Principal:
        principal.require(permission)
        return principal
    return _dep
```

```python
# api/v1/projects.py — coarse guard + authoritative service check
@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
async def create_project(
    payload: ProjectCreate,
    principal: Principal = Depends(require_permission(Permission.PROJECTS_CREATE)),
    service: ProjectService = Depends(get_project_service),
) -> ProjectRead:
    project = await service.create_project(principal, payload)  # re-checks internally
    return ProjectRead.model_validate(project)
```

### 11.4 Field-level access

Sensitive fields are stripped in the service/schema layer based on permission,
so unauthorized fields never reach the client (MASTER FR-011, 28).

```python
# services/feedback_service.py (excerpt)
def to_feedback_read(principal: Principal, feedback: Feedback) -> FeedbackRead:
    data = FeedbackRead.model_validate(feedback)
    if not principal.has(Permission.FEEDBACK_VIEW_PRIVATE):
        data = data.model_copy(update={"private_note": None})
    return data
```

### 11.5 Auditing sensitive access

Reading private feedback and every write action are recorded (MASTER 28, 39.12).
The service writes the audit entry inside the same transaction as the access.

```python
async def get_private_feedback(self, principal: Principal, feedback_id: uuid.UUID) -> Feedback:
    principal.require(Permission.FEEDBACK_VIEW_PRIVATE)
    feedback = await self._repository.get(principal.organization_id, feedback_id)
    if feedback is None:
        raise NotFound("Feedback not found")
    await self._audit.record_access(principal, resource="feedback", resource_id=feedback_id)
    return feedback
```

### 11.6 RBAC rules (must follow)

* Import every permission from `security/permissions.py`; no string literals elsewhere.
* Add the router `require_permission(...)` guard **and** the authoritative
  `principal.require(...)` in the service — never rely on the guard alone.
* Project-scoped access uses `principal.require_on_project(...)`.
* Strip unauthorized fields in the service/schema layer, not the router.
* Audit private-feedback reads and all writes within the same transaction.
* AI tools pass the caller's `Principal` unchanged; they never widen scope.

---

## 12. AI Tools Standard (MASTER 15)

* Agent tools are thin wrappers that call **services**, passing the caller's `Principal`.
* Read tools return authorized data only. Write tools produce an **AI Action Proposal**;
  they never mutate state directly (MASTER 15.5, 15.6).
* The approved payload is immutable after confirmation; expired proposals cannot execute.
* Every tool call and approved action is recorded for audit (MASTER 15.8, 28).

---

## 13. Database Migrations Standard (Alembic)

* Every model change ships an Alembic migration; migrations are reviewed (MASTER 29).
* Migrations are forward-only in shared environments; provide a tested downgrade for dev.
* Never edit an applied migration; add a new one.
* Note migration impact in the PR (MASTER 33).

---

## 14. Testing Standard (pytest)

| Layer            | Focus                                             |
| ---------------- | ------------------------------------------------- |
| Unit             | Services (business rules, scoring, capacity math) |
| Repository/DB    | Queries against a real Postgres (test container)  |
| API integration  | Endpoints via `httpx.AsyncClient`                 |
| Authorization    | Permission + org-isolation + field-level access   |
| AI tool contract | Tool schemas and permission inheritance           |

* Tests are async (`pytest.mark.asyncio` / anyio). Use a transactional session fixture.
* Cover the mandatory scenarios in MASTER section 32 (org isolation, private feedback,
  capacity override, deterministic scoring inputs, concurrency conflicts, webhook idempotency).
* Arrange–Act–Assert structure; one behavior per test.

```python
# tests/services/test_project_service.py
import pytest
from app.core.exceptions import PermissionDenied


@pytest.mark.asyncio
async def test_create_project_requires_permission(service, viewer_principal):
    with pytest.raises(PermissionDenied):
        await service.create_project(viewer_principal, valid_project_create())
```

---

## 15. Quality Gates (MASTER 33)

```text
ruff check .
ruff format --check .
mypy app
pytest
```

All four must pass before merge.

---

## 16. Definition of Done (Backend)

```text
[ ] Simplest solution that meets the requirement; no overengineering (section 0)
[ ] Layering respected: api → services → repositories → models
[ ] Router has no business logic
[ ] Service enforces permissions + domain rules
[ ] RBAC: permissions from security/permissions.py; router require_permission guard + authoritative principal.require in service; field-level access stripped in service; sensitive reads/writes audited
[ ] Every query scoped by organization_id and excludes soft-deleted rows
[ ] Pydantic Create/Update/Read separated; version used for concurrency
[ ] Errors use typed domain exceptions + structured envelope + correlation id
[ ] AI/tools go through services; no direct DB access from the AI layer
[ ] Alembic migration added and noted in PR
[ ] Tests added (unit + integration + authorization) incl. relevant MASTER §32 scenarios
[ ] ruff, ruff format, mypy, pytest all pass
```

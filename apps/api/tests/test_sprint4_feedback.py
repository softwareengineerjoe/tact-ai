"""Unit tests for Sprint 4 feedback (MASTER FR-011, §32).

Stub repositories run the privacy and lifecycle rules without a database:
permission enforcement, private-feedback visibility, private-read auditing,
org isolation, optimistic concurrency, and the acknowledge flow.
"""

import uuid
from datetime import UTC, datetime

import pytest
from app.core.enums import FeedbackStatus, FeedbackVisibility
from app.core.exceptions import ConflictError, NotFound, PermissionDenied, ValidationError
from app.models.feedback import Feedback
from app.models.project import Project
from app.schemas.feedback import FeedbackCreate, FeedbackUpdate
from app.security.permissions import Permission
from app.security.principal import Principal
from app.services.feedback_service import FeedbackService

ORG = uuid.UUID("00000000-0000-0000-0000-0000000000c1")
OTHER_ORG = uuid.UUID("00000000-0000-0000-0000-0000000000c2")


def _principal(*permissions: Permission, organization_id: uuid.UUID = ORG) -> Principal:
    return Principal(
        user_id=uuid.uuid4(),
        organization_id=organization_id,
        roles=frozenset(),
        permissions=frozenset(permissions),
    )


class StubProjectRepo:
    def __init__(self, project: Project) -> None:
        self._project = project

    async def get(self, organization_id, project_id):  # type: ignore[no-untyped-def]
        if self._project.organization_id != organization_id:
            return None
        if self._project.id != project_id:
            return None
        return self._project


class StubFeedbackRepo:
    def __init__(self, items: list[Feedback] | None = None) -> None:
        self._items = items or []
        self.revisions: list = []
        self.acknowledgements: list = []
        self.access_logs: list = []

    async def get(self, organization_id, feedback_id):  # type: ignore[no-untyped-def]
        for f in self._items:
            if (
                f.id == feedback_id
                and f.organization_id == organization_id
                and f.deleted_at is None
            ):
                return f
        return None

    async def list_for_project(  # type: ignore[no-untyped-def]
        self, organization_id, project_id, *, include_private
    ):
        rows = [
            f
            for f in self._items
            if f.organization_id == organization_id
            and f.project_id == project_id
            and f.deleted_at is None
        ]
        if not include_private:
            rows = [f for f in rows if f.visibility != FeedbackVisibility.MANAGER_ONLY]
        return rows

    async def add(self, feedback):  # type: ignore[no-untyped-def]
        self._items.append(feedback)
        return feedback

    async def add_revision(self, revision):  # type: ignore[no-untyped-def]
        self.revisions.append(revision)
        return revision

    async def add_acknowledgement(self, ack):  # type: ignore[no-untyped-def]
        self.acknowledgements.append(ack)
        return ack

    async def record_access(self, log):  # type: ignore[no-untyped-def]
        self.access_logs.append(log)

    async def soft_delete(self, feedback):  # type: ignore[no-untyped-def]
        feedback.deleted_at = datetime.now(UTC)
        feedback.version += 1


class StubAuditRepo:
    def __init__(self) -> None:
        self.entries: list = []

    async def record(self, **kwargs):  # type: ignore[no-untyped-def]
        self.entries.append(kwargs)


class StubAssignmentRepo:
    def __init__(self, *, assigned: bool = True) -> None:
        self._assigned = assigned

    async def has_project_assignment(self, organization_id, project_id, employee_id):  # type: ignore[no-untyped-def]
        return self._assigned


def _project() -> Project:
    project = Project(organization_id=ORG, name="Atlas", status="active")
    project.id = uuid.uuid4()
    return project


def _feedback(
    project_id: uuid.UUID,
    *,
    visibility: FeedbackVisibility = FeedbackVisibility.MANAGER_ONLY,
    organization_id: uuid.UUID = ORG,
) -> Feedback:
    feedback = Feedback(
        organization_id=organization_id,
        project_id=project_id,
        employee_id=uuid.uuid4(),
        author_id=uuid.uuid4(),
        category="recognition",
        visibility=visibility,
        body="Great work on the API.",
        status=FeedbackStatus.SUBMITTED,
    )
    feedback.id = uuid.uuid4()
    feedback.version = 0
    feedback.deleted_at = None
    return feedback


def _service(
    project: Project,
    feedback_repo: StubFeedbackRepo,
    *,
    assigned: bool = True,
) -> FeedbackService:
    return FeedbackService(
        feedback_repo,  # type: ignore[arg-type]
        StubProjectRepo(project),  # type: ignore[arg-type]
        StubAssignmentRepo(assigned=assigned),  # type: ignore[arg-type]
        StubAuditRepo(),  # type: ignore[arg-type]
    )


@pytest.mark.asyncio
async def test_create_requires_permission() -> None:
    project = _project()
    service = _service(project, StubFeedbackRepo())
    principal = _principal(Permission.FEEDBACK_VIEW_SHARED)
    with pytest.raises(PermissionDenied):
        await service.create(
            principal,
            project.id,
            FeedbackCreate(employee_id=uuid.uuid4(), body="Nice job"),
        )


@pytest.mark.asyncio
async def test_create_records_initial_revision() -> None:
    project = _project()
    repo = StubFeedbackRepo()
    service = _service(project, repo)
    principal = _principal(Permission.FEEDBACK_CREATE)
    created = await service.create(
        principal,
        project.id,
        FeedbackCreate(employee_id=uuid.uuid4(), body="Nice job"),
    )
    assert created.status == FeedbackStatus.SUBMITTED
    assert len(repo.revisions) == 1


@pytest.mark.asyncio
async def test_create_requires_project_assignment() -> None:
    project = _project()
    service = _service(project, StubFeedbackRepo(), assigned=False)
    principal = _principal(Permission.FEEDBACK_CREATE)
    with pytest.raises(ValidationError):
        await service.create(
            principal,
            project.id,
            FeedbackCreate(employee_id=uuid.uuid4(), body="Nice job"),
        )


@pytest.mark.asyncio
async def test_private_feedback_hidden_without_view_private() -> None:
    project = _project()
    private = _feedback(project.id, visibility=FeedbackVisibility.MANAGER_ONLY)
    shared = _feedback(project.id, visibility=FeedbackVisibility.MANAGER_AND_EMPLOYEE)
    service = _service(project, StubFeedbackRepo([private, shared]))
    principal = _principal(Permission.FEEDBACK_VIEW_SHARED)
    rows = await service.list_for_project(principal, project.id)
    assert private not in rows
    assert shared in rows


@pytest.mark.asyncio
async def test_private_read_is_audited() -> None:
    project = _project()
    private = _feedback(project.id, visibility=FeedbackVisibility.MANAGER_ONLY)
    repo = StubFeedbackRepo([private])
    service = _service(project, repo)
    principal = _principal(Permission.FEEDBACK_VIEW_SHARED, Permission.FEEDBACK_VIEW_PRIVATE)
    await service.get(principal, private.id)
    assert len(repo.access_logs) == 1
    assert repo.access_logs[0].feedback_id == private.id


@pytest.mark.asyncio
async def test_get_private_without_permission_denied() -> None:
    project = _project()
    private = _feedback(project.id, visibility=FeedbackVisibility.MANAGER_ONLY)
    service = _service(project, StubFeedbackRepo([private]))
    principal = _principal(Permission.FEEDBACK_VIEW_SHARED)
    with pytest.raises(PermissionDenied):
        await service.get(principal, private.id)


@pytest.mark.asyncio
async def test_org_isolation_hides_other_org_feedback() -> None:
    project = _project()
    foreign = _feedback(
        project.id,
        visibility=FeedbackVisibility.MANAGER_AND_EMPLOYEE,
        organization_id=OTHER_ORG,
    )
    service = _service(project, StubFeedbackRepo([foreign]))
    principal = _principal(Permission.FEEDBACK_VIEW_SHARED)
    with pytest.raises(NotFound):
        await service.get(principal, foreign.id)


@pytest.mark.asyncio
async def test_update_version_conflict() -> None:
    project = _project()
    shared = _feedback(project.id, visibility=FeedbackVisibility.MANAGER_AND_EMPLOYEE)
    service = _service(project, StubFeedbackRepo([shared]))
    principal = _principal(Permission.FEEDBACK_EDIT)
    with pytest.raises(ConflictError):
        await service.update(principal, shared.id, FeedbackUpdate(body="x", version=99))


@pytest.mark.asyncio
async def test_update_new_body_records_revision() -> None:
    project = _project()
    shared = _feedback(project.id, visibility=FeedbackVisibility.MANAGER_AND_EMPLOYEE)
    repo = StubFeedbackRepo([shared])
    service = _service(project, repo)
    principal = _principal(Permission.FEEDBACK_EDIT)
    updated = await service.update(
        principal, shared.id, FeedbackUpdate(body="Revised note", version=0)
    )
    assert updated.body == "Revised note"
    assert updated.version == 1
    assert len(repo.revisions) == 1


@pytest.mark.asyncio
async def test_acknowledge_shared_feedback() -> None:
    project = _project()
    shared = _feedback(project.id, visibility=FeedbackVisibility.MANAGER_AND_EMPLOYEE)
    repo = StubFeedbackRepo([shared])
    service = _service(project, repo)
    principal = _principal(Permission.FEEDBACK_ACKNOWLEDGE)
    updated = await service.acknowledge(principal, shared.id)
    assert updated.status == FeedbackStatus.ACKNOWLEDGED
    assert len(repo.acknowledgements) == 1


@pytest.mark.asyncio
async def test_acknowledge_private_feedback_denied() -> None:
    project = _project()
    private = _feedback(project.id, visibility=FeedbackVisibility.MANAGER_ONLY)
    service = _service(project, StubFeedbackRepo([private]))
    principal = _principal(Permission.FEEDBACK_ACKNOWLEDGE)
    with pytest.raises(PermissionDenied):
        await service.acknowledge(principal, private.id)


@pytest.mark.asyncio
async def test_create_is_audited() -> None:
    project = _project()
    repo = StubFeedbackRepo()
    audit = StubAuditRepo()
    service = FeedbackService(
        repo,
        StubProjectRepo(project),
        StubAssignmentRepo(),
        audit,
    )  # type: ignore[arg-type]
    principal = _principal(Permission.FEEDBACK_CREATE)
    await service.create(
        principal,
        project.id,
        FeedbackCreate(employee_id=uuid.uuid4(), body="Nice job"),
    )
    assert any(e["action"] == "feedback.create" for e in audit.entries)


@pytest.mark.asyncio
async def test_delete_requires_permission() -> None:
    project = _project()
    item = _feedback(project.id, visibility=FeedbackVisibility.MANAGER_AND_EMPLOYEE)
    service = _service(project, StubFeedbackRepo([item]))
    principal = _principal(Permission.FEEDBACK_VIEW_SHARED)
    with pytest.raises(PermissionDenied):
        await service.delete(principal, item.id, version=item.version)


@pytest.mark.asyncio
async def test_delete_soft_deletes_and_audits() -> None:
    project = _project()
    item = _feedback(project.id, visibility=FeedbackVisibility.MANAGER_AND_EMPLOYEE)
    repo = StubFeedbackRepo([item])
    audit = StubAuditRepo()
    service = FeedbackService(
        repo,
        StubProjectRepo(project),
        StubAssignmentRepo(),
        audit,
    )  # type: ignore[arg-type]
    principal = _principal(Permission.FEEDBACK_EDIT)
    await service.delete(principal, item.id, version=item.version)
    assert item.deleted_at is not None
    assert any(e["action"] == "feedback.delete" for e in audit.entries)


@pytest.mark.asyncio
async def test_delete_version_conflict() -> None:
    project = _project()
    item = _feedback(project.id, visibility=FeedbackVisibility.MANAGER_AND_EMPLOYEE)
    service = _service(project, StubFeedbackRepo([item]))
    principal = _principal(Permission.FEEDBACK_EDIT)
    with pytest.raises(ConflictError):
        await service.delete(principal, item.id, version=item.version + 5)


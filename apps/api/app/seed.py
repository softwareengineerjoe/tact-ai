"""Synthetic seed data for local development and the demo (MASTER 28, 30 Phase 0).

Idempotent: safe to run repeatedly. Uses the fixed demo organization id so the
seeded data lines up with the demo principal in ``app.api.deps``.

Run:  python -m app.seed
"""

import asyncio
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import DEMO_ORGANIZATION_ID, DEMO_USER_ID
from app.core.db import async_session_factory
from app.core.enums import (
    AssignmentStatus,
    FeedbackCategory,
    FeedbackStatus,
    FeedbackVisibility,
    NotificationType,
    TicketPriority,
    TicketStatus,
    TicketType,
)
from app.models.employee import (
    Employee,
    EmployeeAvailability,
    EmployeeSkill,
    Skill,
)
from app.models.feedback import Feedback
from app.models.notification import Notification
from app.models.organization import Organization
from app.models.project import (
    Project,
    ProjectAssignment,
    ProjectRoleRequirement,
    RoleRequirementSkill,
)
from app.models.ticket import Ticket

_SKILLS = [
    ("Python", "Backend"),
    ("FastAPI", "Backend"),
    ("PostgreSQL", "Data"),
    ("React", "Frontend"),
    ("TypeScript", "Frontend"),
    ("Playwright", "Testing"),
    ("Figma", "Design"),
    ("Azure", "Cloud"),
]

_EMPLOYEES = [
    (
        "EMP-1001",
        "Maria Santos",
        "maria.santos@example.com",
        "Senior Backend Engineer",
        "Engineering",
        "UTC+8",
    ),
    (
        "EMP-1002",
        "Daniel Cruz",
        "daniel.cruz@example.com",
        "Backend Engineer",
        "Engineering",
        "UTC+8",
    ),
    (
        "EMP-1003",
        "Alex Reyes",
        "alex.reyes@example.com",
        "Full-stack Engineer",
        "Engineering",
        "UTC+0",
    ),
    (
        "EMP-1004",
        "Priya Nair",
        "priya.nair@example.com",
        "Frontend Engineer",
        "Engineering",
        "UTC+5",
    ),
    ("EMP-1005", "Liam O'Brien", "liam.obrien@example.com", "QA Engineer", "Quality", "UTC+1"),
    ("EMP-1006", "Sofia Rossi", "sofia.rossi@example.com", "Product Designer", "Design", "UTC+2"),
]

# Who reports to whom (employee_code -> supervisor employee_code). Maria leads
# engineering; the QA and design leads sit under her for the demo org.
_SUPERVISORS = {
    "EMP-1002": "EMP-1001",
    "EMP-1003": "EMP-1001",
    "EMP-1004": "EMP-1001",
    "EMP-1005": "EMP-1001",
    "EMP-1006": "EMP-1001",
}


async def seed() -> None:
    async with async_session_factory() as session:
        org = await session.scalar(
            select(Organization).where(Organization.id == DEMO_ORGANIZATION_ID)
        )
        if org is None:
            org = Organization(id=DEMO_ORGANIZATION_ID, name="Demo Organization", slug="demo")
            session.add(org)
            await session.flush()

        # Skills
        skills_by_name: dict[str, Skill] = {}
        for name, category in _SKILLS:
            existing = await session.scalar(
                select(Skill).where(Skill.organization_id == org.id, Skill.name == name)
            )
            if existing is None:
                existing = Skill(organization_id=org.id, name=name, category=category)
                session.add(existing)
                await session.flush()
            skills_by_name[name] = existing

        # Employees + a couple of skills each
        employee_skill_map = {
            "EMP-1001": [("Python", "expert"), ("FastAPI", "advanced"), ("PostgreSQL", "advanced")],
            "EMP-1002": [("Python", "advanced"), ("PostgreSQL", "intermediate")],
            "EMP-1003": [
                ("Python", "intermediate"),
                ("React", "advanced"),
                ("TypeScript", "advanced"),
            ],
            "EMP-1004": [("React", "expert"), ("TypeScript", "expert")],
            "EMP-1005": [("Playwright", "advanced"), ("TypeScript", "intermediate")],
            "EMP-1006": [("Figma", "expert")],
        }
        for code, name, email, title, dept, tz in _EMPLOYEES:
            employee = await session.scalar(
                select(Employee).where(
                    Employee.organization_id == org.id,
                    Employee.employee_code == code,
                )
            )
            if employee is None:
                employee = Employee(
                    organization_id=org.id,
                    employee_code=code,
                    display_name=name,
                    email=email,
                    job_title=title,
                    department=dept,
                    primary_role=title,
                    time_zone=tz,
                )
                session.add(employee)
                await session.flush()
                for skill_name, level in employee_skill_map.get(code, []):
                    session.add(
                        EmployeeSkill(
                            organization_id=org.id,
                            employee_id=employee.id,
                            skill_id=skills_by_name[skill_name].id,
                            proficiency_level=level,
                        )
                    )

        await session.flush()

        # Supervisor links (idempotent): set only when currently unset.
        employees_by_code: dict[str, Employee] = {
            e.employee_code: e
            for e in await session.scalars(
                select(Employee).where(Employee.organization_id == org.id)
            )
        }
        for code, supervisor_code in _SUPERVISORS.items():
            report = employees_by_code.get(code)
            supervisor = employees_by_code.get(supervisor_code)
            if report is not None and supervisor is not None and report.supervisor_id is None:
                report.supervisor_id = supervisor.id

        # A sample project with role requirements
        project = await session.scalar(
            select(Project).where(
                Project.organization_id == org.id, Project.name == "Project Atlas"
            )
        )
        if project is None:
            project = Project(
                organization_id=org.id,
                name="Project Atlas",
                description="Internal platform modernization initiative.",
                business_objective="Consolidate staffing and delivery tooling.",
                priority="high",
                status="staffing",
                start_date=datetime(2026, 10, 1, tzinfo=UTC),
                target_end_date=datetime(2026, 12, 31, tzinfo=UTC),
            )
            session.add(project)
            await session.flush()
            session.add_all(
                [
                    ProjectRoleRequirement(
                        organization_id=org.id,
                        project_id=project.id,
                        role_name="Backend Developer",
                        headcount=2,
                        allocation_percent=100,
                    ),
                    ProjectRoleRequirement(
                        organization_id=org.id,
                        project_id=project.id,
                        role_name="Frontend Developer",
                        headcount=1,
                        allocation_percent=100,
                    ),
                ]
            )
            await session.flush()

        # Ensure the demo project has a duration (idempotent) so the Team
        # Builder can compute capacity for the project period.
        if project.start_date is None:
            project.start_date = datetime(2026, 10, 1, tzinfo=UTC)
        if project.target_end_date is None:
            project.target_end_date = datetime(2026, 12, 31, tzinfo=UTC)

        # Availability so employees have computable capacity (idempotent).
        # Unknown availability is never treated as available (MASTER FR-006),
        # so the demo needs explicit records to surface recommendations.
        # Availability so employees have computable capacity (idempotent).
        # Unknown availability is never treated as available (MASTER FR-006),
        # so the demo needs explicit records to surface recommendations.
        # The window spans the active project period and "today" so the
        # dashboard's current-capacity view is accurate. Base capacities are
        # >= each employee's seeded active allocation so the demo team is not
        # spuriously overallocated.
        period_start = datetime(2026, 8, 1, tzinfo=UTC)
        period_end = datetime(2027, 3, 31, tzinfo=UTC)
        availability_by_code = {
            "EMP-1001": 100,
            "EMP-1002": 100,
            "EMP-1003": 30,
            "EMP-1004": 100,
            "EMP-1005": 80,
            "EMP-1006": 50,
        }
        for code, base in availability_by_code.items():
            employee = await session.scalar(
                select(Employee).where(
                    Employee.organization_id == org.id,
                    Employee.employee_code == code,
                )
            )
            if employee is None:
                continue
            existing_avail = await session.scalar(
                select(EmployeeAvailability).where(
                    EmployeeAvailability.organization_id == org.id,
                    EmployeeAvailability.employee_id == employee.id,
                )
            )
            if existing_avail is None:
                session.add(
                    EmployeeAvailability(
                        organization_id=org.id,
                        employee_id=employee.id,
                        period_start=period_start,
                        period_end=period_end,
                        status="available",
                        base_capacity_percent=base,
                        data_source="seed",
                    )
                )
            elif existing_avail.data_source == "seed":
                # Self-heal seed records so re-running fixes stale windows/bases.
                existing_avail.period_start = period_start
                existing_avail.period_end = period_end
                existing_avail.base_capacity_percent = base

        # Required/preferred skills on the Backend Developer role (idempotent).
        backend_reqs = list(
            await session.scalars(
                select(ProjectRoleRequirement).where(
                    ProjectRoleRequirement.organization_id == org.id,
                    ProjectRoleRequirement.project_id == project.id,
                    ProjectRoleRequirement.role_name == "Backend Developer",
                )
            )
        )
        for requirement in backend_reqs:
            has_skills = await session.scalar(
                select(RoleRequirementSkill).where(
                    RoleRequirementSkill.requirement_id == requirement.id
                )
            )
            if has_skills is None:
                session.add_all(
                    [
                        RoleRequirementSkill(
                            organization_id=org.id,
                            requirement_id=requirement.id,
                            skill_id=skills_by_name["Python"].id,
                            is_preferred=False,
                        ),
                        RoleRequirementSkill(
                            organization_id=org.id,
                            requirement_id=requirement.id,
                            skill_id=skills_by_name["FastAPI"].id,
                            is_preferred=False,
                        ),
                        RoleRequirementSkill(
                            organization_id=org.id,
                            requirement_id=requirement.id,
                            skill_id=skills_by_name["PostgreSQL"].id,
                            is_preferred=True,
                        ),
                    ]
                )

        await _seed_active_project(session, org, employees_by_code)

        await _seed_notifications(session, org)

        await session.commit()
    print("Seed complete.")


async def _seed_active_project(
    session: AsyncSession,
    org: Organization,
    employees_by_code: dict[str, Employee],
) -> None:
    """Seed an active project with a confirmed team, tickets, and feedback.

    Idempotent: guarded by the project name. Gives the dashboard and assistant
    realistic active data (blocked/overdue tickets, shared + private feedback)
    beyond the draft/staffing demo projects.
    """
    existing = await session.scalar(
        select(Project).where(Project.organization_id == org.id, Project.name == "Project Helios")
    )
    if existing is not None:
        return

    maria = employees_by_code["EMP-1001"]
    daniel = employees_by_code["EMP-1002"]
    priya = employees_by_code["EMP-1004"]
    liam = employees_by_code["EMP-1005"]

    start = datetime(2026, 8, 1, tzinfo=UTC)
    end = datetime(2026, 11, 30, tzinfo=UTC)

    project = Project(
        organization_id=org.id,
        name="Project Helios",
        description="Customer analytics platform delivery.",
        business_objective="Ship the analytics dashboard for the Q4 launch.",
        priority="high",
        status="active",
        manager_id=maria.id,
        start_date=start,
        target_end_date=end,
        expected_team_size=3,
    )
    session.add(project)
    await session.flush()

    backend_role = ProjectRoleRequirement(
        organization_id=org.id,
        project_id=project.id,
        role_name="Backend Developer",
        headcount=1,
        allocation_percent=100,
    )
    frontend_role = ProjectRoleRequirement(
        organization_id=org.id,
        project_id=project.id,
        role_name="Frontend Developer",
        headcount=1,
        allocation_percent=100,
    )
    qa_role = ProjectRoleRequirement(
        organization_id=org.id,
        project_id=project.id,
        role_name="QA Engineer",
        headcount=1,
        allocation_percent=50,
    )
    session.add_all([backend_role, frontend_role, qa_role])
    await session.flush()

    session.add_all(
        [
            ProjectAssignment(
                organization_id=org.id,
                project_id=project.id,
                role_requirement_id=backend_role.id,
                employee_id=daniel.id,
                status=AssignmentStatus.ACTIVE,
                allocation_percent=100,
                start_date=start,
                end_date=end,
            ),
            ProjectAssignment(
                organization_id=org.id,
                project_id=project.id,
                role_requirement_id=frontend_role.id,
                employee_id=priya.id,
                status=AssignmentStatus.ACTIVE,
                allocation_percent=100,
                start_date=start,
                end_date=end,
            ),
            ProjectAssignment(
                organization_id=org.id,
                project_id=project.id,
                role_requirement_id=qa_role.id,
                employee_id=liam.id,
                status=AssignmentStatus.ACTIVE,
                allocation_percent=50,
                start_date=start,
                end_date=end,
            ),
        ]
    )

    session.add_all(
        [
            Ticket(
                organization_id=org.id,
                project_id=project.id,
                title="Design analytics data model",
                description="Define schema for the analytics warehouse.",
                ticket_type=TicketType.USER_STORY,
                status=TicketStatus.DONE,
                priority=TicketPriority.HIGH,
                assignee_id=daniel.id,
                story_points=5,
                due_date=datetime(2026, 8, 20, tzinfo=UTC),
            ),
            Ticket(
                organization_id=org.id,
                project_id=project.id,
                title="Build ingestion API",
                description="Implement the ingestion endpoints.",
                ticket_type=TicketType.TASK,
                status=TicketStatus.IN_PROGRESS,
                priority=TicketPriority.HIGH,
                assignee_id=daniel.id,
                story_points=8,
                due_date=datetime(2026, 9, 1, tzinfo=UTC),  # overdue
            ),
            Ticket(
                organization_id=org.id,
                project_id=project.id,
                title="Dashboard charts",
                description="Render the analytics charts in the UI.",
                ticket_type=TicketType.USER_STORY,
                status=TicketStatus.BLOCKED,
                priority=TicketPriority.CRITICAL,
                assignee_id=priya.id,
                story_points=8,
                due_date=datetime(2026, 10, 15, tzinfo=UTC),
                blocker_reason="Waiting on the ingestion API to expose metrics.",
            ),
            Ticket(
                organization_id=org.id,
                project_id=project.id,
                title="End-to-end test suite",
                description="Add Playwright coverage for the dashboard.",
                ticket_type=TicketType.TASK,
                status=TicketStatus.READY,
                priority=TicketPriority.MEDIUM,
                assignee_id=liam.id,
                story_points=5,
                due_date=datetime(2026, 11, 1, tzinfo=UTC),
            ),
        ]
    )

    session.add_all(
        [
            Feedback(
                organization_id=org.id,
                project_id=project.id,
                employee_id=daniel.id,
                author_id=DEMO_USER_ID,
                category=FeedbackCategory.RECOGNITION,
                visibility=FeedbackVisibility.MANAGER_AND_EMPLOYEE,
                body="Great work landing the data model ahead of schedule.",
                status=FeedbackStatus.SHARED,
            ),
            Feedback(
                organization_id=org.id,
                project_id=project.id,
                employee_id=priya.id,
                author_id=DEMO_USER_ID,
                category=FeedbackCategory.COACHING,
                visibility=FeedbackVisibility.MANAGER_ONLY,
                body="Follow up on unblocking the charts work early next week.",
                status=FeedbackStatus.SUBMITTED,
            ),
        ]
    )


async def _seed_notifications(session: AsyncSession, org: Organization) -> None:
    """Seed a few in-app notifications for the demo user (MASTER FR-018)."""
    existing = await session.scalar(
        select(Notification).where(Notification.recipient_id == DEMO_USER_ID)
    )
    if existing is not None:
        return

    session.add_all(
        [
            Notification(
                organization_id=org.id,
                recipient_id=DEMO_USER_ID,
                type=NotificationType.ROLE_UNFILLED,
                title="A project role is still unfilled",
                body="The QA Engineer role on Project Helios has no confirmed member.",
                link="/projects",
                is_read=False,
            ),
            Notification(
                organization_id=org.id,
                recipient_id=DEMO_USER_ID,
                type=NotificationType.TICKET_BLOCKED,
                title="A ticket is blocked",
                body='"Wire up charts" is blocked and needs attention.',
                link="/tickets",
                is_read=False,
            ),
            Notification(
                organization_id=org.id,
                recipient_id=DEMO_USER_ID,
                type=NotificationType.ASSIGNMENT_CONFIRMED,
                title="Assignment confirmed",
                body="Maria Santos was confirmed for the Backend Developer role.",
                link="/projects",
                is_read=True,
                read_at=datetime.now(UTC),
            ),
        ]
    )


if __name__ == "__main__":
    asyncio.run(seed())

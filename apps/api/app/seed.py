"""Synthetic seed data for local development and the demo (MASTER 28, 30 Phase 0).

Idempotent: safe to run repeatedly. Uses the fixed demo organization id so the
seeded data lines up with the demo principal in ``app.api.deps``.

Run:  python -m app.seed
"""

import asyncio
from datetime import UTC, datetime

from sqlalchemy import select

from app.api.deps import DEMO_ORGANIZATION_ID
from app.core.db import async_session_factory
from app.models.employee import (
    Employee,
    EmployeeAvailability,
    EmployeeSkill,
    Skill,
)
from app.models.organization import Organization
from app.models.project import (
    Project,
    ProjectRoleRequirement,
    RoleRequirementSkill,
)

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

        # Availability so employees have computable capacity (idempotent).
        # Unknown availability is never treated as available (MASTER FR-006),
        # so the demo needs explicit records to surface recommendations.
        period_start = datetime(2026, 10, 1, tzinfo=UTC)
        period_end = datetime(2026, 12, 31, tzinfo=UTC)
        availability_by_code = {
            "EMP-1001": 100,
            "EMP-1002": 60,
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

        await session.commit()
    print("Seed complete.")


if __name__ == "__main__":
    asyncio.run(seed())

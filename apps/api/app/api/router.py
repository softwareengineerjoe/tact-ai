"""Aggregates all v1 routers under /api/v1."""

from fastapi import APIRouter

from app.api.v1 import (
    assistant,
    dashboard,
    feedback,
    imports,
    me,
    notifications,
    people,
    project_requirements,
    projects,
    team,
    tickets,
)

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(me.router)
api_router.include_router(projects.router)
api_router.include_router(project_requirements.router)
api_router.include_router(people.router)
api_router.include_router(team.router)
api_router.include_router(tickets.router)
api_router.include_router(feedback.router)
api_router.include_router(assistant.router)
api_router.include_router(dashboard.router)
api_router.include_router(notifications.router)
api_router.include_router(imports.router)

"""Typed domain exceptions mapped to the structured error envelope (MASTER 23)."""


class DomainError(Exception):
    """Base class for all business/domain errors."""

    code: str = "domain_error"
    status_code: int = 400

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


class NotFound(DomainError):
    code = "not_found"
    status_code = 404


class PermissionDenied(DomainError):
    code = "permission_denied"
    status_code = 403


class ConflictError(DomainError):
    code = "conflict"
    status_code = 409


class ValidationError(DomainError):
    code = "validation_error"
    status_code = 422

import secrets
from datetime import datetime, timezone

from app.models import Project, User
from app.repository import ProjectRepository, SessionRepository, UserRepository


class AuthService:
    def __init__(self, users: UserRepository, sessions: SessionRepository) -> None:
        self.users = users
        self.sessions = sessions

    def register(self, username: str, password: str) -> bool:
        return self.users.create(User(username=username, password=password))

    def login(self, username: str, password: str) -> str | None:
        user = self.users.get_by_username(username)
        if user is None or user.password != password:
            return None

        token = secrets.token_urlsafe(24)
        self.sessions.create(token, username)
        return token

    def me(self, token: str | None) -> str | None:
        if token is None:
            return None
        return self.sessions.get_username(token)

    def logout(self, token: str | None) -> None:
        if token is None:
            return
        self.sessions.delete(token)


class ProjectService:
    def __init__(self, repository: ProjectRepository) -> None:
        self.repository = repository

    def create(self, name: str, description: str, owner_username: str) -> Project:
        created_at = datetime.now(timezone.utc).isoformat()
        return self.repository.create(name=name, description=description, owner_username=owner_username, created_at=created_at)

    def list_for_user(self, owner_username: str) -> list[Project]:
        return self.repository.list_by_owner(owner_username)

    def get_for_user(self, project_id: int, owner_username: str) -> Project | None:
        project = self.repository.get_by_id(project_id)
        if project is None or project.owner_username != owner_username:
            return None
        return project

    def delete_for_user(self, project_id: int, owner_username: str) -> bool:
        project = self.repository.get_by_id(project_id)
        if project is None or project.owner_username != owner_username:
            return False
        return self.repository.delete(project_id)

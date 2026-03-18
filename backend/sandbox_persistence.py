import secrets
from dataclasses import dataclass
from datetime import datetime, timezone


@dataclass(frozen=True)
class User:
    username: str
    password: str


@dataclass(frozen=True)
class Project:
    id: int
    name: str
    description: str
    owner_username: str
    created_at: str


class InMemoryUserRepository:
    def __init__(self) -> None:
        self._users: dict[str, User] = {}

    def create(self, username: str, password: str) -> bool:
        if username in self._users:
            return False
        self._users[username] = User(username=username, password=password)
        return True

    def get(self, username: str) -> User | None:
        return self._users.get(username)


class InMemorySessionRepository:
    def __init__(self) -> None:
        self._sessions: dict[str, str] = {}

    def create(self, username: str) -> str:
        token = secrets.token_urlsafe(24)
        self._sessions[token] = username
        return token

    def get_username(self, token: str | None) -> str | None:
        if token is None:
            return None
        return self._sessions.get(token)

    def delete(self, token: str | None) -> None:
        if token is None:
            return
        self._sessions.pop(token, None)


class InMemoryProjectRepository:
    def __init__(self) -> None:
        self._projects: dict[int, Project] = {}
        self._next_id = 1

    def create(self, name: str, description: str, owner_username: str) -> Project:
        project = Project(
            id=self._next_id,
            name=name,
            description=description,
            owner_username=owner_username,
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        self._projects[self._next_id] = project
        self._next_id += 1
        return project

    def list_by_owner(self, owner_username: str) -> list[Project]:
        return [project for project in self._projects.values() if project.owner_username == owner_username]

    def get(self, project_id: int) -> Project | None:
        return self._projects.get(project_id)

    def delete(self, project_id: int) -> bool:
        return self._projects.pop(project_id, None) is not None


class AuthService:
    def __init__(self, users: InMemoryUserRepository, sessions: InMemorySessionRepository) -> None:
        self.users = users
        self.sessions = sessions

    def register(self, username: str, password: str) -> bool:
        return self.users.create(username, password)

    def login(self, username: str, password: str) -> str | None:
        user = self.users.get(username)
        if user is None or user.password != password:
            return None
        return self.sessions.create(username)

    def me(self, token: str | None) -> str | None:
        return self.sessions.get_username(token)

    def logout(self, token: str | None) -> None:
        self.sessions.delete(token)


class ProjectService:
    def __init__(self, projects: InMemoryProjectRepository) -> None:
        self.projects = projects

    def create(self, name: str, description: str, owner_username: str) -> Project:
        return self.projects.create(name=name, description=description, owner_username=owner_username)

    def list_for_user(self, owner_username: str) -> list[Project]:
        return self.projects.list_by_owner(owner_username)

    def get_for_user(self, project_id: int, owner_username: str) -> Project | None:
        project = self.projects.get(project_id)
        if project is None or project.owner_username != owner_username:
            return None
        return project

    def delete_for_user(self, project_id: int, owner_username: str) -> bool:
        project = self.projects.get(project_id)
        if project is None or project.owner_username != owner_username:
            return False
        return self.projects.delete(project_id)

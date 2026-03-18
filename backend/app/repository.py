from app.models import Project, User


class UserRepository:
    def create(self, user: User) -> bool:
        raise NotImplementedError

    def get_by_username(self, username: str) -> User | None:
        raise NotImplementedError


class SessionRepository:
    def create(self, token: str, username: str) -> None:
        raise NotImplementedError

    def get_username(self, token: str) -> str | None:
        raise NotImplementedError

    def delete(self, token: str) -> None:
        raise NotImplementedError


class ProjectRepository:
    def create(self, name: str, description: str, owner_username: str, created_at: str) -> Project:
        raise NotImplementedError

    def list_by_owner(self, owner_username: str) -> list[Project]:
        raise NotImplementedError

    def get_by_id(self, project_id: int) -> Project | None:
        raise NotImplementedError

    def delete(self, project_id: int) -> bool:
        raise NotImplementedError


class InMemoryUserRepository(UserRepository):
    def __init__(self) -> None:
        self._users: dict[str, User] = {}

    def create(self, user: User) -> bool:
        if user.username in self._users:
            return False
        self._users[user.username] = user
        return True

    def get_by_username(self, username: str) -> User | None:
        return self._users.get(username)


class InMemorySessionRepository(SessionRepository):
    def __init__(self) -> None:
        self._sessions: dict[str, str] = {}

    def create(self, token: str, username: str) -> None:
        self._sessions[token] = username

    def get_username(self, token: str) -> str | None:
        return self._sessions.get(token)

    def delete(self, token: str) -> None:
        self._sessions.pop(token, None)


class InMemoryProjectRepository(ProjectRepository):
    def __init__(self) -> None:
        self._projects: dict[int, Project] = {}
        self._next_id = 1

    def create(self, name: str, description: str, owner_username: str, created_at: str) -> Project:
        project = Project(
            id=self._next_id,
            name=name,
            description=description,
            owner_username=owner_username,
            created_at=created_at,
        )
        self._projects[self._next_id] = project
        self._next_id += 1
        return project

    def list_by_owner(self, owner_username: str) -> list[Project]:
        return [p for p in self._projects.values() if p.owner_username == owner_username]

    def get_by_id(self, project_id: int) -> Project | None:
        return self._projects.get(project_id)

    def delete(self, project_id: int) -> bool:
        return self._projects.pop(project_id, None) is not None

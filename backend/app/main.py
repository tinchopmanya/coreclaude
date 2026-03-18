from fastapi import Cookie, FastAPI, HTTPException, Response
from pydantic import BaseModel

from app.repository import InMemoryProjectRepository, InMemorySessionRepository, InMemoryUserRepository
from app.service import AuthService, ProjectService

app = FastAPI(title="Backend API")


class AuthPayload(BaseModel):
    username: str
    password: str


class ProjectPayload(BaseModel):
    name: str
    description: str


auth_service = AuthService(InMemoryUserRepository(), InMemorySessionRepository())
project_service = ProjectService(InMemoryProjectRepository())


def current_user_or_401(session_token: str | None) -> str:
    username = auth_service.me(session_token)
    if username is None:
        raise HTTPException(status_code=401, detail="unauthorized")
    return username


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/auth/register")
def register(payload: AuthPayload) -> dict[str, str]:
    created = auth_service.register(payload.username, payload.password)
    if not created:
        raise HTTPException(status_code=409, detail="user exists")
    return {"status": "registered"}


@app.post("/auth/login")
def login(payload: AuthPayload, response: Response) -> dict[str, str]:
    token = auth_service.login(payload.username, payload.password)
    if token is None:
        raise HTTPException(status_code=401, detail="invalid credentials")

    response.set_cookie("session_token", token, httponly=True, samesite="lax")
    return {"status": "logged_in"}


@app.get("/auth/me")
def me(session_token: str | None = Cookie(default=None)) -> dict[str, str]:
    return {"username": current_user_or_401(session_token)}


@app.post("/auth/logout")
def logout(response: Response, session_token: str | None = Cookie(default=None)) -> dict[str, str]:
    auth_service.logout(session_token)
    response.delete_cookie("session_token")
    return {"status": "logged_out"}


@app.post("/projects")
def create_project(payload: ProjectPayload, session_token: str | None = Cookie(default=None)) -> dict:
    username = current_user_or_401(session_token)
    project = project_service.create(payload.name, payload.description, username)
    return project.__dict__


@app.get("/projects")
def list_projects(session_token: str | None = Cookie(default=None)) -> list[dict]:
    username = current_user_or_401(session_token)
    return [project.__dict__ for project in project_service.list_for_user(username)]


@app.get("/projects/{project_id}")
def get_project(project_id: int, session_token: str | None = Cookie(default=None)) -> dict:
    username = current_user_or_401(session_token)
    project = project_service.get_for_user(project_id, username)
    if project is None:
        raise HTTPException(status_code=404, detail="project not found")
    return project.__dict__


@app.delete("/projects/{project_id}")
def delete_project(project_id: int, session_token: str | None = Cookie(default=None)) -> dict[str, str]:
    username = current_user_or_401(session_token)
    deleted = project_service.delete_for_user(project_id, username)
    if not deleted:
        raise HTTPException(status_code=404, detail="project not found")
    return {"status": "deleted"}

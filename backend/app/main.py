from fastapi import Cookie, FastAPI, HTTPException, Request, Response
from fastapi.responses import JSONResponse
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


def ok(data: dict | list) -> dict:
    return {"data": data, "error": None}


def api_error(status_code: int, code: str, message: str) -> HTTPException:
    return HTTPException(status_code=status_code, detail={"code": code, "message": message})


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException) -> JSONResponse:
    detail = exc.detail if isinstance(exc.detail, dict) else {"code": "http_error", "message": str(exc.detail)}
    return JSONResponse(status_code=exc.status_code, content={"data": None, "error": detail})


auth_service = AuthService(InMemoryUserRepository(), InMemorySessionRepository())
project_service = ProjectService(InMemoryProjectRepository())


def current_user_or_401(session_token: str | None) -> str:
    username = auth_service.me(session_token)
    if username is None:
        raise api_error(401, "unauthorized", "Authentication required")
    return username


@app.get("/health")
def health() -> dict:
    return ok({"status": "ok"})


@app.post("/auth/register")
def register(payload: AuthPayload) -> dict:
    created = auth_service.register(payload.username, payload.password)
    if not created:
        raise api_error(409, "user_exists", "User already exists")
    return ok({"status": "registered"})


@app.post("/auth/login")
def login(payload: AuthPayload, response: Response) -> dict:
    token = auth_service.login(payload.username, payload.password)
    if token is None:
        raise api_error(401, "invalid_credentials", "Invalid credentials")

    response.set_cookie("session_token", token, httponly=True, samesite="lax")
    return ok({"status": "logged_in"})


@app.get("/auth/me")
def me(session_token: str | None = Cookie(default=None)) -> dict:
    return ok({"username": current_user_or_401(session_token)})


@app.post("/auth/logout")
def logout(response: Response, session_token: str | None = Cookie(default=None)) -> dict:
    auth_service.logout(session_token)
    response.delete_cookie("session_token")
    return ok({"status": "logged_out"})


@app.post("/projects")
def create_project(payload: ProjectPayload, session_token: str | None = Cookie(default=None)) -> dict:
    username = current_user_or_401(session_token)
    project = project_service.create(payload.name, payload.description, username)
    return ok(project.__dict__)


@app.get("/projects")
def list_projects(session_token: str | None = Cookie(default=None)) -> dict:
    username = current_user_or_401(session_token)
    return ok([project.__dict__ for project in project_service.list_for_user(username)])


@app.get("/projects/{project_id}")
def get_project(project_id: int, session_token: str | None = Cookie(default=None)) -> dict:
    username = current_user_or_401(session_token)
    project = project_service.get_for_user(project_id, username)
    if project is None:
        raise api_error(404, "project_not_found", "Project not found")
    return ok(project.__dict__)


@app.delete("/projects/{project_id}")
def delete_project(project_id: int, session_token: str | None = Cookie(default=None)) -> dict:
    username = current_user_or_401(session_token)
    deleted = project_service.delete_for_user(project_id, username)
    if not deleted:
        raise api_error(404, "project_not_found", "Project not found")
    return ok({"status": "deleted"})

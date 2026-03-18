import json
import os
from http import HTTPStatus
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, HTTPServer

from sandbox_persistence import (
    AuthService,
    InMemoryProjectRepository,
    InMemorySessionRepository,
    InMemoryUserRepository,
    ProjectService,
)

auth_service = AuthService(InMemoryUserRepository(), InMemorySessionRepository())
project_service = ProjectService(InMemoryProjectRepository())


class Handler(BaseHTTPRequestHandler):
    def _json(self, status: int, payload: dict | list, cookie: str | None = None) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        if cookie is not None:
            self.send_header("Set-Cookie", cookie)
        self.end_headers()
        self.wfile.write(body)

    def _session_token(self) -> str | None:
        raw = self.headers.get("Cookie")
        if not raw:
            return None
        cookie = SimpleCookie()
        cookie.load(raw)
        morsel = cookie.get("session_token")
        return morsel.value if morsel else None

    def _current_user(self) -> str | None:
        return auth_service.me(self._session_token())

    def do_GET(self) -> None:  # noqa: N802
        if self.path == "/health":
            self._json(HTTPStatus.OK, {"status": "ok"})
            return

        if self.path == "/auth/me":
            username = self._current_user()
            if username is None:
                self._json(HTTPStatus.UNAUTHORIZED, {"detail": "unauthorized"})
                return
            self._json(HTTPStatus.OK, {"username": username})
            return

        if self.path == "/projects":
            username = self._current_user()
            if username is None:
                self._json(HTTPStatus.UNAUTHORIZED, {"detail": "unauthorized"})
                return
            projects = [p.__dict__ for p in project_service.list_for_user(username)]
            self._json(HTTPStatus.OK, projects)
            return

        if self.path.startswith("/projects/"):
            username = self._current_user()
            if username is None:
                self._json(HTTPStatus.UNAUTHORIZED, {"detail": "unauthorized"})
                return
            try:
                project_id = int(self.path.split("/")[-1])
            except ValueError:
                self._json(HTTPStatus.NOT_FOUND, {"detail": "project not found"})
                return
            project = project_service.get_for_user(project_id, username)
            if project is None:
                self._json(HTTPStatus.NOT_FOUND, {"detail": "project not found"})
                return
            self._json(HTTPStatus.OK, project.__dict__)
            return

        self._json(HTTPStatus.NOT_FOUND, {"error": "not_found"})

    def do_POST(self) -> None:  # noqa: N802
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length) if length else b"{}"
        data = json.loads(raw.decode("utf-8"))

        if self.path == "/auth/register":
            username = data.get("username", "")
            password = data.get("password", "")
            if not username or not password:
                self._json(HTTPStatus.BAD_REQUEST, {"detail": "username and password required"})
                return
            created = auth_service.register(username, password)
            if not created:
                self._json(HTTPStatus.CONFLICT, {"detail": "user exists"})
                return
            self._json(HTTPStatus.OK, {"status": "registered"})
            return

        if self.path == "/auth/login":
            token = auth_service.login(data.get("username", ""), data.get("password", ""))
            if token is None:
                self._json(HTTPStatus.UNAUTHORIZED, {"detail": "invalid credentials"})
                return
            self._json(HTTPStatus.OK, {"status": "logged_in"}, cookie=f"session_token={token}; Path=/; HttpOnly; SameSite=Lax")
            return

        if self.path == "/auth/logout":
            auth_service.logout(self._session_token())
            self._json(HTTPStatus.OK, {"status": "logged_out"}, cookie="session_token=; Max-Age=0; Path=/; SameSite=Lax")
            return

        if self.path == "/projects":
            username = self._current_user()
            if username is None:
                self._json(HTTPStatus.UNAUTHORIZED, {"detail": "unauthorized"})
                return
            name = data.get("name", "")
            description = data.get("description", "")
            if not name:
                self._json(HTTPStatus.BAD_REQUEST, {"detail": "name required"})
                return
            project = project_service.create(name, description, username)
            self._json(HTTPStatus.OK, project.__dict__)
            return

        self._json(HTTPStatus.NOT_FOUND, {"error": "not_found"})

    def do_DELETE(self) -> None:  # noqa: N802
        if self.path.startswith("/projects/"):
            username = self._current_user()
            if username is None:
                self._json(HTTPStatus.UNAUTHORIZED, {"detail": "unauthorized"})
                return
            try:
                project_id = int(self.path.split("/")[-1])
            except ValueError:
                self._json(HTTPStatus.NOT_FOUND, {"detail": "project not found"})
                return
            deleted = project_service.delete_for_user(project_id, username)
            if not deleted:
                self._json(HTTPStatus.NOT_FOUND, {"detail": "project not found"})
                return
            self._json(HTTPStatus.OK, {"status": "deleted"})
            return

        self._json(HTTPStatus.NOT_FOUND, {"error": "not_found"})

    def log_message(self, format: str, *args: object) -> None:
        return


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    HTTPServer(("0.0.0.0", port), Handler).serve_forever()

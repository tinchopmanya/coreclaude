import json
import os
import subprocess
import time
import unittest
from http.cookiejar import CookieJar
from urllib.error import HTTPError, URLError
from urllib.request import HTTPCookieProcessor, Request, build_opener


class SandboxProjectTests(unittest.TestCase):
    def test_project_visibility_and_crud(self) -> None:
        env = os.environ.copy()
        env["PORT"] = "18082"
        process = subprocess.Popen(["python", "sandbox_server.py"], cwd="backend", env=env)
        opener = build_opener(HTTPCookieProcessor(CookieJar()))

        def call(path: str, method: str = "GET", payload: dict | None = None) -> tuple[int, dict | list]:
            data = None
            headers = {}
            if payload is not None:
                data = json.dumps(payload).encode("utf-8")
                headers["Content-Type"] = "application/json"
            req = Request(f"http://127.0.0.1:18082{path}", data=data, method=method, headers=headers)
            try:
                with opener.open(req, timeout=2) as response:
                    return response.status, json.loads(response.read().decode("utf-8"))
            except HTTPError as exc:
                return exc.code, json.loads(exc.read().decode("utf-8"))
            except URLError:
                return 0, {}

        try:
            deadline = time.time() + 5
            while time.time() < deadline:
                if call("/health")[0] == 200:
                    break
                time.sleep(0.1)

            self.assertEqual(call("/auth/register", "POST", {"username": "owner", "password": "pw"})[0], 200)
            self.assertEqual(call("/auth/login", "POST", {"username": "owner", "password": "pw"})[0], 200)

            status, created = call("/projects", "POST", {"name": "A", "description": "alpha"})
            self.assertEqual(status, 200)
            project_id = created["id"]

            status, listing = call("/projects")
            self.assertEqual(status, 200)
            self.assertEqual(len(listing), 1)
            self.assertEqual(listing[0]["owner_username"], "owner")

            status, detail = call(f"/projects/{project_id}")
            self.assertEqual(status, 200)
            self.assertEqual(detail["name"], "A")

            self.assertEqual(call(f"/projects/{project_id}", "DELETE")[0], 200)
            self.assertEqual(call(f"/projects/{project_id}")[0], 404)
        finally:
            process.terminate()
            process.wait(timeout=2)


if __name__ == "__main__":
    unittest.main()

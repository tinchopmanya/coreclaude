import json
import os
import subprocess
import time
import unittest
from http.cookiejar import CookieJar
from urllib.error import HTTPError, URLError
from urllib.request import HTTPCookieProcessor, Request, build_opener


class SandboxAuthTests(unittest.TestCase):
    def test_auth_flow(self) -> None:
        env = os.environ.copy()
        env["PORT"] = "18081"
        process = subprocess.Popen(["python", "sandbox_server.py"], cwd="backend", env=env)
        jar = CookieJar()
        opener = build_opener(HTTPCookieProcessor(jar))

        def call(path: str, method: str = "GET", payload: dict[str, str] | None = None) -> tuple[int, dict]:
            data = None
            headers = {}
            if payload is not None:
                data = json.dumps(payload).encode("utf-8")
                headers["Content-Type"] = "application/json"
            req = Request(f"http://127.0.0.1:18081{path}", data=data, method=method, headers=headers)
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

            self.assertEqual(call("/auth/register", "POST", {"username": "sam", "password": "pw"})[0], 200)
            self.assertEqual(call("/auth/login", "POST", {"username": "sam", "password": "pw"})[0], 200)
            self.assertEqual(call("/auth/me")[1], {"username": "sam"})
            self.assertEqual(call("/auth/logout", "POST")[1], {"status": "logged_out"})
            self.assertEqual(call("/auth/me")[0], 401)
        finally:
            process.terminate()
            process.wait(timeout=2)


if __name__ == "__main__":
    unittest.main()

import json
import os
import subprocess
import time
import unittest
from urllib.error import URLError
from urllib.request import urlopen


class SandboxHealthTests(unittest.TestCase):
    def test_sandbox_health(self) -> None:
        env = os.environ.copy()
        env["PORT"] = "18080"
        process = subprocess.Popen(["python", "sandbox_server.py"], cwd="backend", env=env)
        try:
            deadline = time.time() + 5
            while time.time() < deadline:
                try:
                    with urlopen("http://127.0.0.1:18080/health", timeout=1) as response:
                        self.assertEqual(response.status, 200)
                        self.assertEqual(json.loads(response.read().decode("utf-8")), {"status": "ok"})
                        return
                except URLError:
                    time.sleep(0.1)

            self.fail("sandbox backend did not become ready")
        finally:
            process.terminate()
            process.wait(timeout=2)


if __name__ == "__main__":
    unittest.main()

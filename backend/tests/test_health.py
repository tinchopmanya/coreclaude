import importlib.util
import unittest

FASTAPI_AVAILABLE = importlib.util.find_spec("fastapi") is not None


@unittest.skipUnless(FASTAPI_AVAILABLE, "fastapi not installed")
class HealthTests(unittest.TestCase):
    def setUp(self) -> None:
        from fastapi.testclient import TestClient

        from app.main import app

        self.client = TestClient(app)

    def test_health(self) -> None:
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"data": {"status": "ok"}, "error": None})

    def test_auth_and_project_flow(self) -> None:
        self.assertEqual(self.client.post("/auth/register", json={"username": "alice", "password": "pw"}).status_code, 200)
        self.assertEqual(self.client.post("/auth/login", json={"username": "alice", "password": "pw"}).status_code, 200)

        created = self.client.post("/projects", json={"name": "Proj", "description": "desc"})
        self.assertEqual(created.status_code, 200)
        project_id = created.json()["data"]["id"]

        listed = self.client.get("/projects")
        self.assertEqual(listed.status_code, 200)
        self.assertEqual(len(listed.json()["data"]), 1)

        detail = self.client.get(f"/projects/{project_id}")
        self.assertEqual(detail.status_code, 200)

        self.assertEqual(self.client.delete(f"/projects/{project_id}").status_code, 200)
        self.assertEqual(self.client.post("/auth/logout").status_code, 200)


if __name__ == "__main__":
    unittest.main()

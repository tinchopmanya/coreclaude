import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sandbox_persistence import AuthService, InMemorySessionRepository, InMemoryUserRepository


class SandboxPersistenceTests(unittest.TestCase):
    def test_auth_service_uses_repository_layers(self) -> None:
        service = AuthService(InMemoryUserRepository(), InMemorySessionRepository())

        self.assertTrue(service.register("riley", "pw"))
        self.assertFalse(service.register("riley", "pw"))

        token = service.login("riley", "pw")
        self.assertIsNotNone(token)
        self.assertEqual(service.me(token), "riley")

        service.logout(token)
        self.assertIsNone(service.me(token))


if __name__ == "__main__":
    unittest.main()

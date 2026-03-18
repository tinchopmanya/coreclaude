import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import test from "node:test";

async function waitFor(url, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.status < 500) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`timeout waiting for ${url}`);
}

test("sandbox auth flow", async () => {
  const backendPort = "19000";
  const frontendPort = "19001";

  const backend = spawn("python", ["sandbox_server.py"], {
    cwd: "backend",
    env: { ...process.env, PORT: backendPort },
    stdio: "ignore"
  });

  const frontend = spawn("node", ["sandbox_server.mjs"], {
    cwd: "frontend",
    env: { ...process.env, BACKEND_URL: `http://127.0.0.1:${backendPort}`, PORT: frontendPort },
    stdio: "ignore"
  });

  try {
    await waitFor(`http://127.0.0.1:${backendPort}/health`);
    await waitFor(`http://127.0.0.1:${frontendPort}/`);

    const register = await fetch(`http://127.0.0.1:${frontendPort}/api/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "zoe", password: "pw" })
    });
    assert.equal(register.status, 200);

    const login = await fetch(`http://127.0.0.1:${frontendPort}/api/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "zoe", password: "pw" })
    });
    assert.equal(login.status, 200);

    const cookie = login.headers.get("set-cookie");
    assert.ok(cookie);

    const me = await fetch(`http://127.0.0.1:${frontendPort}/api/me`, { headers: { cookie } });
    assert.equal(me.status, 200);

    const logout = await fetch(`http://127.0.0.1:${frontendPort}/api/logout`, {
      method: "POST",
      headers: { cookie }
    });
    assert.equal(logout.status, 200);
  } finally {
    frontend.kill("SIGTERM");
    backend.kill("SIGTERM");
  }
});

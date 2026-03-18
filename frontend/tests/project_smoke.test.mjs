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

test("sandbox project flow", async () => {
  const backendPort = "19010";
  const frontendPort = "19011";

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

    await fetch(`http://127.0.0.1:${frontendPort}/api/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "owner", password: "pw" })
    });

    const login = await fetch(`http://127.0.0.1:${frontendPort}/api/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "owner", password: "pw" })
    });
    const cookie = login.headers.get("set-cookie");
    assert.ok(cookie);

    const create = await fetch(`http://127.0.0.1:${frontendPort}/api/projects`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({ name: "Proj", description: "demo" })
    });
    assert.equal(create.status, 200);
    const created = await create.json();

    const list = await fetch(`http://127.0.0.1:${frontendPort}/api/projects`, { headers: { cookie } });
    assert.equal(list.status, 200);
    const listed = await list.json();
    assert.equal(listed.length, 1);

    const detail = await fetch(`http://127.0.0.1:${frontendPort}/api/projects/${created.id}`, { headers: { cookie } });
    assert.equal(detail.status, 200);

    const deleted = await fetch(`http://127.0.0.1:${frontendPort}/api/projects/${created.id}`, {
      method: "DELETE",
      headers: { cookie }
    });
    assert.equal(deleted.status, 200);
  } finally {
    frontend.kill("SIGTERM");
    backend.kill("SIGTERM");
  }
});

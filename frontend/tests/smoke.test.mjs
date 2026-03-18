import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("frontend references health, auth, and project routes", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const api = await readFile(new URL("../lib/api.ts", import.meta.url), "utf8");
  const sandbox = await readFile(new URL("../sandbox_server.mjs", import.meta.url), "utf8");
  const dashboard = await readFile(new URL("../app/(app)/dashboard/page.tsx", import.meta.url), "utf8");
  const projectClient = await readFile(new URL("../lib/projectClient.ts", import.meta.url), "utf8");

  assert.match(page, /getHealth\(\)/);
  assert.match(api, /\/health/);
  assert.match(sandbox, /\/api\/login/);
  assert.match(sandbox, /\/api\/projects/);
  assert.match(dashboard, /Create project/);
  assert.match(projectClient, /\/projects/);
});

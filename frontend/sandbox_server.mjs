import http from "node:http";

const backendUrl = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";
const port = Number(process.env.PORT ?? 3000);

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf-8");
}

async function proxy(req, res, path) {
  try {
    const body = req.method === "POST" ? await readBody(req) : undefined;
    const response = await fetch(`${backendUrl}${path}`, {
      method: req.method,
      headers: {
        "content-type": req.headers["content-type"] ?? "application/json",
        cookie: req.headers.cookie ?? ""
      },
      body
    });
    const setCookie = response.headers.getSetCookie?.() ?? [];
    if (setCookie.length) res.setHeader("Set-Cookie", setCookie);
    const payload = await response.text();
    res.writeHead(response.status, { "content-type": "application/json" });
    res.end(payload);
  } catch (error) {
    res.writeHead(502, { "content-type": "application/json" });
    res.end(JSON.stringify({ detail: String(error) }));
  }
}

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end("bad request");
    return;
  }

  if (req.url === "/") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end('<h1>Frontend Sandbox</h1><p><a href="/register">Register</a> <a href="/login">Login</a> <a href="/dashboard">Dashboard</a></p>');
    return;
  }

  if (req.url === "/register") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end('<h1>Register</h1><p>Use API: POST /api/register</p>');
    return;
  }

  if (req.url === "/login") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end('<h1>Login</h1><p>Use API: POST /api/login</p>');
    return;
  }

  if (req.url === "/dashboard") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end('<h1>Dashboard</h1><p>Project APIs: GET/POST /api/projects, GET/DELETE /api/projects/:id</p>');
    return;
  }

  if (req.url === "/health-check") {
    await proxy(req, res, "/health");
    return;
  }

  if (req.url === "/api/register" && req.method === "POST") {
    await proxy(req, res, "/auth/register");
    return;
  }

  if (req.url === "/api/login" && req.method === "POST") {
    await proxy(req, res, "/auth/login");
    return;
  }

  if (req.url === "/api/me" && req.method === "GET") {
    await proxy(req, res, "/auth/me");
    return;
  }

  if (req.url === "/api/logout" && req.method === "POST") {
    await proxy(req, res, "/auth/logout");
    return;
  }

  if (req.url === "/api/projects" && (req.method === "GET" || req.method === "POST")) {
    await proxy(req, res, "/projects");
    return;
  }

  if (req.url.startsWith("/api/projects/") && (req.method === "GET" || req.method === "DELETE")) {
    const id = req.url.split("/").pop();
    await proxy(req, res, `/projects/${id}`);
    return;
  }

  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ error: "not_found" }));
});

server.listen(port, "0.0.0.0", () => {
  console.log(`frontend sandbox listening on :${port}`);
});

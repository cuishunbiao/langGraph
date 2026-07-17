import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { config } from "./config.js";
import { createPresentationGraph } from "./bootstrap.js";

const graph = createPresentationGraph();

function sendJson(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body, null, 2));
}

async function readJson(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 1_000_000) throw new Error("请求体不能超过 1MB");
  }
  return body ? JSON.parse(body) : {};
}

function serveFile(res, encodedName) {
  const name = path.basename(decodeURIComponent(encodedName));
  const file = path.join(config.uploadDir, name);
  if (!fs.existsSync(file)) return sendJson(res, 404, { error: "文件不存在" });
  res.writeHead(200, {
    "content-type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "content-disposition": `attachment; filename="${name}"`
  });
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

    if (req.method === "GET" && url.pathname === "/health") {
      return sendJson(res, 200, { status: "ok", model: config.ollamaModel });
    }
    if (req.method === "GET" && url.pathname.startsWith("/files/")) {
      return serveFile(res, url.pathname.slice("/files/".length));
    }
    if (req.method === "POST" && url.pathname === "/api/presentations") {
      const input = await readJson(req);
      if (!input.topic) return sendJson(res, 400, { error: "topic 不能为空" });
      const result = await graph.invoke({
        topic: input.topic,
        audience: input.audience ?? "普通职场人士"
      });
      return sendJson(res, 201, result);
    }

    return sendJson(res, 200, {
      name: "Ollama PPT Agent MVP",
      create: "POST /api/presentations",
      example: {
        topic: "本地 Ollama PPT Agent 开发架构",
        audience: "软件开发团队"
      }
    });
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { error: error.message });
  }
});

server.listen(config.port, () => {
  console.log(`PPT 服务已启动：${config.publicBaseUrl}`);
  console.log(`当前模型：${config.ollamaModel}`);
});

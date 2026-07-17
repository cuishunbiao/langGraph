import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const config = {
  rootDir,
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434",
  ollamaModel: process.env.OLLAMA_MODEL ?? "qwen3.5:9b",
  outputDir: path.join(rootDir, "output"),
  uploadDir: path.join(rootDir, "public", "files"),
  port: Number(process.env.PORT ?? 3000),
  publicBaseUrl: process.env.PUBLIC_BASE_URL ?? "http://127.0.0.1:3000"
};

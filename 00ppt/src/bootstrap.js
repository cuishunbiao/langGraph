import { config } from "./config.js";
import { OllamaClient } from "./llm/ollama-client.js";
import { PptAgent } from "./agent/ppt-agent.js";
import { LocalStorage } from "./storage/local-storage.js";
import { createPptGraph } from "./graph/ppt-graph.js";

export function createPresentationGraph() {
  const llm = new OllamaClient({
    baseUrl: config.ollamaBaseUrl,
    model: config.ollamaModel
  });
  const planner = new PptAgent({ llm });
  const storage = new LocalStorage({
    uploadDir: config.uploadDir,
    publicBaseUrl: config.publicBaseUrl
  });
  return createPptGraph({ planner, storage, outputDir: config.outputDir });
}

import { ChatOllama } from "@langchain/ollama";

export const model = new ChatOllama({
  model: "qwen3.5:9b",
  baseUrl: "http://127.0.0.1:11434",
  temperature: 0.7,
});

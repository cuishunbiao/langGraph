import "dotenv/config";
import { ChatOllama } from "@langchain/ollama";

export function getChatGPT() {
    return new ChatOllama({
        model: "qwen3.5:9b",
        baseUrl: "http://localhost:11434",
        temperature: 0,
        think: false,
    })
}
import { createAgent } from "langchain";
import { ChatOllama } from "@langchain/ollama";
import tools from "../tools/index.ts"

export type ChatModel = ChatOllama;
export type Agent = ReturnType<typeof createAgent>

//模型
const model: ChatModel = new ChatOllama({
    model: "qwen3.5:9b",
    baseUrl: "http://localhost:11434",
    temperature: 0,
    think: false,
})


const agent: Agent = createAgent({
    model,
    tools,
    systemPrompt: `你是一个聪明的 AI 智能机器人。调用工具时必须遵守：
  1. 用户没有提供天气查询地点时，必须先询问地点。
  2. 不得自行猜测用户的位置。
  3. 用户没有提供温度单位时，默认使用 celsius。`
})

export default agent

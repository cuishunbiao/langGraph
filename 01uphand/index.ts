import * as z from "zod";
import type { BaseMessage } from "@langchain/core/messages";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatOllama } from "@langchain/ollama";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { StateGraph, START, END } from "@langchain/langgraph";
import readlineSync from "readline-sync";

// 定义一个状态的 scheme
// {messages: [{}, {}, {}], llmCalls: 2}
const Scheme = z.object({
    messages: z.array(z.custom<BaseMessage>()),
    llmCalls: z.number().optional()
})

// 根据 Scheme 定义一个状态的 schema
type TState = z.infer<typeof Scheme>;

// 创建模型
const model = new ChatOllama({
    model: "qwen3.5:9b",
    temperature: 0.7,
    think: false
})

// 创建提示词
const pt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate("你是一个健谈的中文 AI 助手，请结合上下文尽可能详细地使用中文回答用户问题。"),
    new MessagesPlaceholder("messages"),
])

// 形成链条
const chain = pt.pipe(model);

// 创建节点
async function llmNode(state: TState) {
    const stream = await chain.stream({
        messages: state.messages
    })

    let fullContent = "";
    for await (const chunk of stream) {
        const text = chunk.content as string;
        process.stdout.write(text);
        fullContent += text;
    }
    console.log("\n");

    return {
        messages: [...state.messages, new AIMessage(fullContent)],
        llmCalls: (state.llmCalls || 0) + 1
    }
}

// 构建图
const graph = new StateGraph(Scheme).addNode("llm", llmNode).addEdge(START, "llm").addEdge("llm", END);
// 编译图
const app = graph.compile();

// 进行对话
async function main() {
    let messages: BaseMessage[] = []; // 本次消息数组，存储消息使用
    let llmCalls = 0; // 本次调用 LLM 的次数
    console.log("欢迎使用 AI 助手，输入 'q' 退出。\n")

    while (true) {
        const input = readlineSync.question("你："); // 接收用户的输入
        if (input === "exit") break;

        // 把用户的输入推送到 message 数组里
        messages = [...messages, new HumanMessage(input)];

        const result = await app.invoke({ messages, llmCalls });
        messages = result.messages;
        llmCalls = result.llmCalls || 0;
    }
    console.log("再见！");
}

main();
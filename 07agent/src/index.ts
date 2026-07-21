import type { BaseMessage } from "@langchain/core/messages";
import { HumanMessage } from "@langchain/core/messages";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import travelGraph from "./agents/travel/agent.ts";

const DEMO_INPUTS = [
  "北京天气怎么样？",
  "帮我查一下从北京到上海的火车票",
  "你好，你能做什么？",
];

async function runTurn(messages: BaseMessage[], userInput: string) {
  const result = await travelGraph.invoke({
    messages: [...messages, new HumanMessage(userInput)],
  });

  return result.messages;
}

async function runDemo() {
  let messages: BaseMessage[] = [];

  console.log("旅行助手演示\n");
  for (const userInput of DEMO_INPUTS) {
    console.log(`你：${userInput}`);
    messages = await runTurn(messages, userInput);
  }
}

async function runInteractive() {
  const readline = createInterface({ input, output });
  let messages: BaseMessage[] = [];

  console.log("欢迎使用旅行助手！输入 q、quit 或 exit 退出。\n");

  try {
    while (true) {
      const userInput = (await readline.question("你：")).trim();
      if (["q", "quit", "exit"].includes(userInput.toLowerCase())) break;
      if (!userInput) continue;

      messages = await runTurn(messages, userInput);
    }
  } finally {
    readline.close();
  }

  console.log("再见！");
}

async function main() {
  if (process.argv.includes("--demo")) {
    await runDemo();
    return;
  }

  await runInteractive();
}

main().catch((error: unknown) => {
  console.error("旅行助手运行失败：", error);
  process.exitCode = 1;
});

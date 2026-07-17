import type { TArticle } from "../state.ts";
import { SYSTEM_PROMPT, CONTENT_PROMPT } from "../prompt.ts";
import {
  SystemMessage,
  HumanMessage,
  ToolMessage,
  BaseMessage,
} from "@langchain/core/messages";
import { getChatGPT } from "../model.ts";
import tools from "../tools/index.ts";
import { tool } from "langchain";

export async function contentNode(state: TArticle) {
  if (!state.topic) throw new Error("没有指定文章的主题");
  if (!state.title) throw new Error("文章标题缺失！");

  const { topic, title } = state;
  const systemContent = SYSTEM_PROMPT.replace("{topic}", topic)
  const userContent = CONTENT_PROMPT.replace("{title}", title)

  const messages: BaseMessage[] = [
    new SystemMessage(systemContent),
    new HumanMessage(userContent)
  ]

  const model = getChatGPT();
  const modelWithTools = model.bindTools(tools)

  // ReAct 循环模式
  while (true) {
    const reply = await modelWithTools.invoke(messages)

    messages.push(reply);

    if (!reply.tool_calls || reply.tool_calls.length === 0) {
      // 说明此时不需要调用工具，模型已经生成了文章的完整内容
      const content = reply.content as string;
      console.log(`文章的正文部分已经生成完毕，共 ${content.length} 字`);
      return { content };
    }

    for (const toolCall of reply.tool_calls) {
      const selectedTool = tools.find((tool) => tool.name === toolCall.name)

      if(selectedTool) {
        const toolResult = await (selectedTool as any).invoke(toolCall.args)
        console.log(
          `[${toolCall.name}] 工具调用已经完成，工具调用结果为：${toolResult}`
        );

        messages.push(new ToolMessage({
          content: toolResult,
          tool_call_id: toolCall.id!,
          name: toolCall.name
        }))
      } else {
        console.log(`没有找到对应的工具${toolCall.name}。`)
      }
    }

  }

}


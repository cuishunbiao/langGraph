import type { TArticle } from "../state.ts";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { SYSTEM_PROMPT, SUMMARY_PROMPT } from "../prompt.ts";
import { getChatGPT } from "../model.ts";

export async function summaryNode(state: TArticle){
  if (!state.topic) throw new Error("未指定文章主题！");
  if (!state.title) throw new Error("文章标题缺失！");
  if (!state.content) throw new Error("文章正文内容缺失！");


  const {topic, title, content} = state;

  const pt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_PROMPT],
    ["human", SUMMARY_PROMPT],
  ])

  const model = getChatGPT();

  const chain = pt.pipe(model).pipe(new StringOutputParser())

  const summary = await chain.invoke({
    topic,
    title,
    content
  })

  console.log(`文章摘要已经生成，共${summary.length}个字`)

  return {
    summary
  }
}

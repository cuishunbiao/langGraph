import type { T_travelSchema } from '../../../states/index.ts'
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { model } from "../../../utils/model.ts"
import { TICKET_EXTRACT_PROMPT } from './prompts.ts'
import ticketGraph from '../../ticket/agent.ts'


export async function ticket(state: T_travelSchema) {
  // 获取最后一条消息
  const messages = state.messages;
  const lastContent = messages[messages.length - 1]?.content;

  // 使用大模型提取信息
  // 输入：帮我查一下从北京到上海的车票信息
  // 输出：北京,上海
  const result = await model.invoke([
    new SystemMessage(TICKET_EXTRACT_PROMPT),
    new HumanMessage(lastContent),
  ]);

  const cities = String(result.content).trim();
  let from_city = "未知";
  let to_city = "未知";
  if (/[,，]/.test(cities)) {
    const parts = cities.split(/[,，]/); // 同时兼容英文逗号和中文逗号
    from_city = parts[0]?.trim() || "未知";
    to_city = parts[1]?.trim() || "未知";
  }

  console.log(`🚄 [车票查询] 出发地: ${from_city}, 目的地: ${to_city}`);

  const subGraphResult = await ticketGraph.invoke({ from_city, to_city});

  const ticket_result = subGraphResult.ticket_result ?? "查询失败";
  console.log(`🚄 [子图 - 车票查询] 查询结果: ${ticket_result}`);
  return { sub_result: ticket_result };
}

import type { T_travelSchema } from '../../../states/index.ts'
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { model } from '../../../utils/model.ts'
import { INTENT_SYSTEM_PROMPT } from './prompts.ts';

export async function intent(state: T_travelSchema) {
    // 先拿到消息数组里面的最后一条消息
    const messages = state.messages;
    const lastMessage = messages[messages.length - 1];
    // 需要对最后这条消息做一个判断
    // 1. 是否为空，空的也不需要判断意图
    // 2. 是否非用户消息，因为非用户消息（AI回复、系统消息）不需要判断意图
    if (!lastMessage || !(lastMessage instanceof HumanMessage))
        return { intent: "chat" };


    const userInput = lastMessage.content; // 拿到用户输入的内容

    const result = await model.invoke([
        new SystemMessage(INTENT_SYSTEM_PROMPT),
        new HumanMessage(userInput),
    ]);

    // 根据模型的回答，去不同的路由
    const intentText = result.content as string;
    let intent: string;

    if (intentText.includes('weather')) intent = 'weather';
    else if (intentText.includes('ticket')) intent = 'ticket';
    else intent = 'chat'

    console.log(`🎯 [意图识别] 用户意图: ${intent}`);
    return { intent };
}

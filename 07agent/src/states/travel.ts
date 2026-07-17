import { z } from "zod/v4"
import type { BaseMessage } from "@langchain/core/messages"
import { registry } from "@langchain/langgraph/zod"
import { MessagesZodMeta } from "@langchain/langgraph"

const travelSchema = z.object({
    // 聊天消息
    messages: z
        .array(z.custom<BaseMessage>())
        .register(registry, MessagesZodMeta)
        .describe("聊天消息"),
    intent: z.string().nullable().register(registry, {
        
    })
})

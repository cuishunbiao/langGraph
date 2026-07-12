import { z } from "zod/v4";

const Schema = z.object({
    messages: z.array(z.custom()).describe('传话记录'),
    llmCalls: z.number().optional().describe('大模型交互次数')
});

export type State = z.infer<typeof Schema>

export default Schema;
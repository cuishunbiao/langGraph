import { z } from "zod/v4"


export const ticketSchema = z.object({
    from_city: z.string().nullable().describe('开始地点'),
    to_city: z.string().nullable().describe('结束地点'),
    ticket_result: z.string().nullable().describe('结果')
})


export type T_ticketSchema = z.infer<typeof ticketSchema>
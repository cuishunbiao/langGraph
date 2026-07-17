import { z } from "zod/v4"


const ticketSchema = z.object({
    from_city: z.string().nullable().describe('开始地点'),
    to_city: z.string().nullable().describe('结束地点'),
    ticket_result: z.string().nullable().describe('结果')
})


export type TTicketSchema = z.infer<typeof ticketSchema>
export default ticketSchema
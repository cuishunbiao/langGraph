import type { T_ticketSchema } from '../../states/index.ts'
import { ticket_tool } from '../../tools/index.ts'

export async function ticket_query(states: T_ticketSchema) {
    const {from_city, to_city} = states;
    if (!from_city || !to_city) return { ticket_result: '缺少城市'}
    const result = await ticket_tool.invoke({
        from_city,
        to_city
    })

    return {
        ticket_result: result
    }
}

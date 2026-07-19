import { tool } from "@langchain/core/tools"
import { z } from "zod/v4"
import { TICKET_DB } from "../db/ticket.ts"
import { de } from "zod/locales";
import { from } from "node:stream/iter";

// 方法参数 schema
const schema = z.object({
    from_city: z.string().describe("出发城市"),
    to_city: z.string().describe("目标城市")
})

export type T_ticket_tool = z.infer<typeof schema>;

// 方法实现

const func = async ({from_city, to_city}: T_ticket_tool): Promise<string> => {
    // 去掉市
    const from = from_city.replace(/市$/, "");
    const to = to_city.replace(/市$/, "");

    const key = `${from}-${to}`
    if (TICKET_DB[key]){
        return `${from} - ${to}火车票：${TICKET_DB[key]}`
    }

    //没有的情况
    const routes = Object.keys(TICKET_DB).slice(0,10).map((k) => k.replace("-", " → "));

    const routesStr = routes.join('、');
    return `抱歉，未找到「${from} → ${to}」的直达火车票信息。目前支持查询的热门线路有：${routesStr}等...`;
}

export const ticket_tool = tool(func, {
    name: "ticket_tool",
    description: '查询从出发城市到目的城市的火车票价格。输入参数：{ from_city, to_city }。',
    schema
})

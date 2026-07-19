import { tool } from "@langchain/core/tools"
import { z } from "zod/v4"
import { WEATHER_DB } from "../db/weather.ts"

const schema = z.object({
    // 查询天气需要知道的城市
    city: z.string()
})

export type T_weather_tool = z.infer<typeof schema>;

const func = async ({city}: T_weather_tool): Promise<string> => {
    if(WEATHER_DB[city]) return `${city}天气：${WEATHER_DB[city]}`

    // 去掉「市」匹配文字
    const cityWithoutSuffix = city.replace(/市$/, "");
    // 再次尝试
    if(WEATHER_DB[cityWithoutSuffix]) return `${cityWithoutSuffix}天气：${WEATHER_DB[cityWithoutSuffix]}`

    const available = Object.keys(WEATHER_DB).slice(0, 10).join("\ ") + "等主要城市";
    return `没找到${city}的天气`
}

export const weather_tool = tool(func, {
    name: "weather_tool",
    description: "查询指定城市的天气情况。输入参数：{ city: 城市名称，如“北京”、“上海”、“广州”等 }。",
    schema
})

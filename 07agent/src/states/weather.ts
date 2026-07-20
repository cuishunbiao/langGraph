import { z } from "zod/v4"

export const weatherSchema = z.object({
    // 未提取到城市时不返回该字段，已有状态会自动保留
    city: z.string().nullable().describe("城市"),
    weather_result: z.string().nullable().describe("天气结果")
})

export type TWeatherSchema = z.infer<typeof weatherSchema>
import type { TWeatherSchema } from '../../states/index.ts'
import { weather_tool } from '../../tools/index.ts'

// 节点函数，用来查询天气
export async function weather_query(state: TWeatherSchema) {
    const city = state.city; // 先把城市提取出来
    if (!city) return { weather_result: '缺少目标城市' };

    // 调用工具
    const result = await weather_tool.invoke({city})
    return {
        weather_result: result
    }
}


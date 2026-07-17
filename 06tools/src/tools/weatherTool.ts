// 天气
import { z } from 'zod';
import { tool } from '@langchain/core/tools'

// 工具方法参数
const schema = z.object({
    location: z.string().min(1).describe('城市名称： 例如北京、上海'),
    unit: z.enum(['celsius', 'fahrenheit']).default('celsius').describe('温度单位')
})
export type WeatherInput = z.infer<typeof schema>;

const func = ({
    location,
    unit = 'celsius'
}: WeatherInput) => {
    const weather_info = {
        location,
        temperature: 99,
        unit,
        forecast: ['晴', '微风']
    }
    return JSON.stringify(weather_info)
}

const weather = tool(func, {
    name: 'weather',
    description: '查询指定城市当前天气。返回 JSON 字符串，包含温度、单位与简短描述。',
    schema
})

export default weather;

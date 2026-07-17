// 搜索工具
import { z } from 'zod';
import { tool } from '@langchain/core/tools'

// 工具的方法参数
const schema = z.object({
    query: z.string().describe('搜索的关键字')
})

export type searchInput = z.infer<typeof schema>

const func = async ({query}: searchInput) => {
    console.log(`正在调用工具 [search] 进行搜索，搜索的关键词为 ${query}`)

    const baseUrl = "https://serpapi.com/search.json";
    const apiKey = process.env.SERPER_API_KEY;

    if (!apiKey) throw new Error('缺少 Serp Api Key')

    // 构建 url 上的查询参数
    const params = new URLSearchParams({
        engine: "google",
        q: query,
        api_key: apiKey,
        gl: 'cn',
        hl: 'zh-cn'
    })

    try {
        const response = await fetch(`${baseUrl}?${params.toString()}`);

        if(!response.ok) throw new Error(`搜索失败，状态码是${response.status}`)
        
        const json = await response.json();
        if (json.organic_results && json.organic_results.length > 0) {
            return json.organic_results[0].snippet;
        }

        return "没有搜索到结果"

    } catch (e) {
        return '搜索错误'
    }
}

const search = tool(func, {
    name: 'search',
    description: '根据关键词，在互联网上检索相关信息',
    schema
})

export default search
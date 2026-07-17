import "dotenv/config";
import { buildGraph, writeArticle, dumpMarkdown } from './graph/agent.ts'

async function main() {
    // 1. 构造 Agent
    const agent = buildGraph();

    // 2. 写文章
    const finalState = await writeArticle(agent, 'React 重大事件')

    // 3. 将文章导出为 md 格式
    dumpMarkdown(finalState)
}

main()

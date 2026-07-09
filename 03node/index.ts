// ttl 缓存示例
import { StateGraph, START, END } from "@langchain/langgraph";
import { z } from "zod/v4";
import { InMemoryCache } from "@langchain/langgraph-checkpoint";

// 创建 Schema
const Schema = z.object({
    userId: z.string(),
    query: z.string(),
    result: z.string().optional()
})

type TState = z.infer<typeof Schema>;

const app = new StateGraph(Schema)
    .addNode(
        "node1",
        async(state: TState)=>{
            // 演示一个耗时操作
            console.log('这是一个耗时的操作...')
            await new Promise((r)=>setTimeout(r, 3000));
            return {
                result: `${state.query} 对应的答案`
            }
        },
        {
            cachePolicy: {
                keyFunc: (state: any)=>{
                    const s = Array.isArray(state) ? state[state.length - 1] : state;
                    return s?.userId; // 通过 userId 来判断是否走缓存，如果 ID 相同，则走缓存
                }
            }
        }
    )
    .addEdge(START, "node1")
    .addEdge("node1", END)
    .compile({
        cache: new InMemoryCache()
    })

// 测试
async function test() {
    console.log(await app.invoke({userId: 'u1', query: '今天天气'}))
    console.log(await app.invoke({userId: 'u2', query: '今天天气'}))
    console.log(await app.invoke({userId: 'u1', query: '今天股票'}))
}
test()
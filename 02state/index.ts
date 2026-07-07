// 写一个状态
import { StateGraph, START, END } from "@langchain/langgraph";
import * as z from "zod";

// 先定义状态的 schema，也就是状态的结构，全局结构
const schema = z.object({
    number: z.number(),
    log: z.array(z.string()),
    status: z.string().optional()
})

// 生成 TS 
type TState = z.infer<typeof schema>;

// 创建节点 1
async function node1() {
    return {
        number: 1
    }
}

//创建节点 2
async function node2() {
    return {
        log: ['This ia a log message.']
    }
}

async function node3() {
    return {
        status: 'success'
    }
}

//构建图
const app = new StateGraph(schema)
.addNode('node1', node1)
.addNode('node2', node2)
.addNode('node3', node3)
.addEdge(START, 'node1')
.addEdge('node1', 'node2')
.addEdge('node2', 'node3')
.addEdge('node3', END,).compile()

// 运行图 - invoke: 直接拿最终结果
// const result = await app.invoke({ number: 0, log: [] })
// console.log('invoke result:', result)

// 运行图 - stream: 逐步输出每个节点的结果
for await (const step of await app.stream({ number: 0, log: [] })) {
    console.log('stream step:', step)
}
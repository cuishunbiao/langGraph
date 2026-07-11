// 最小化的电商订单风险判断 MapReduce 示例。
import { StateGraph, Send, START, END } from "@langchain/langgraph";
import { registry } from "@langchain/langgraph/zod";
import { z } from "zod/v4"

// 唯一的业务对象 Schema：
// 输入时只需要 id 和 amount；判断完成后会补充 isRisk。
const OrderSchema = z.object({
    id: z.string().describe('订单 id'),
    amount: z.number().describe('订单价格'),
    isRisk: z.boolean().optional().describe('是否为风险订单')
})
// 根据 order 的 schema 生成对应的 ts 类型
type OrderType = z.infer<typeof OrderSchema>

// 整张图共享的状态（可以把它理解成所有节点共同读写的内存）
const Schema = z.object({
    // 输入：等待评分的原始订单
    orders: z.array(OrderSchema),

    // 输出：已经补充风险信息的订单
    // 多个 scoreOrder 会在同一轮并发写入 results，
    // 所以必须告诉 LangGraph：收到多份更新时应该怎样合并。
    results: z.array(OrderSchema).register(registry, {
        reducer: {
            // prev：当前已经收集到的结果
            // next：某一个 scoreOrder 本次返回的新结果
            // 例如：[o1] + [o2] => [o1, o2]
            // 如果没有 reducer，并发节点同时更新同一个字段时会产生冲突。
            fn: (prev: OrderType[], next: OrderType[]) => prev.concat(next)
        },
        // 调用 graph.invoke 时可以不传 results，它会从空数组开始收集。
        default: () => []
    })
})

type StateType = z.infer<typeof Schema>;

// Map 的分发阶段（fan-out / 扇出）：
// 1. 从共享状态中取出所有 orders。
// 2. 每个 Send 都会创建一次独立的 scoreOrder 调用。
// 3. Send 只把当前 order 传给该调用，因此 scoreOrder 不需要读取整个共享状态。
const fanoutOrders = (state: StateType) => {
    return state.orders.map((order) => new Send("scoreOrder", { order }))
}

// Map 的执行阶段：每次调用只处理一个订单。
// 如果有 5 个订单，这个函数会被并发调用 5 次。
const scoreOrder = (state: { order: OrderType }) => {
    // 即使这里只产生一条结果，也必须返回数组。
    // 因为共享状态里的 results 是数组，reducer 会把各次返回的数组依次合并。
    return {
        results: [{
            ...state.order,
            // 示例规则：金额大于等于 700 元就是风险订单。
            isRisk: state.order.amount >= 700
        }]
    }
}

// 构建图：
// START 不直接执行评分，而是通过 fanoutOrders 动态创建 N 个 scoreOrder 任务。
// 所有任务的 results 更新由 reducer 合并；任务完成后，图到达 END。
const graph = new StateGraph(Schema)
    .addNode("scoreOrder", scoreOrder)
    .addConditionalEdges(START, fanoutOrders)
    .addEdge("scoreOrder", END)
    .compile()


// 一组输入
const input = {
    // 订单
    orders: [
      { id: "o1", amount: 99 },
      { id: "o2", amount: 560 },
      { id: "o3", amount: 3000 },
      { id: "o4", amount: 2800 },
      { id: "o5", amount: 280 },
    ]
};

// invoke 的大致过程：
// orders -> Send x 5 -> scoreOrder x 5 -> reducer 合并 results -> END
const result = await graph.invoke(input);
console.log(JSON.stringify(result, null ,2))

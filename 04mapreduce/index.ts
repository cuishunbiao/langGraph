// MapReduce 示例：把字符串数组中的每一项转成大写
import {
    END,
    Send,
    START,
    StateGraph,
    type ExtractStateType
} from "@langchain/langgraph";
import { registry } from "@langchain/langgraph/zod";
import { z } from "zod/v4";

// 创建 Schema
const Schema = z.object({
    items: z.array(z.string()),
    mappedItems: z.array(z.string()).register(registry, {
        reducer: {
            fn: (current, update) => [...current, ...update]
        },
        default: () => []
    }),
    result: z.array(z.string()).optional()
});

type TState = ExtractStateType<typeof Schema>;

type TMapState = {
    item: string;
};

// 为每个字符串创建一个并行的 map 任务
function dispatchMapJobs(state: TState) {
    return state.items.map((item) => new Send("toUpper", { item }));
}

// Map：把单个字符串转成大写
function toUpper(state: TMapState) {
    return {
        mappedItems: [state.item.toUpperCase()]
    };
}

// Reduce：汇总所有 map 结果，并保持原数组顺序
function collectResults(state: TState) {
    return { result: state.mappedItems };
}

const app = new StateGraph(Schema)
    .addNode("toUpper", toUpper)
    .addNode("collectResults", collectResults)
    .addConditionalEdges(START, dispatchMapJobs)
    .addEdge("toUpper", "collectResults")
    .addEdge("collectResults", END)
    .compile();

// 测试
async function test() {
    const state = await app.invoke({
        items: ["abc", "dbcd", "esds"]
    });

    console.log(state.result);
}

test();

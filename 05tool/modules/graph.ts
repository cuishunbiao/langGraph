import agent from './agent.ts';
import Schema from './state.ts'
import type { State } from './state.ts';
import { StateGraph, START, END } from '@langchain/langgraph'
import type { BaseMessageLike } from '@langchain/core/messages'

// 创建一个节点
const llmNode = async (state: State): Promise<State> => {
    const messages = state.messages as BaseMessageLike[];

    // 获取模型交互的结果
    const result = await agent.invoke({
        messages
    })

    // 返回新状态
    return {
        messages: result.messages,
        llmCalls: (state.llmCalls ?? 0) + 1
    }
}

// 构建图
const graph = new StateGraph(Schema)
.addNode("llmNode", llmNode)
.addEdge(START, "llmNode")
.addEdge("llmNode", END)
.compile()

export default graph;

// messagesZodMeta
import { StateGraph, START, END, MessagesZodMeta } from "@langchain/langgraph";
import { registry } from "@langchain/langgraph/zod";
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { z } from "zod/v4"

// 定义 Schema
const Schema = z.object({
    messages: z.array(z.custom<BaseMessage>()).register(registry, MessagesZodMeta)
})

async function node1(){
    const msg = new HumanMessage({
        content: "Hello, how are you?"
    })
    console.log('第一个节点消息打印：', JSON.stringify(msg, null, 2))
    return {
        messages: [msg]
    }
}

async function node2(){
    const msg = new AIMessage({
        content: "I'm fine, thank you!"
    })
    console.log('第二个节点消息打印：', JSON.stringify(msg, null, 2))
    return {
        messages: [msg]
    }
}

async function node3(){
    const msg = new HumanMessage({
        id: "m-123",
        content: "What's your name?"
    })
    console.log('第三个节点消息打印：', JSON.stringify(msg, null, 2))
    return {
        messages: [msg]
    }
}

async function node4(){
    const msg = new AIMessage({
        id: "m-456",
        content: "My name is John Doe."
    })
    console.log('第四个节点消息打印：', JSON.stringify(msg, null, 2))
    return {
        messages: [msg]
    }
}

const app = new StateGraph(Schema)
.addNode('node1', node1)
.addNode('node2', node2)
.addNode('node3', node3)
.addNode('node4', node4)
.addEdge(START, 'node1')
.addEdge('node1', 'node2')
.addEdge('node2', 'node3')
.addEdge('node3', 'node4')
.addEdge('node4', END)
.compile()

const result = await app.invoke({
    messages: [
        new HumanMessage({
            id: "m-123",
            content: "m-123 用户消息"
        }),
        new AIMessage({
            id: "m-456",
            content: "m-456 助手消息"
        })
    ]
})
console.log(result)
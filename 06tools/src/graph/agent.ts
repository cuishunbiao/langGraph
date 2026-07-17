import { titleNode } from "./title_node.ts";
import { summaryNode } from "./summary_node.ts";
import { contentNode } from "./content_node.ts";
import { StateGraph, START, END } from "@langchain/langgraph";
import { Schema } from "../state.ts";
import type { TArticle } from "../state.ts";
import fs from "fs";

export function buildGraph() {
    //构建图
    return (
        new StateGraph(Schema)
            .addNode("title_node", titleNode)
            .addNode("summary_node", summaryNode)
            .addNode("content_node", contentNode)
            .addEdge(START, "title_node")
            .addEdge("title_node", "content_node")
            .addEdge("content_node", "summary_node")
            .addEdge("summary_node", END)
            .compile()
    )
}

export async function writeArticle(agent: any, topic: string) {
    const initState: TArticle = {
        topic,
        title: '',
        content: '',
        summary: ''
    }
    return await agent.invoke(initState)
}

export function dumpMarkdown(state: TArticle) {
    const { title, content } = state;
    const filename = `./${title}.md`

    let mdContent = `# ${title}\n\n`
    mdContent += `${content}\n\n`

    fs.writeFileSync(filename, mdContent);
    console.log(`文章内容已经生成了，保存在${filename}位置`)
}

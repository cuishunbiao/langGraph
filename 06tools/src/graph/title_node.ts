import type { TArticle } from '../state.ts'
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { SYSTEM_PROMPT, TITLE_PROMPT } from "../prompt.ts";
import { getChatGPT } from "../model.ts";


export async function titleNode(state: TArticle) {
    if(!state.topic) throw new Error('没有文章主题')
    
    const topic = state.topic;

    const pt = ChatPromptTemplate.fromMessages([
        ["system", SYSTEM_PROMPT],
        ["user", TITLE_PROMPT]
    ])

    const model = getChatGPT()

    const chain = pt.pipe(model).pipe(new StringOutputParser());

    const title = await chain.invoke({
        topic
    })

    console.log(`文章标题已经生成完了，生成的标题是${title}`)

    return {
        title
    }
}

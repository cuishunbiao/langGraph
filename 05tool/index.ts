import "dotenv/config"
import process from "node:process";
import { createInterface } from "node:readline/promises";
import {
    AIMessage,
    HumanMessage,
    type BaseMessageLike
} from '@langchain/core/messages'
import graph from './modules/graph.ts'

const chat_history: BaseMessageLike[] = []; // 存储会话列表
const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
    historySize: 100,
    removeHistoryDuplicates: true,
});

// 程序入口
async function main() {
    console.log('开始对话，输入内容。')
    while (true) {
        // 接收用户的输入
        const input = await rl.question("\n用户：");
        if (!input) continue;
        if (input == 'exit') break;
        if (input === 'clear') {
            chat_history.length = 0;
            console.log('已经清空历史')
            continue
        }

        // 正常对话
        try {
            // 先把这一次的输入加到会话数组里
            const messages = [...chat_history, new HumanMessage(input)];

            // 和模型进行交互，拿到事件流
            const eventStream = await graph.streamEvents(
                {messages},
                {version: "v2"}
            )

            process.stdout.write('大模型：');
            let finalText = ''; // 存储最终模型输出的内容

            // 根据事件流的事件类型，做不同的事情
            for await (const ev of eventStream) {
                // 不同的事件，做不同的处理
                if(ev.event === 'on_chat_model_stream') {
                    // 这就是个 token
                    const text = ev.data.chunk.text; // 拿到文本值
                    finalText += text;
                    process.stdout.write(text)
                }

                if(ev.event === 'on_tool_start') {
                    // 这是调用工具
                    process.stdout.write(`\n 正在调用工具【${ev.name}】\n`);
                }

                if(ev.event === 'on_tool_end') {
                    process.stdout.write(`\n 工具调用完成【${ev.name}】\n`);
                }
            }

            // 所有事件处理完成后，只保存一次完整的本轮对话
            process.stdout.write('\n');
            chat_history.push(new HumanMessage(input), new AIMessage(finalText))
        } catch (e) {
            console.error(e)
        }
    }
    rl.close();
    console.log("感谢使用，下次见！");
}
main().catch((error) => {
    rl.close();
    console.error(error);
    process.exitCode = 1;
})

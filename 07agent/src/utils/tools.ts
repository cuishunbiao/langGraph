import { AIMessage, HumanMessage } from "@langchain/core/messages"; // 导入 LangChain 的消息类型，用于类型判断

/**
 * 格式化命名空间字符串
 * 将命名空间数组转换为易读的字符串格式，用于日志显示
 */
export function formatNamespace(ns?: readonly string[]): string {
  // 检查命名空间是否存在且长度不为0
  return !ns?.length
    ? "主图" // 如果没有命名空间，则显示为"主图"
    : `子图(${ns.map((s) => s.split(":")[0]).join(" > ")})`; // 否则格式化为"子图(层级1 > 层级2)"，去除冒号后的ID部分
}

/**
 * 安全地将值转换为字符串并截断
 * 用于处理日志输出中过长的内容或对象
 */
function truncate(value: any, maxLength: number): string {
  let str = ""; // 初始化结果字符串
  try {
    // 如果值已经是字符串直接使用，否则尝试将其转换为 JSON 字符串
    str = typeof value === "string" ? value : JSON.stringify(value);
  } catch {
    // 如果 JSON 序列化失败（例如循环引用），强制转换为字符串
    str = String(value);
  }
  // 如果字符串长度超过最大限制，截取前 maxLength 个字符并加上省略号，否则直接返回
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
}

/**
 * 打印流式输出的更新块
 * 解析流式输出的数据块，并在控制台打印格式化后的日志
 */
export function printStreamChunk(
  namespace: readonly string[] | undefined, // 当前更新块所属的命名空间
  update: Record<string, any> // 更新的数据块内容
) {
  // 获取格式化后的命名空间字符串，用于日志前缀
  const nsStr = formatNamespace(namespace);

  // 遍历更新块中的每一个节点（例如：agent 节点、工具节点）
  for (const [nodeName, nodeUpdate] of Object.entries(update)) {
    // 如果节点没有任何更新内容，跳过当前循环
    if (!nodeUpdate) continue;
    // 打印节点名称，表明是哪个部分的更新
    console.log(`  [${nsStr}] ${nodeName}:`);

    // 使用解构赋值，将 messages（消息历史）和其他状态属性分离开
    const { messages, ...rest } = nodeUpdate;

    // 优先处理并打印消息部分
    if (messages) {
      // 确保消息是一个数组，如果不是则包装成数组
      const msgs = Array.isArray(messages) ? messages : [messages];
      // 遍历所有消息
      for (const msg of msgs) {
        // 判断是否是 AI 的回复消息
        if (msg instanceof AIMessage) {
          // 打印 AI 回复，限制长度为 100 字符
          console.log(`    └─ AI回复: ${truncate(msg.content, 100)}`);
        } else if (msg instanceof HumanMessage) {
          // 打印用户消息，限制长度为 100 字符
          console.log(`    └─ 用户消息: ${truncate(msg.content, 100)}`);
        } else {
          // 打印其他类型的消息，限制长度为 100 字符
          console.log(`    └─ 消息: ${truncate(msg, 100)}`);
        }
      }
    }

    // 打印除消息之外的其他状态更新（例如：中间变量、工具输出等）
    for (const [key, value] of Object.entries(rest)) {
      // 打印键值对，限制值的长度为 200 字符
      console.log(`    └─ ${key}: ${truncate(value, 200)}`);
    }
  }
}

/**
 * 处理流式响应并返回最终结果
 * 驱动 Agent 运行，实时打印日志，并提取最终的 AI 回复
 * @param agent 图的构建实例 (CompiledGraph)
 * @param inputs 用户输入 (初始状态)
 */
export async function processStream(
  agent: any, // Agent 实例
  inputs: any // 输入参数
): Promise<string | null> {
  // 返回最终的 AI 回复字符串或 null
  let finalResponse: string | null = null; // 初始化最终回复变量

  // 调用 Agent 的 stream 方法开始流式执行
  const stream = await agent.stream(inputs);

  // 使用异步迭代器处理流中的每一个数据块 (chunk)
  for await (const chunk of stream) {
    // 打印当前的流数据块日志。此处假设 chunk 即 update，暂未处理深层嵌套的 namespace
    printStreamChunk([], chunk);

    // 遍历当前块中的所有节点更新，寻找最新的 AI 回复
    Object.values(chunk as Record<string, any>).forEach((nodeUpdate: any) => {
      // 获取当前节点更新中的 messages 字段
      const msgs = nodeUpdate?.messages;
      // 如果没有消息，直接返回
      if (!msgs) return;

      // 确保消息是数组
      const msgList = Array.isArray(msgs) ? msgs : [msgs];
      // 遍历消息列表
      for (const msg of msgList) {
        // 如果发现是 AIMessage，则更新 finalResponse
        // 后续的消息会覆盖前面的，确保拿到的是最新的回复
        if (msg instanceof AIMessage) {
          finalResponse = String(msg.content);
        }
      }
    });
  }

  // 返回最终捕获到的 AI 回复内容
  return finalResponse;
}

// 导入消息类型，用来做类型判断
import { AIMessage, HumanMessage } from "@langchain/core/messages";

/**
 * 格式化命名空间字符串
 * 将命名空间数组转换成易读的字符串格式，用来日志显示
 */

export function formatNamespace(ns?: readonly string[]): string {
    // 检查命名空间是否存在，且长度不为 0
    // 如果没有命名空间，就是主图，否则格式化成「子图(层级 1 > 层级 2)」，去掉冒号后面的 ID 部分
    return !ns?.length ? "主图" : `子图(${ns.map((s) => s.split(":")[0]).join(" > ")})`
}

/**
 * 安全的将值转换为字符串并截断
 * 用来处理日志输出中过长的内容或者对象
 */
function truncate(value: any, maxLength: number): string {
    let str = ""; // 初始化结果字符串
    try {
        // 如果值 已经是字符串，则直接使用，否则尝试将其转换成 JSON 字符串
        str = typeof value === 'string' ? value : JSON.stringify(value);
    } catch {
        // 如果 JOSN 失败（循环引用），强制转换成字符串
        str = String(true)
    }
    return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
}


// 先不写，没理解啥意思 。。。。
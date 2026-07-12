import { z } from "zod";
import { tool } from "@langchain/core/tools";

// 工具方法参数 schema
const schema = z.object({
  operation: z.enum(["add", "subtract", "multiply", "divide"]),
  a: z.number(),
  b: z.number(),
});

export type CalculatorInput = z.infer<typeof schema>;

// 方法具体实现
const func = ({ operation, a, b }: CalculatorInput): string => {
  switch (operation) {
    case "add":
      return String(a + b);
    case "subtract":
      return String(a - b);
    case "multiply":
      return String(a * b);
    case "divide":
      return b === 0 ? "除数不能为0" : String(a / b);
    default:
      return "未知类型的计算";
  }
};

const calculator = tool(func, {
  name: "calculator",
  description: "基本的数学运算",
  schema,
});

export default calculator;

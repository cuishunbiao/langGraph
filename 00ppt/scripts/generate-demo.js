import { createPresentationGraph } from "../src/bootstrap.js";

const graph = createPresentationGraph();
const topic = process.argv.slice(2).join(" ") || "LangGraph 入门：用状态图编排 AI 工作流";

console.log(`正在为主题“${topic}”生成三页 PPT...`);
const result = await graph.invoke({
  topic,
  audience: "初学者"
});

console.log(JSON.stringify({
  taskId: result.taskId,
  model: result.model,
  topic: result.topic,
  title: result.presentation.title,
  file: result.uploaded.file,
  size: result.uploaded.size,
  downloadUrl: result.uploaded.downloadUrl
}, null, 2));

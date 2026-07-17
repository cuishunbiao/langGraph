import path from "node:path";
import { randomUUID } from "node:crypto";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { renderPpt } from "../ppt/ppt-renderer.js";

// Graph 的共享状态：每个节点读取已有字段，只返回自己新增的字段。
const PptState = Annotation.Root({
  topic: Annotation(),
  audience: Annotation(),
  taskId: Annotation(),
  model: Annotation(),
  presentation: Annotation(),
  fileName: Annotation(),
  outputFile: Annotation(),
  uploaded: Annotation()
});

export function createPptGraph({ planner, storage, outputDir }) {
  async function planContent(state) {
    if (typeof state.topic !== "string" || !state.topic.trim()) {
      throw new Error("topic 不能为空");
    }
    const presentation = await planner.plan({
      topic: state.topic.trim(),
      audience: state.audience || "普通职场人士"
    });
    return {
      taskId: randomUUID(),
      model: planner.llm.model,
      presentation
    };
  }

  async function buildPpt(state) {
    const fileName = `ollama-ppt-${state.taskId}.pptx`;
    const outputFile = path.join(outputDir, fileName);
    await renderPpt(state.presentation, outputFile);
    return { fileName, outputFile };
  }

  async function publishPpt(state) {
    const uploaded = await storage.upload(state.outputFile, state.fileName);
    return { uploaded };
  }

  return new StateGraph(PptState)
    .addNode("plan_content", planContent)
    .addNode("build_ppt", buildPpt)
    .addNode("publish_ppt", publishPpt)
    .addEdge(START, "plan_content")
    .addEdge("plan_content", "build_ppt")
    .addEdge("build_ppt", "publish_ppt")
    .addEdge("publish_ppt", END)
    .compile();
}

const SYSTEM_PROMPT = `你是一个 PPT 内容规划 Agent。你只输出合法 JSON，不输出 Markdown。
你的任务是把用户主题规划为恰好 3 页中文演示文稿。
第 1 页是封面，第 2 页提炼 4 个核心观点，第 3 页给出 5 个步骤、阶段或建议。
每页文字要短，适合 16:9 商务演示，禁止编造具体统计数字。`;

function validatePresentation(input) {
  if (!input || typeof input !== "object") throw new Error("PPT 规划必须是对象");
  if (!Array.isArray(input.slides) || input.slides.length !== 3) {
    throw new Error("PPT 规划必须恰好包含 3 页");
  }

  const layouts = ["cover", "cards", "flow"];
  input.slides.forEach((slide, index) => {
    if (slide.layout !== layouts[index]) {
      throw new Error(`第 ${index + 1} 页 layout 必须是 ${layouts[index]}`);
    }
    if (typeof slide.title !== "string" || !slide.title.trim()) {
      throw new Error(`第 ${index + 1} 页缺少标题`);
    }
    slide.subtitle = String(slide.subtitle ?? "");
    slide.items = Array.isArray(slide.items)
      ? slide.items.slice(0, index === 1 ? 4 : 5).map((item) => ({
          title: String(item?.title ?? "").slice(0, 28),
          description: String(item?.description ?? "").slice(0, 70)
        }))
      : [];
  });

  return {
    title: String(input.title ?? input.slides[0].title).slice(0, 60),
    slides: input.slides
  };
}

export class PptAgent {
  constructor({ llm }) {
    this.llm = llm;
  }

  async plan({ topic, audience = "软件开发团队" }) {
    const prompt = `请围绕以下主题生成三页 PPT：${topic}\n受众：${audience}\n
严格返回这个 JSON 结构：
{
  "title": "总标题",
  "slides": [
    {"layout":"cover","title":"标题","subtitle":"副标题","items":[]},
    {"layout":"cards","title":"核心内容标题","subtitle":"一句话说明","items":[
      {"title":"观点名称","description":"观点说明"}
    ]},
    {"layout":"flow","title":"流程标题","subtitle":"一句话说明","items":[
      {"title":"步骤名","description":"步骤说明"}
    ]}
  ]
}
第 2 页给出 4 个互不重复的核心观点；第 3 页给出 5 个有顺序的步骤、阶段或建议。
标题要直接体现主题，不要使用“核心内容”“步骤或阶段”这类占位词。`;

    return validatePresentation(
      await this.llm.chatJson({ system: SYSTEM_PROMPT, prompt })
    );
  }
}

export class OllamaClient {
  constructor({ baseUrl, model, timeoutMs = 180_000 }) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.model = model;
    this.timeoutMs = timeoutMs;
  }

  async chatJson({ system, prompt }) {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        stream: false,
        think: false,
        format: "json",
        keep_alive: "5m",
        options: {
          temperature: 0.1,
          num_ctx: 4096,
          num_predict: 900
        },
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt }
        ]
      }),
      signal: AbortSignal.timeout(this.timeoutMs)
    });

    if (!response.ok) {
      throw new Error(`Ollama 请求失败：${response.status} ${await response.text()}`);
    }

    const payload = await response.json();
    const content = payload?.message?.content;
    if (!content) throw new Error("Ollama 没有返回可用内容");

    try {
      return JSON.parse(content);
    } catch {
      throw new Error(`Ollama 返回的内容不是合法 JSON：${content.slice(0, 200)}`);
    }
  }
}

# LangGraph PPT 生成器

这是一个用来学习 LangGraph 的最小项目：输入一个主题，本地 Ollama 生成内容，PptxGenJS 生成三页 PPT。

## 先理解这一张图

```text
输入主题
   ↓
plan_content   调用 Ollama，生成三页结构化内容
   ↓
build_ppt      把内容渲染成 .pptx 文件
   ↓
publish_ppt    复制到下载目录并返回 URL
```

这三个节点定义在 `src/graph/ppt-graph.js`。每个节点都接收同一个 `state`，并返回自己新增的数据：

```js
const result = await graph.invoke({
  topic: "LangGraph 入门",
  audience: "初学者"
});
```

状态会依次增加：

```text
topic
  → presentation
  → outputFile
  → uploaded.downloadUrl
```

## 目录

```text
src/graph/ppt-graph.js       LangGraph 主流程，建议先看
src/agent/ppt-agent.js       提示词和模型输出校验
src/llm/ollama-client.js     调用本地 Ollama
src/ppt/ppt-renderer.js      把内容画成 PPT
src/storage/local-storage.js 把文件放到下载目录
src/bootstrap.js             创建并组装 Graph
src/server.js                HTTP 接口
```

## 运行

要求 Node.js 20+，并确保 Ollama 已启动且已经安装模型：

```bash
ollama list
npm install
```

直接输入主题生成：

```bash
npm run generate -- "人工智能如何改变软件开发"
```

文件会生成到 `output/`，同时复制到 `public/files/`。

也可以启动 HTTP 服务：

```bash
npm start
```

然后请求：

```bash
curl -X POST http://127.0.0.1:3000/api/presentations \
  -H 'content-type: application/json' \
  -d '{"topic":"人工智能如何改变软件开发","audience":"技术管理者"}'
```

## 当前刻意保留的限制

为了容易学习，当前固定生成三页：

1. 封面
2. 四个核心观点
3. 五个步骤、阶段或建议

后续可以在 Graph 中增加“大纲审核”“选择版式”“搜索图片”等节点，而不需要推翻现有流程。

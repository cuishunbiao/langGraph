import fs from "node:fs/promises";
import path from "node:path";
import pptxgen from "pptxgenjs";

// PptxGenJS v4 在 ESM 模式下把形状枚举挂在实例上。
const SHAPE = new pptxgen().ShapeType;

const C = {
  navy: "0B1220",
  panel: "121C2F",
  cyan: "37D5D6",
  blue: "4C7DFF",
  white: "F8FAFC",
  muted: "9BA9BD",
  ink: "152033",
  pale: "EFF4FA",
  line: "D7E1ED"
};

// PptxGenJS 写文件时会转换阴影参数，因此每个形状必须使用新对象。
const createShadow = () => ({
  type: "outer",
  color: "9AA8BA",
  opacity: 0.18,
  blur: 2,
  angle: 45,
  offset: 2
});

function addHeader(slide, title, subtitle, page) {
  slide.addText(String(page).padStart(2, "0"), {
    x: 0.6, y: 0.38, w: 0.45, h: 0.25, fontFace: "Aptos", fontSize: 10,
    color: C.blue, bold: true, margin: 0
  });
  slide.addText(title, {
    x: 1.15, y: 0.27, w: 8.8, h: 0.48, fontFace: "Microsoft YaHei",
    fontSize: 25, bold: true, color: C.ink, margin: 0, breakLine: false, fit: "shrink"
  });
  slide.addText(subtitle, {
    x: 1.15, y: 0.83, w: 10.8, h: 0.3, fontFace: "Microsoft YaHei",
    fontSize: 10.5, color: "607087", margin: 0, fit: "shrink"
  });
  slide.addShape(SHAPE.line, {
    x: 0.6, y: 1.3, w: 12.1, h: 0, line: { color: C.line, width: 1 }
  });
}

function renderCover(slide, spec) {
  slide.background = { color: C.navy };
  slide.addShape(SHAPE.ellipse, {
    x: 9.2, y: -1.4, w: 5.2, h: 5.2,
    fill: { color: C.blue, transparency: 82 }, line: { color: C.blue, transparency: 100 }
  });
  slide.addShape(SHAPE.ellipse, {
    x: 10.4, y: 4.4, w: 3.8, h: 3.8,
    fill: { color: C.cyan, transparency: 86 }, line: { color: C.cyan, transparency: 100 }
  });
  slide.addShape(SHAPE.roundRect, {
    x: 0.75, y: 0.65, w: 2.25, h: 0.42, rectRadius: 0.06,
    fill: { color: C.cyan, transparency: 86 }, line: { color: C.cyan, transparency: 100 }
  });
  slide.addText("LOCAL AI · PPT AGENT", {
    x: 0.95, y: 0.78, w: 1.85, h: 0.16, fontFace: "Aptos", fontSize: 9,
    bold: true, color: C.cyan, charSpacing: 1.1, align: "center", margin: 0
  });
  slide.addText(spec.title, {
    x: 0.78, y: 2.0, w: 9.8, h: 1.15, fontFace: "Microsoft YaHei",
    fontSize: 34, bold: true, color: C.white, margin: 0, breakLine: false, fit: "shrink"
  });
  slide.addText(spec.subtitle, {
    x: 0.82, y: 3.35, w: 7.7, h: 0.6, fontFace: "Microsoft YaHei",
    fontSize: 16, color: C.muted, margin: 0.02, breakLine: false, fit: "shrink"
  });
  slide.addShape(SHAPE.line, {
    x: 0.82, y: 4.32, w: 1.35, h: 0, line: { color: C.cyan, width: 4, beginArrowType: "none" }
  });
  slide.addText("qwen3.5:9b  /  Ollama  /  PptxGenJS", {
    x: 0.82, y: 4.55, w: 5.8, h: 0.3, fontFace: "Aptos", fontSize: 11,
    color: "718299", margin: 0
  });
  slide.addText("MVP · 3 SLIDES", {
    x: 10.2, y: 6.7, w: 2.3, h: 0.25, fontFace: "Aptos", fontSize: 9,
    bold: true, color: C.muted, align: "right", charSpacing: 1.1, margin: 0
  });
}

function renderCards(slide, spec) {
  slide.background = { color: "F8FAFD" };
  addHeader(slide, spec.title, spec.subtitle, 2);
  const items = spec.items.slice(0, 4);
  const xs = [0.75, 3.9, 7.05, 10.2];
  items.forEach((item, index) => {
    if (index < items.length - 1) {
      slide.addShape(SHAPE.chevron, {
        x: xs[index] + 2.72, y: 3.12, w: 0.35, h: 0.55,
        fill: { color: C.blue, transparency: 30 }, line: { color: C.blue, transparency: 100 }
      });
    }
    slide.addShape(SHAPE.roundRect, {
      x: xs[index], y: 2.0, w: 2.5, h: 3.0, rectRadius: 0.08,
      fill: { color: "FFFFFF" },
      line: { color: "E1E8F1", width: 1 },
      shadow: createShadow()
    });
    slide.addShape(SHAPE.ellipse, {
      x: xs[index] + 0.2, y: 2.25, w: 0.58, h: 0.58,
      fill: { color: index % 2 ? C.cyan : C.blue, transparency: 6 },
      line: { color: "FFFFFF", transparency: 100 }
    });
    slide.addText(String(index + 1).padStart(2, "0"), {
      x: xs[index] + 0.2, y: 2.43, w: 0.58, h: 0.16, fontFace: "Aptos",
      fontSize: 10, bold: true, color: "FFFFFF", align: "center", margin: 0
    });
    slide.addText(item.title, {
      x: xs[index] + 0.2, y: 3.08, w: 2.05, h: 0.55, fontFace: "Microsoft YaHei",
      fontSize: 17, bold: true, color: C.ink, margin: 0, valign: "mid", fit: "shrink"
    });
    slide.addText(item.description, {
      x: xs[index] + 0.2, y: 3.82, w: 2.05, h: 0.78, fontFace: "Microsoft YaHei",
      fontSize: 10.5, color: "66758A", margin: 0, valign: "top", breakLine: false, fit: "shrink"
    });
  });
  slide.addShape(SHAPE.roundRect, {
    x: 2.1, y: 5.65, w: 9.1, h: 0.66, rectRadius: 0.06,
    fill: { color: "EAF0FF" }, line: { color: "EAF0FF" }
  });
  slide.addText("核心原则：模型负责内容决策，代码负责版式与文件，存储层负责最终交付。", {
    x: 2.35, y: 5.88, w: 8.6, h: 0.2, fontFace: "Microsoft YaHei",
    fontSize: 11.5, bold: true, color: "3159B8", align: "center", margin: 0, fit: "shrink"
  });
}

function renderFlow(slide, spec) {
  slide.background = { color: C.navy };
  slide.addText("03", {
    x: 0.65, y: 0.42, w: 0.5, h: 0.25, fontFace: "Aptos", fontSize: 10,
    color: C.cyan, bold: true, margin: 0
  });
  slide.addText(spec.title, {
    x: 1.2, y: 0.3, w: 9.8, h: 0.5, fontFace: "Microsoft YaHei",
    fontSize: 25, bold: true, color: C.white, margin: 0, fit: "shrink"
  });
  slide.addText(spec.subtitle, {
    x: 1.2, y: 0.9, w: 10.5, h: 0.3, fontFace: "Microsoft YaHei",
    fontSize: 10.5, color: C.muted, margin: 0, fit: "shrink"
  });

  const items = spec.items.slice(0, 5);
  const startX = 0.78;
  const gap = 0.28;
  const cardW = 2.25;
  items.forEach((item, index) => {
    const x = startX + index * (cardW + gap);
    if (index < items.length - 1) {
      slide.addShape(SHAPE.line, {
        x: x + cardW, y: 3.25, w: gap, h: 0,
        line: { color: C.cyan, width: 1.5, endArrowType: "triangle" }
      });
    }
    slide.addShape(SHAPE.roundRect, {
      x, y: 2.0, w: cardW, h: 2.65, rectRadius: 0.06,
      fill: { color: C.panel }, line: { color: index === 4 ? C.cyan : "263650", width: 1.1 }
    });
    slide.addText(String(index + 1).padStart(2, "0"), {
      x: x + 0.18, y: 2.22, w: 0.6, h: 0.3, fontFace: "Aptos", fontSize: 17,
      bold: true, color: C.cyan, margin: 0
    });
    slide.addText(item.title, {
      x: x + 0.18, y: 2.87, w: 1.88, h: 0.48, fontFace: "Microsoft YaHei",
      fontSize: 15.5, bold: true, color: C.white, margin: 0, fit: "shrink"
    });
    slide.addText(item.description, {
      x: x + 0.18, y: 3.5, w: 1.88, h: 0.75, fontFace: "Microsoft YaHei",
      fontSize: 9.8, color: C.muted, margin: 0, valign: "top", fit: "shrink"
    });
  });
  slide.addText("REQUEST", {
    x: 0.8, y: 5.38, w: 1.2, h: 0.22, fontFace: "Aptos", fontSize: 9,
    bold: true, color: "607087", charSpacing: 1, margin: 0
  });
  slide.addShape(SHAPE.line, {
    x: 0.8, y: 5.85, w: 11.7, h: 0,
    line: { color: "324158", width: 2, endArrowType: "triangle" }
  });
  slide.addText("DOWNLOAD URL", {
    x: 10.7, y: 6.08, w: 1.8, h: 0.22, fontFace: "Aptos", fontSize: 9,
    bold: true, color: C.cyan, align: "right", charSpacing: 1, margin: 0
  });
}

export async function renderPpt(presentation, outputFile) {
  await fs.mkdir(path.dirname(outputFile), { recursive: true });

  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Ollama PPT Agent";
  pptx.company = "Local AI MVP";
  pptx.subject = presentation.title;
  pptx.title = presentation.title;
  pptx.lang = "zh-CN";
  pptx.theme = {
    headFontFace: "Microsoft YaHei",
    bodyFontFace: "Microsoft YaHei",
    lang: "zh-CN"
  };

  presentation.slides.forEach((spec) => {
    const slide = pptx.addSlide();
    if (spec.layout === "cover") renderCover(slide, spec);
    if (spec.layout === "cards") renderCards(slide, spec);
    if (spec.layout === "flow") renderFlow(slide, spec);
  });

  await pptx.writeFile({ fileName: outputFile });
  return outputFile;
}

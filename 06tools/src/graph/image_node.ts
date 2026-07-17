// 图片节点
import type { TArticle } from "../state.ts";
import * as fs from "fs";

async function downloadImage(url: string, filePath: string) {
    const response = await fetch(url)

    if(!response.ok) throw new Error('下载图片失败');
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer))
}


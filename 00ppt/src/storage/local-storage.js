import fs from "node:fs/promises";
import path from "node:path";

export class LocalStorage {
  constructor({ uploadDir, publicBaseUrl }) {
    this.uploadDir = uploadDir;
    this.publicBaseUrl = publicBaseUrl.replace(/\/$/, "");
  }

  async upload(localFile, objectName) {
    await fs.mkdir(this.uploadDir, { recursive: true });
    const safeName = path.basename(objectName);
    const target = path.join(this.uploadDir, safeName);
    await fs.copyFile(localFile, target);
    const stat = await fs.stat(target);
    return {
      file: target,
      size: stat.size,
      downloadUrl: `${this.publicBaseUrl}/files/${encodeURIComponent(safeName)}`
    };
  }
}

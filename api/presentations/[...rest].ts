import { createServer } from "../../server/index.js";

const app = createServer();

export default async function vercelHandler(req: any, res: any) {
  // Normalize URL to mount under /api/presentations preserving query string
  if (typeof req.url === "string") {
    const q = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
    const p = req.url.includes("?")
      ? req.url.slice(0, req.url.indexOf("?"))
      : req.url;
    let tail = p
      .replace(/^\/api\/presentations/, "")
      .replace(/^\/presentations/, "");
    if (tail && !tail.startsWith("/")) tail = "/" + tail;
    req.url = "/api/presentations" + (tail || "") + q;
  }

  return new Promise<void>((resolve) => {
    res.on("finish", () => resolve());
    res.on("close", () => resolve());
    app(req, res);
  });
}

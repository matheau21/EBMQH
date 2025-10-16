import { createServer } from "../server/index.js";

const app = createServer();

export default async function vercelHandler(req: any, res: any) {
  if (typeof req.url === "string") {
    // Extract the path after /admin (e.g., /admin/login -> /login)
    const q = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
    const p = req.url.includes("?")
      ? req.url.slice(0, req.url.indexOf("?"))
      : req.url;

    // Remove /admin or /api/admin from the path to get the tail
    let tail = p.replace(/^\/api\/admin/, "").replace(/^\/admin/, "");

    // Ensure tail starts with /
    if (tail && !tail.startsWith("/")) tail = "/" + tail;
    if (!tail) tail = "/";

    // Reconstruct as /api/admin{tail}
    req.url = "/api/admin" + tail + q;
  }

  return new Promise<void>((resolve) => {
    res.on("finish", () => resolve());
    res.on("close", () => resolve());
    app(req, res);
  });
}

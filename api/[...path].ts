import { createServer } from "../server/index.js";

const app = createServer();

export default async function vercelHandler(req: any, res: any) {
  // Skip admin routes - they should be handled by api/admin/[...rest].ts
  if (typeof req.url === "string" && req.url.includes("/admin")) {
    return res.status(404).json({ error: "Not found" });
  }

  // Normalize URL so our Express app (which uses /api/*) works whether
  // Vercel provides req.url as "/api/..." or stripped "/...".
  if (typeof req.url === "string" && !req.url.startsWith("/api/")) {
    req.url = "/api" + (req.url.startsWith("/") ? req.url : "/" + req.url);
  }

  return new Promise<void>((resolve) => {
    res.on("finish", () => resolve());
    res.on("close", () => resolve());
    app(req, res);
  });
}

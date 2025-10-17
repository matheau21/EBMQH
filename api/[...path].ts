import { createServer } from "../server/index.js";

const app = createServer();

export default async function vercelHandler(req: any, res: any) {
  // Log for debugging on Vercel
  console.log("[vercel-handler] req.url:", req.url, "method:", req.method);

  // Normalize URL so our Express app (which uses /api/*) works whether
  // Vercel provides req.url as "/api/..." or stripped "/...".
  if (typeof req.url === "string" && !req.url.startsWith("/api/")) {
    req.url = "/api" + (req.url.startsWith("/") ? req.url : "/" + req.url);
  }

  console.log("[vercel-handler] normalized url:", req.url);

  return new Promise<void>((resolve) => {
    res.on("finish", () => resolve());
    res.on("close", () => resolve());
    app(req, res);
  });
}

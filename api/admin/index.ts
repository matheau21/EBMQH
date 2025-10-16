import { createServer } from "../../server/index.js";

const app = createServer();

export default async function vercelHandler(req: any, res: any) {
  if (typeof req.url === "string") {
    const q = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
    req.url = "/api/admin" + q;
  }

  return new Promise<void>((resolve) => {
    res.on("finish", () => resolve());
    res.on("close", () => resolve());
    app(req, res);
  });
}

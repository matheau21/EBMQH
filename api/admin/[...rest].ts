import serverless from "serverless-http";
import express from "express";
import { createServer } from "../../server/index";

const app = createServer();
const gateway = express();

const MOUNT = "/api/admin";

gateway.use((req, _res, next) => {
  if (typeof req.url === "string") {
    const q = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
    const p = req.url.includes("?")
      ? req.url.slice(0, req.url.indexOf("?"))
      : req.url;
    let tail = p.replace(/^\/api\/admin/, "").replace(/^\/admin/, "");
    if (tail && !tail.startsWith("/")) tail = "/" + tail;
    req.url = MOUNT + (tail || "") + q;
  }
  next();
});

gateway.use(app);

const handler = serverless(gateway);
export default async function vercelHandler(req: any, res: any) {
  return handler(req, res);
}

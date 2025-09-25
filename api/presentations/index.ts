import serverless from "serverless-http";
import express from "express";
import { createServer } from "../../server/index";

const app = createServer();
const gateway = express();

// Force exact mount
const MOUNT = "/api/presentations";

gateway.use((req, _res, next) => {
  if (typeof req.url === "string") {
    const q = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
    req.url = MOUNT + q;
  }
  next();
});

gateway.use(app);

const handler = serverless(gateway);
export default async function vercelHandler(req: any, res: any) {
  return handler(req, res);
}

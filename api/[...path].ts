import serverless from "serverless-http";
import express from "express";
import { createServer } from "../server/index.js";

const app = createServer();
const gateway = express();

// Normalize URL so our Express app (which uses /api/*) works whether
// Vercel provides req.url as "/api/..." or stripped "/...".

gateway.use((req, _res, next) => {
  if (typeof req.url === "string" && !req.url.startsWith("/api/")) {
    req.url = "/api" + (req.url.startsWith("/") ? req.url : "/" + req.url);
  }
  next();
});

gateway.use(app);

const handler = serverless(gateway);

export default async function vercelHandler(req: any, res: any) {
  return handler(req, res);
}

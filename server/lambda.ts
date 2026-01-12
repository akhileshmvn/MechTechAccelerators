import serverless from "serverless-http";
import { app, ensureRoutes } from "./app";

let cachedHandler: ReturnType<typeof serverless> | null = null;

export const handler = async (event: any, context: any) => {
  await ensureRoutes();
  if (!cachedHandler) {
    cachedHandler = serverless(app);
  }
  return cachedHandler(event, context);
};

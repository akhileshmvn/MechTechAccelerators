import serverlessExpress from "@vendia/serverless-express";
import { app, ensureRoutes } from "./app";

let cachedHandler: ReturnType<typeof serverlessExpress> | null = null;

export const handler = async (...args: Parameters<ReturnType<typeof serverlessExpress>>) => {
  await ensureRoutes();
  if (!cachedHandler) {
    cachedHandler = serverlessExpress({ app });
  }
  return cachedHandler(...args);
};

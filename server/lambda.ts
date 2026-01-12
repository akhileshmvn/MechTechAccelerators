import serverlessExpress from "@vendia/serverless-express";
import { app, ensureRoutes } from "./app";

let cachedHandler: ReturnType<typeof serverlessExpress> | null = null;

export const handler = async (event: any, context: any, callback?: any) => {
  await ensureRoutes();
  if (!cachedHandler) {
    cachedHandler = serverlessExpress({ app });
  }
  return cachedHandler(event, context, callback);
};

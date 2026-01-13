import serverless from "serverless-http";
import { app, ensureRoutes } from "./app";

let cachedHandler: ReturnType<typeof serverless> | null = null;

export const handler = async (event: any, context: any) => {
  const stage = event?.requestContext?.stage;
  if (stage && typeof event.rawPath === "string" && event.rawPath.startsWith(`/${stage}/`)) {
    event.rawPath = event.rawPath.slice(stage.length + 1) || "/";
  }
  if (stage && typeof event.path === "string" && event.path.startsWith(`/${stage}/`)) {
    event.path = event.path.slice(stage.length + 1) || "/";
  }

  await ensureRoutes();
  if (!cachedHandler) {
    cachedHandler = serverless(app);
  }
  return cachedHandler(event, context);
};

import type { Express } from "express";
import { createServer, type Server } from "http";
import { and, eq, sql } from "drizzle-orm";
import { getDb } from "./db";
import { cernerCredentials } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const seedCredentials = async () => {
    const db = getDb();
    const existing = await db
      .select({ serialNo: cernerCredentials.serialNo })
      .from(cernerCredentials)
      .limit(1);
    if (existing.length > 0) return;

    await db.insert(cernerCredentials).values([
      {
        serialNo: 1,
        user: "DBA",
        environment: "Cert",
        username: "TestDBA2",
        password: "Cerner123",
      },
      {
        serialNo: 2,
        user: "NP",
        environment: "Cert",
        username: "AUTONP1",
        password: "Cerner1234",
      },
    ]);
  };

  const BASIC_USER = "eggplantuser";
  const BASIC_PASS = "Davita@123";

  const parseBasicAuth = (header?: string) => {
    if (!header || !header.startsWith("Basic ")) return null;
    const base64 = header.slice("Basic ".length).trim();
    let decoded = "";
    try {
      decoded = Buffer.from(base64, "base64").toString("utf8");
    } catch {
      return null;
    }
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex === -1) return null;
    return {
      user: decoded.slice(0, separatorIndex),
      pass: decoded.slice(separatorIndex + 1),
    };
  };

  app.get("/api/GetCernerCredentials", async (req, res) => {
    const auth = parseBasicAuth(req.headers.authorization);
    if (!auth || auth.user !== BASIC_USER || auth.pass !== BASIC_PASS) {
      res.setHeader("WWW-Authenticate", 'Basic realm="GetCernerCredentials"');
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = String(req.query.user || "").trim();
    const environment = String(req.query.environment || "").trim();
    if (!user || !environment) {
      return res.status(400).json({ message: "Missing required query parameters: user, environment" });
    }

    try {
      await seedCredentials();
      const db = getDb();
      const rows = await db
        .select()
        .from(cernerCredentials)
        .where(
          and(
            sql`lower(${cernerCredentials.user}) = ${user.toLowerCase()}`,
            sql`lower(${cernerCredentials.environment}) = ${environment.toLowerCase()}`
          )
        )
        .limit(1);

      const match = rows[0];
      if (!match) {
        return res.status(404).json({ message: "Credentials not found" });
      }

      return res.status(200).json({
        user: match.user,
        environment: match.environment,
        username: match.username,
        password: match.password,
      });
    } catch (err) {
      console.error("Failed to fetch credentials", err);
      const message =
        err instanceof Error && err.message.includes("DATABASE_URL")
          ? "DATABASE_URL is not configured for database access."
          : "Internal Server Error";
      return res.status(500).json({ message });
    }
  });

  return httpServer;
}

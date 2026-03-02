import type { Express } from "express";
import { createServer, type Server } from "http";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { and, eq, sql } from "drizzle-orm";
import { getDb } from "./db";
import { cernerCredentials } from "@shared/schema";

const BASE25_LETTERS = "ABCDEFGHJKLMNOPQRSTUVWXYZ";
const BASE25_INDEX = Object.fromEntries(
  BASE25_LETTERS.split("").map((char, index) => [char, index]),
);
const TRACKED_ENVIRONMENTS = ["Build", "Release", "Cert"] as const;
type TrackedEnvironment = (typeof TRACKED_ENVIRONMENTS)[number];
const defaultSequence: Record<TrackedEnvironment, string> = {
  Build: "AAAA",
  Release: "AAAA",
  Cert: "AAAA",
};
const sequenceFilePath = path.resolve(
  process.cwd(),
  "data",
  "patient-name-sequence.json",
);
const inMemorySequence: Record<TrackedEnvironment, string> = {
  ...defaultSequence,
};
let sequenceInitialized = false;

const isTrackedEnvironment = (value: string): value is TrackedEnvironment =>
  (TRACKED_ENVIRONMENTS as readonly string[]).includes(value);

const isValidBase25Name = (value: string) =>
  value.length === 4 &&
  /^[A-Z]{4}$/.test(value) &&
  value.split("").every((char) => char in BASE25_INDEX);

const decodeBase25 = (value: string) => {
  let total = 0;
  for (const char of value) {
    total = total * 25 + (BASE25_INDEX[char] ?? 0);
  }
  return total;
};

const encodeBase25 = (value: number) => {
  let n = value;
  const out = ["A", "A", "A", "A"];
  for (let i = 3; i >= 0; i -= 1) {
    out[i] = BASE25_LETTERS[n % 25];
    n = Math.floor(n / 25);
  }
  return n > 0 ? null : out.join("");
};

const loadSequenceFromFile = async () => {
  if (sequenceInitialized) return;

  try {
    const raw = await readFile(sequenceFilePath, "utf-8");
    const parsed = JSON.parse(raw) as Partial<Record<TrackedEnvironment, string>>;
    for (const env of TRACKED_ENVIRONMENTS) {
      const candidate = String(parsed?.[env] || "").toUpperCase().trim();
      if (isValidBase25Name(candidate)) {
        inMemorySequence[env] = candidate;
      }
    }
  } catch {
    // Keep defaults if file is missing/invalid; we'll write on first update.
  } finally {
    sequenceInitialized = true;
  }
};

const saveSequenceToFile = async () => {
  await mkdir(path.dirname(sequenceFilePath), { recursive: true });
  await writeFile(
    sequenceFilePath,
    JSON.stringify(inMemorySequence, null, 2),
    "utf-8",
  );
};

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

  app.get("/api/patient-name-sequence", async (_req, res) => {
    await loadSequenceFromFile();
    return res.status(200).json(inMemorySequence);
  });

  app.post("/api/patient-name-sequence/advance", async (req, res) => {
    await loadSequenceFromFile();

    const payload = req.body as {
      batches?: Array<{ environment: string; startName: string; count: number }>;
    };
    const batches = Array.isArray(payload?.batches) ? payload.batches : [];

    if (batches.length === 0) {
      return res.status(400).json({ message: "batches is required" });
    }

    const nextByEnv: Partial<Record<TrackedEnvironment, string>> = {};
    for (const batch of batches) {
      if (!isTrackedEnvironment(batch.environment)) continue;
      const startName = String(batch.startName || "").toUpperCase().trim();
      const count = Number(batch.count);

      if (!isValidBase25Name(startName)) {
        return res.status(400).json({
          message: `Invalid startName for ${batch.environment}: ${batch.startName}`,
        });
      }
      if (!Number.isInteger(count) || count <= 0) {
        return res.status(400).json({
          message: `Invalid count for ${batch.environment}: ${batch.count}`,
        });
      }

      const nextEncoded = encodeBase25(decodeBase25(startName) + count);
      if (!nextEncoded) {
        return res.status(400).json({
          message: `Name sequence overflow for ${batch.environment}`,
        });
      }

      const current = nextByEnv[batch.environment];
      if (!current || decodeBase25(nextEncoded) > decodeBase25(current)) {
        nextByEnv[batch.environment] = nextEncoded;
      }
    }

    const entries = Object.entries(nextByEnv) as Array<[TrackedEnvironment, string]>;
    if (entries.length === 0) {
      return res.status(200).json(inMemorySequence);
    }

    for (const [environment, nextStartName] of entries) {
      inMemorySequence[environment] = nextStartName;
    }

    try {
      await saveSequenceToFile();
    } catch (err) {
      console.error("Failed to persist patient name sequence file", err);
      return res.status(500).json({
        message: "Failed to persist patient name sequence.",
      });
    }

    return res.status(200).json(inMemorySequence);
  });

  return httpServer;
}

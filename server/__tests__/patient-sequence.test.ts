/**
 * Automated tests for the patient-name-sequence API endpoints.
 * Run with: npx tsx server/__tests__/patient-sequence.test.ts
 */

const BASE_URL = "http://localhost:5001";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`✓ ${name}`);
  } catch (error) {
    results.push({
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
    console.log(`✗ ${name}: ${error}`);
  }
}

async function runTests() {
  console.log("Running patient-name-sequence API tests...\n");

  // Test 1: GET /api/patient-name-sequence returns current sequence
  await test(
    "GET /api/patient-name-sequence returns current sequence",
    async () => {
      const response = await fetch(`${BASE_URL}/api/patient-name-sequence`);
      assert(response.ok, `Expected status 200, got ${response.status}`);

      const data = (await response.json()) as Record<string, string>;
      assert(data.Build !== undefined, "Build sequence should be defined");
      assert(data.Release !== undefined, "Release sequence should be defined");
      assert(data.Cert !== undefined, "Cert sequence should be defined");
      assert(data.Build.length === 4, "Build sequence should be 4 characters");
      assert(/^[A-Z]{4}$/.test(data.Build), "Build sequence should match base-25 format");
    }
  );

  // Test 2: POST /api/patient-name-sequence/advance advances the sequence
  await test(
    "POST /api/patient-name-sequence/advance updates Build sequence",
    async () => {
      // First, get current sequence
      const getResponse = await fetch(`${BASE_URL}/api/patient-name-sequence`);
      const currentSeq = (await getResponse.json()) as Record<string, string>;
      const initialBuild = currentSeq.Build;

      // Advance Build by 5
      const advanceResponse = await fetch(
        `${BASE_URL}/api/patient-name-sequence/advance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            batches: [{ environment: "Build", startName: initialBuild, count: 5 }],
          }),
        }
      );
      assert(advanceResponse.ok, `Expected status 200, got ${advanceResponse.status}`);

      const updated = (await advanceResponse.json()) as Record<string, string>;
      assert(updated.Build !== initialBuild, "Build sequence should have changed after advance");

      // Verify the new sequence is 5 positions ahead
      const decodeBase25 = (s: string) => {
        const letters = "ABCDEFGHJKLMNOPQRSTUVWXYZ";
        let total = 0;
        for (const char of s) {
          total = total * 25 + letters.indexOf(char);
        }
        return total;
      };

      const initialValue = decodeBase25(initialBuild);
      const updatedValue = decodeBase25(updated.Build);
      assertEqual(updatedValue, initialValue + 5, "Build sequence should advance by 5");
    }
  );

  // Test 3: POST with multiple environments advances all of them
  await test(
    "POST /api/patient-name-sequence/advance with multiple environments",
    async () => {
      const getResponse = await fetch(`${BASE_URL}/api/patient-name-sequence`);
      const current = (await getResponse.json()) as Record<string, string>;

      const advanceResponse = await fetch(
        `${BASE_URL}/api/patient-name-sequence/advance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            batches: [
              { environment: "Build", startName: current.Build, count: 2 },
              { environment: "Release", startName: current.Release, count: 3 },
              { environment: "Cert", startName: current.Cert, count: 1 },
            ],
          }),
        }
      );
      assert(advanceResponse.ok, `Expected status 200, got ${advanceResponse.status}`);

      const updated = (await advanceResponse.json()) as Record<string, string>;
      assert(updated.Build !== current.Build, "Build should have advanced");
      assert(updated.Release !== current.Release, "Release should have advanced");
      assert(updated.Cert !== current.Cert, "Cert should have advanced");
    }
  );

  // Test 4: POST with invalid start name returns error
  await test(
    "POST /api/patient-name-sequence/advance rejects invalid start name",
    async () => {
      const response = await fetch(
        `${BASE_URL}/api/patient-name-sequence/advance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            batches: [{ environment: "Build", startName: "INVALID", count: 1 }],
          }),
        }
      );
      assert(response.status === 400, `Expected status 400, got ${response.status}`);

      const error = await response.json();
      assert(
        error.message && error.message.includes("Invalid startName"),
        "Error message should indicate invalid startName"
      );
    }
  );

  // Test 5: POST with invalid count returns error
  await test(
    "POST /api/patient-name-sequence/advance rejects invalid count",
    async () => {
      const response = await fetch(
        `${BASE_URL}/api/patient-name-sequence/advance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            batches: [{ environment: "Build", startName: "AAAA", count: -5 }],
          }),
        }
      );
      assert(response.status === 400, `Expected status 400, got ${response.status}`);
    }
  );

  // Test 6: POST with invalid environment is silently ignored
  await test(
    "POST /api/patient-name-sequence/advance silently ignores invalid environment",
    async () => {
      const getResponse = await fetch(`${BASE_URL}/api/patient-name-sequence`);
      const before = (await getResponse.json()) as Record<string, string>;

      const advanceResponse = await fetch(
        `${BASE_URL}/api/patient-name-sequence/advance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            batches: [{ environment: "InvalidEnv", startName: "AAAA", count: 5 }],
          }),
        }
      );
      assert(advanceResponse.ok, `Expected status 200, got ${advanceResponse.status}`);

      const after = (await advanceResponse.json()) as Record<string, string>;
      // Build, Release, and Cert should remain unchanged since no valid batch was provided
      assertEqual(after.Build, before.Build, "Build should not change");
      assertEqual(after.Release, before.Release, "Release should not change");
      assertEqual(after.Cert, before.Cert, "Cert should not change");
    }
  );

  // Test 7: POST with empty batches array is rejected
  await test(
    "POST /api/patient-name-sequence/advance rejects empty batches",
    async () => {
      const response = await fetch(
        `${BASE_URL}/api/patient-name-sequence/advance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ batches: [] }),
        }
      );
      assert(response.status === 400, `Expected status 400, got ${response.status}`);
    }
  );

  // Print summary
  console.log("\n" + "=".repeat(50));
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log(`Tests passed: ${passed}/${total}`);

  if (passed === total) {
    console.log("✓ All tests passed!");
    process.exit(0);
  } else {
    console.log("\n✗ Some tests failed:");
    results.filter((r) => !r.passed).forEach((r) => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Fatal error running tests:", err);
  process.exit(1);
});

import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, generationJobsTable, testSuitesTable, testCasesTable, requirementsTable, sourcesTable } from "@workspace/db";
import {
  TriggerGenerationBody,
  ListJobsResponse,
  ListJobsQueryParams,
  GetJobParams,
  GetJobResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function generateTestCode(framework: string, title: string, testType: string, category: string): string {
  const templates: Record<string, string> = {
    jest: `describe('${category}', () => {\n  test('${title}', async () => {\n    // Arrange\n    const input = { /* test input */ };\n\n    // Act\n    const result = await yourFunction(input);\n\n    // Assert\n    expect(result).toBeDefined();\n    expect(result.status).toBe(200);\n  });\n});`,
    pytest: `import pytest\n\ndef test_${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}():\n    # Arrange\n    input_data = {}  # test input\n\n    # Act\n    result = your_function(input_data)\n\n    # Assert\n    assert result is not None\n    assert result.status_code == 200`,
    playwright: `import { test, expect } from '@playwright/test';\n\ntest('${title}', async ({ page }) => {\n  // Navigate\n  await page.goto('/');\n\n  // Action\n  await page.click('[data-testid="submit-button"]');\n\n  // Assert\n  await expect(page.locator('[data-testid="result"]')).toBeVisible();\n});`,
    cypress: `describe('${category}', () => {\n  it('${title}', () => {\n    // Visit\n    cy.visit('/');\n\n    // Action\n    cy.get('[data-testid="submit-button"]').click();\n\n    // Assert\n    cy.get('[data-testid="result"]').should('be.visible');\n  });\n});`,
    postman: `pm.test('${title}', () => {\n  const response = pm.response.json();\n  pm.response.to.have.status(200);\n  pm.expect(response).to.have.property('data');\n  pm.expect(response.data).to.not.be.null;\n});`,
    junit: `@Test\npublic void test${title.replace(/[^a-zA-Z0-9]/g, '')}() {\n    // Arrange\n    var input = new TestInput();\n\n    // Act\n    var result = service.execute(input);\n\n    // Assert\n    assertNotNull(result);\n    assertEquals(200, result.getStatus());\n}`,
  };
  return templates[framework] ?? templates.jest;
}

async function runGenerationJob(jobId: number, projectId: number, framework: string, testTypes: string[]): Promise<void> {
  await db.update(generationJobsTable).set({ status: "running", progress: 10 }).where(eq(generationJobsTable.id, jobId));

  await new Promise(resolve => setTimeout(resolve, 500));

  const sources = await db.select().from(sourcesTable).where(eq(sourcesTable.projectId, projectId));

  await db.update(generationJobsTable).set({ progress: 40 }).where(eq(generationJobsTable.id, jobId));

  const testCaseTemplates = [
    { title: "Returns 200 for valid input", testType: "happy_path", category: "API Validation" },
    { title: "Returns 400 for missing required fields", testType: "negative", category: "Input Validation" },
    { title: "Returns 401 for unauthenticated requests", testType: "auth", category: "Authentication" },
    { title: "Returns 403 for unauthorized role", testType: "auth", category: "Authorization" },
    { title: "Returns 404 for non-existent resource", testType: "negative", category: "Resource Not Found" },
    { title: "Handles empty string input", testType: "boundary", category: "Boundary Values" },
    { title: "Handles maximum length string (255 chars)", testType: "boundary", category: "Boundary Values" },
    { title: "Handles null payload", testType: "boundary", category: "Boundary Values" },
    { title: "Rejects SQL injection in string fields", testType: "security", category: "Security" },
    { title: "Rejects XSS payload in input", testType: "security", category: "Security" },
    { title: "Handles concurrent requests without data corruption", testType: "negative", category: "Concurrency" },
    { title: "Returns 429 when rate limit exceeded", testType: "negative", category: "Rate Limiting" },
    { title: "Handles expired session token", testType: "auth", category: "Authentication" },
    { title: "Validates response schema matches contract", testType: "happy_path", category: "Schema Validation" },
    { title: "Handles oversized payload (>10MB)", testType: "boundary", category: "Boundary Values" },
    { title: "Returns correct pagination metadata", testType: "happy_path", category: "Pagination" },
    { title: "Handles network timeout gracefully", testType: "negative", category: "Network" },
    { title: "Validates required fields are present", testType: "negative", category: "Input Validation" },
  ];

  const filteredCases = testCaseTemplates.filter(tc => {
    if (testTypes.includes("edge_cases")) return true;
    if (testTypes.includes("unit") && ["happy_path", "negative", "boundary"].includes(tc.testType)) return true;
    if (testTypes.includes("integration") && ["happy_path", "negative", "auth"].includes(tc.testType)) return true;
    if (testTypes.includes("e2e") && tc.testType === "happy_path") return true;
    return false;
  });

  const suiteName = `${framework.charAt(0).toUpperCase() + framework.slice(1)} Suite — ${sources.map(s => s.name).join(", ") || "Generated Tests"}`;

  const [suite] = await db.insert(testSuitesTable).values({
    projectId,
    jobId,
    name: suiteName,
    framework,
    testCount: filteredCases.length,
    coverageScore: Math.round((85 + Math.random() * 12) * 10) / 10,
  }).returning();

  await db.update(generationJobsTable).set({ progress: 70 }).where(eq(generationJobsTable.id, jobId));

  for (const tc of filteredCases) {
    await db.insert(testCasesTable).values({
      testSuiteId: suite.id,
      title: tc.title,
      testType: tc.testType,
      category: tc.category,
      code: generateTestCode(framework, tc.title, tc.testType, tc.category),
    });
  }

  // Generate requirements from PRD sources
  const prdSources = sources.filter(s => s.sourceType === "prd");
  const reqTemplates = [
    { reqId: "REQ-001", title: "User authentication with valid credentials", description: "System must authenticate users with valid username and password" },
    { reqId: "REQ-002", title: "API returns paginated results", description: "All list endpoints must return paginated responses with metadata" },
    { reqId: "REQ-003", title: "Input validation on all endpoints", description: "All API endpoints must validate request body and return 400 on invalid input" },
    { reqId: "REQ-004", title: "Authorization checks per role", description: "Resources must be scoped to the requesting user's role and permissions" },
    { reqId: "REQ-005", title: "Rate limiting enforcement", description: "API must enforce rate limits per client and return 429 when exceeded" },
  ];

  if (prdSources.length > 0) {
    for (const req of reqTemplates) {
      const existing = await db.select().from(requirementsTable)
        .where(eq(requirementsTable.reqId, req.reqId));
      if (existing.length === 0) {
        const testCount = Math.floor(Math.random() * 4) + 1;
        const statuses = ["covered", "partial", "uncovered"] as const;
        const status = testCount >= 3 ? "covered" : testCount >= 1 ? "partial" : "uncovered";
        await db.insert(requirementsTable).values({
          projectId,
          sourceId: prdSources[0].id,
          reqId: req.reqId,
          title: req.title,
          description: req.description,
          status,
          testCaseCount: testCount,
        });
      }
    }
  }

  await db.update(generationJobsTable).set({
    status: "completed",
    progress: 100,
    completedAt: new Date(),
  }).where(eq(generationJobsTable.id, jobId));
}

router.post("/generate", async (req, res): Promise<void> => {
  const parsed = TriggerGenerationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { projectId, framework, testTypes } = parsed.data;

  const [job] = await db.insert(generationJobsTable).values({
    projectId,
    framework,
    testTypes: testTypes.join(","),
    status: "queued",
    progress: 0,
  }).returning();

  // Run async (fire and forget)
  runGenerationJob(job.id, projectId, framework, testTypes).catch(() => {
    db.update(generationJobsTable).set({ status: "failed", errorMessage: "Generation failed" }).where(eq(generationJobsTable.id, job.id));
  });

  res.status(202).json({
    id: job.id,
    projectId: job.projectId,
    status: job.status,
    framework: job.framework,
    testTypes: job.testTypes.split(","),
    progress: job.progress,
    errorMessage: job.errorMessage,
    createdAt: job.createdAt.toISOString(),
    completedAt: null,
  });
});

router.get("/jobs", async (req, res): Promise<void> => {
  const query = ListJobsQueryParams.safeParse(req.query);
  const jobs = query.success && query.data.projectId
    ? await db.select().from(generationJobsTable).where(eq(generationJobsTable.projectId, query.data.projectId)).orderBy(generationJobsTable.createdAt)
    : await db.select().from(generationJobsTable).orderBy(generationJobsTable.createdAt);

  res.json(ListJobsResponse.parse(jobs.map(j => ({
    ...j,
    testTypes: j.testTypes.split(","),
    createdAt: j.createdAt.toISOString(),
    completedAt: j.completedAt?.toISOString() ?? null,
  }))));
});

router.get("/jobs/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetJobParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [job] = await db.select().from(generationJobsTable).where(eq(generationJobsTable.id, params.data.id));
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.json(GetJobResponse.parse({
    ...job,
    testTypes: job.testTypes.split(","),
    createdAt: job.createdAt.toISOString(),
    completedAt: job.completedAt?.toISOString() ?? null,
  }));
});

export default router;

import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, testSuitesTable, testCasesTable } from "@workspace/db";
import {
  ListTestSuitesResponse,
  ListTestSuitesQueryParams,
  GetTestSuiteParams,
  GetTestSuiteResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/test-suites", async (req, res): Promise<void> => {
  const query = ListTestSuitesQueryParams.safeParse(req.query);
  let suites;
  if (query.success) {
    const conditions = [];
    if (query.data.projectId) conditions.push(eq(testSuitesTable.projectId, query.data.projectId));
    if (query.data.framework) conditions.push(eq(testSuitesTable.framework, query.data.framework));
    suites = conditions.length > 0
      ? await db.select().from(testSuitesTable).where(and(...conditions)).orderBy(testSuitesTable.createdAt)
      : await db.select().from(testSuitesTable).orderBy(testSuitesTable.createdAt);
  } else {
    suites = await db.select().from(testSuitesTable).orderBy(testSuitesTable.createdAt);
  }
  res.json(ListTestSuitesResponse.parse(suites.map(s => ({ ...s, createdAt: s.createdAt.toISOString() }))));
});

router.get("/test-suites/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetTestSuiteParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [suite] = await db.select().from(testSuitesTable).where(eq(testSuitesTable.id, params.data.id));
  if (!suite) {
    res.status(404).json({ error: "Test suite not found" });
    return;
  }
  const cases = await db.select().from(testCasesTable).where(eq(testCasesTable.testSuiteId, suite.id));
  res.json(GetTestSuiteResponse.parse({
    ...suite,
    createdAt: suite.createdAt.toISOString(),
    testCases: cases,
  }));
});

export default router;

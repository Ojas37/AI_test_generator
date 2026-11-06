import { Router, type IRouter } from "express";
import { db, projectsTable, testSuitesTable, generationJobsTable, requirementsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  GetDashboardStatsResponse,
  GetRecentActivityResponse,
  GetRecentActivityQueryParams,
  GetFrameworkBreakdownResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats", async (_req, res): Promise<void> => {
  const projects = await db.select().from(projectsTable);
  const suites = await db.select().from(testSuitesTable);
  const activeJobs = await db.select().from(generationJobsTable).where(eq(generationJobsTable.status, "running"));

  const totalTests = suites.reduce((sum, s) => sum + s.testCount, 0);
  const avgCoverage = suites.length > 0
    ? Math.round((suites.reduce((sum, s) => sum + s.coverageScore, 0) / suites.length) * 10) / 10
    : 0;
  const timeSavedHours = Math.round(totalTests * 0.15 * 10) / 10;

  res.json(GetDashboardStatsResponse.parse({
    totalProjects: projects.length,
    totalTestSuites: suites.length,
    totalTests,
    avgCoverage,
    activeJobs: activeJobs.length,
    timeSavedHours,
  }));
});

router.get("/recent-activity", async (req, res): Promise<void> => {
  const query = GetRecentActivityQueryParams.safeParse(req.query);
  const limit = query.success && query.data.limit ? query.data.limit : 10;

  const jobs = await db
    .select({
      job: generationJobsTable,
      project: projectsTable,
    })
    .from(generationJobsTable)
    .leftJoin(projectsTable, eq(generationJobsTable.projectId, projectsTable.id))
    .orderBy(desc(generationJobsTable.createdAt))
    .limit(limit);

  const suites = await db
    .select({
      suite: testSuitesTable,
      project: projectsTable,
    })
    .from(testSuitesTable)
    .leftJoin(projectsTable, eq(testSuitesTable.projectId, projectsTable.id))
    .orderBy(desc(testSuitesTable.createdAt))
    .limit(limit);

  const activities: Array<{
    id: number;
    type: string;
    projectName: string;
    description: string;
    framework: string | null;
    testCount: number | null;
    timestamp: string;
  }> = [];

  for (const { job, project } of jobs) {
    if (job.status === "completed") {
      activities.push({
        id: job.id,
        type: "generation_complete",
        projectName: project?.name ?? "Unknown Project",
        description: `Test suite generated with ${job.framework} framework`,
        framework: job.framework,
        testCount: null,
        timestamp: (job.completedAt ?? job.createdAt).toISOString(),
      });
    } else if (job.status === "running") {
      activities.push({
        id: job.id,
        type: "job_started",
        projectName: project?.name ?? "Unknown Project",
        description: `Generating ${job.framework} tests...`,
        framework: job.framework,
        testCount: null,
        timestamp: job.createdAt.toISOString(),
      });
    }
  }

  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.json(GetRecentActivityResponse.parse(activities.slice(0, limit)));
});

router.get("/framework-breakdown", async (_req, res): Promise<void> => {
  const suites = await db.select().from(testSuitesTable);
  const counts: Record<string, number> = {};
  for (const suite of suites) {
    counts[suite.framework] = (counts[suite.framework] ?? 0) + 1;
  }
  const total = suites.length || 1;
  const breakdown = Object.entries(counts).map(([framework, count]) => ({
    framework,
    count,
    percentage: Math.round((count / total) * 100),
  }));
  res.json(GetFrameworkBreakdownResponse.parse(breakdown));
});

export default router;

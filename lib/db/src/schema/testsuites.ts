import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projectsTable } from "./projects";
import { generationJobsTable } from "./jobs";

export const testSuitesTable = pgTable("test_suites", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  jobId: integer("job_id").references(() => generationJobsTable.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  framework: text("framework").notNull(),
  testCount: integer("test_count").notNull().default(0),
  coverageScore: real("coverage_score").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const testCasesTable = pgTable("test_cases", {
  id: serial("id").primaryKey(),
  testSuiteId: integer("test_suite_id").notNull().references(() => testSuitesTable.id, { onDelete: "cascade" }),
  requirementId: integer("requirement_id"),
  title: text("title").notNull(),
  description: text("description"),
  testType: text("test_type").notNull().default("happy_path"), // happy_path | negative | boundary | auth | concurrent | security
  category: text("category").notNull().default("general"),
  code: text("code"),
});

export const insertTestSuiteSchema = createInsertSchema(testSuitesTable).omit({ id: true, createdAt: true });
export type InsertTestSuite = z.infer<typeof insertTestSuiteSchema>;
export type TestSuite = typeof testSuitesTable.$inferSelect;

export const insertTestCaseSchema = createInsertSchema(testCasesTable).omit({ id: true });
export type InsertTestCase = z.infer<typeof insertTestCaseSchema>;
export type TestCase = typeof testCasesTable.$inferSelect;

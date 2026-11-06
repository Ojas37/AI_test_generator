import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, sourcesTable } from "@workspace/db";
import {
  ListSourcesResponse,
  ListSourcesQueryParams,
  CreateSourceBody,
  GetSourceParams,
  GetSourceResponse,
  DeleteSourceParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/sources", async (req, res): Promise<void> => {
  const query = ListSourcesQueryParams.safeParse(req.query);
  const sources = query.success && query.data.projectId
    ? await db.select().from(sourcesTable).where(eq(sourcesTable.projectId, query.data.projectId)).orderBy(sourcesTable.createdAt)
    : await db.select().from(sourcesTable).orderBy(sourcesTable.createdAt);
  res.json(ListSourcesResponse.parse(sources.map(s => ({ ...s, createdAt: s.createdAt.toISOString() }))));
});

router.post("/sources", async (req, res): Promise<void> => {
  const parsed = CreateSourceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [source] = await db.insert(sourcesTable).values(parsed.data).returning();
  res.status(201).json(GetSourceResponse.parse({ ...source, createdAt: source.createdAt.toISOString() }));
});

router.get("/sources/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetSourceParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [source] = await db.select().from(sourcesTable).where(eq(sourcesTable.id, params.data.id));
  if (!source) {
    res.status(404).json({ error: "Source not found" });
    return;
  }
  res.json(GetSourceResponse.parse({ ...source, createdAt: source.createdAt.toISOString() }));
});

router.delete("/sources/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteSourceParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(sourcesTable).where(eq(sourcesTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;

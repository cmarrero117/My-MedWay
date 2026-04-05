import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import {
  insertCourseSchema,
  insertExperienceSchema,
  insertResearchItemSchema,
  insertMilestoneSchema,
  insertMcatSessionSchema,
  insertSavedSchoolSchema,
  insertTargetSchema,
} from "@shared/schema";

// Async route handler wrapper — catches thrown errors & forwards to Express error middleware
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ─── Courses ────────────────────────────────────────────────────────
  app.get("/api/courses", asyncHandler(async (_req, res) => {
    const courses = await storage.getCourses();
    res.json(courses);
  }));

  app.post("/api/courses", asyncHandler(async (req, res) => {
    const data = insertCourseSchema.parse(req.body);
    const course = await storage.createCourse(data);
    res.status(201).json(course);
  }));

  app.patch("/api/courses/:id", asyncHandler(async (req, res) => {
    const data = insertCourseSchema.partial().parse(req.body);
    const result = await storage.updateCourse(req.params.id, data);
    if (!result) return res.status(404).json({ error: "Course not found" });
    res.json(result);
  }));

  app.delete("/api/courses/:id", asyncHandler(async (req, res) => {
    const deleted = await storage.deleteCourse(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Course not found" });
    res.status(204).end();
  }));

  // ─── Experiences ────────────────────────────────────────────────────
  app.get("/api/experiences", asyncHandler(async (_req, res) => {
    const experiences = await storage.getExperiences();
    res.json(experiences);
  }));

  app.post("/api/experiences", asyncHandler(async (req, res) => {
    const data = insertExperienceSchema.parse(req.body);
    const exp = await storage.createExperience(data);
    res.status(201).json(exp);
  }));

  app.patch("/api/experiences/:id", asyncHandler(async (req, res) => {
    const data = insertExperienceSchema.partial().parse(req.body);
    const result = await storage.updateExperience(req.params.id, data);
    if (!result) return res.status(404).json({ error: "Experience not found" });
    res.json(result);
  }));

  app.delete("/api/experiences/:id", asyncHandler(async (req, res) => {
    const deleted = await storage.deleteExperience(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Experience not found" });
    res.status(204).end();
  }));

  // ─── Research Items ─────────────────────────────────────────────────
  app.get("/api/research", asyncHandler(async (_req, res) => {
    const items = await storage.getResearchItems();
    res.json(items);
  }));

  app.post("/api/research", asyncHandler(async (req, res) => {
    const data = insertResearchItemSchema.parse(req.body);
    const item = await storage.createResearchItem(data);
    res.status(201).json(item);
  }));

  app.patch("/api/research/:id", asyncHandler(async (req, res) => {
    const data = insertResearchItemSchema.partial().parse(req.body);
    const result = await storage.updateResearchItem(req.params.id, data);
    if (!result) return res.status(404).json({ error: "Research item not found" });
    res.json(result);
  }));

  app.delete("/api/research/:id", asyncHandler(async (req, res) => {
    const deleted = await storage.deleteResearchItem(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Research item not found" });
    res.status(204).end();
  }));

  // ─── Milestones ─────────────────────────────────────────────────────
  app.get("/api/milestones", asyncHandler(async (_req, res) => {
    const milestones = await storage.getMilestones();
    res.json(milestones);
  }));

  app.post("/api/milestones", asyncHandler(async (req, res) => {
    const data = insertMilestoneSchema.parse(req.body);
    const milestone = await storage.createMilestone(data);
    res.status(201).json(milestone);
  }));

  app.patch("/api/milestones/:id", asyncHandler(async (req, res) => {
    const data = insertMilestoneSchema.partial().parse(req.body);
    const result = await storage.updateMilestone(req.params.id, data);
    if (!result) return res.status(404).json({ error: "Milestone not found" });
    res.json(result);
  }));

  app.delete("/api/milestones/:id", asyncHandler(async (req, res) => {
    const deleted = await storage.deleteMilestone(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Milestone not found" });
    res.status(204).end();
  }));

  // ─── MCAT Sessions ──────────────────────────────────────────────────
  app.get("/api/mcat-sessions", asyncHandler(async (_req, res) => {
    const sessions = await storage.getMcatSessions();
    res.json(sessions);
  }));

  app.post("/api/mcat-sessions", asyncHandler(async (req, res) => {
    const data = insertMcatSessionSchema.parse(req.body);
    const session = await storage.createMcatSession(data);
    res.status(201).json(session);
  }));

  app.patch("/api/mcat-sessions/:id", asyncHandler(async (req, res) => {
    const data = insertMcatSessionSchema.partial().parse(req.body);
    const result = await storage.updateMcatSession(req.params.id, data);
    if (!result) return res.status(404).json({ error: "MCAT session not found" });
    res.json(result);
  }));

  app.delete("/api/mcat-sessions/:id", asyncHandler(async (req, res) => {
    const deleted = await storage.deleteMcatSession(req.params.id);
    if (!deleted) return res.status(404).json({ error: "MCAT session not found" });
    res.status(204).end();
  }));

  // ─── Saved Schools ──────────────────────────────────────────────────
  app.get("/api/schools", asyncHandler(async (_req, res) => {
    const schools = await storage.getSavedSchools();
    res.json(schools);
  }));

  app.post("/api/schools", asyncHandler(async (req, res) => {
    const data = insertSavedSchoolSchema.parse(req.body);
    const school = await storage.createSavedSchool(data);
    res.status(201).json(school);
  }));

  app.patch("/api/schools/:id", asyncHandler(async (req, res) => {
    const data = insertSavedSchoolSchema.partial().parse(req.body);
    const result = await storage.updateSavedSchool(req.params.id, data);
    if (!result) return res.status(404).json({ error: "School not found" });
    res.json(result);
  }));

  app.delete("/api/schools/:id", asyncHandler(async (req, res) => {
    const deleted = await storage.deleteSavedSchool(req.params.id);
    if (!deleted) return res.status(404).json({ error: "School not found" });
    res.status(204).end();
  }));

  // ─── Targets ────────────────────────────────────────────────────────
  app.get("/api/targets", asyncHandler(async (_req, res) => {
    const targets = await storage.getTargets();
    res.json(targets);
  }));

  app.post("/api/targets", asyncHandler(async (req, res) => {
    const data = insertTargetSchema.parse(req.body);
    const target = await storage.createTarget(data);
    res.status(201).json(target);
  }));

  app.patch("/api/targets/:id", asyncHandler(async (req, res) => {
    const data = insertTargetSchema.partial().parse(req.body);
    const result = await storage.updateTarget(req.params.id, data);
    if (!result) return res.status(404).json({ error: "Target not found" });
    res.json(result);
  }));

  app.delete("/api/targets/:id", asyncHandler(async (req, res) => {
    const deleted = await storage.deleteTarget(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Target not found" });
    res.status(204).end();
  }));

  // ─── Global Error Handling Middleware ────────────────────────────────
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    // Zod validation errors → 400 with field details
    if (err instanceof ZodError) {
      const fieldErrors = err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      }));
      return res.status(400).json({ error: "Validation failed", details: fieldErrors });
    }

    // Generic errors
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[API Error]", err);
    res.status(500).json({ error: message });
  });

  return httpServer;
}

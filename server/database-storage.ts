import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  courses, experiences, researchItems, milestones,
  mcatSessions, savedSchools, targets,
  type Course, type InsertCourse,
  type Experience, type InsertExperience,
  type ResearchItem, type InsertResearchItem,
  type Milestone, type InsertMilestone,
  type McatSession, type InsertMcatSession,
  type SavedSchool, type InsertSavedSchool,
  type Target, type InsertTarget,
} from "@shared/schema";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // Courses
  async getCourses(): Promise<Course[]> { return db.select().from(courses); }
  async getCourse(id: string): Promise<Course | undefined> { const [r] = await db.select().from(courses).where(eq(courses.id, id)); return r; }
  async createCourse(data: InsertCourse): Promise<Course> { const [r] = await db.insert(courses).values(data).returning(); return r; }
  async updateCourse(id: string, data: Partial<InsertCourse>): Promise<Course | undefined> { const [r] = await db.update(courses).set(data).where(eq(courses.id, id)).returning(); return r; }
  async deleteCourse(id: string): Promise<boolean> { const r = await db.delete(courses).where(eq(courses.id, id)).returning(); return r.length > 0; }

  // Experiences
  async getExperiences(): Promise<Experience[]> { return db.select().from(experiences); }
  async getExperience(id: string): Promise<Experience | undefined> { const [r] = await db.select().from(experiences).where(eq(experiences.id, id)); return r; }
  async createExperience(data: InsertExperience): Promise<Experience> { const [r] = await db.insert(experiences).values(data).returning(); return r; }
  async updateExperience(id: string, data: Partial<InsertExperience>): Promise<Experience | undefined> { const [r] = await db.update(experiences).set(data).where(eq(experiences.id, id)).returning(); return r; }
  async deleteExperience(id: string): Promise<boolean> { const r = await db.delete(experiences).where(eq(experiences.id, id)).returning(); return r.length > 0; }

  // Research
  async getResearchItems(): Promise<ResearchItem[]> { return db.select().from(researchItems); }
  async getResearchItem(id: string): Promise<ResearchItem | undefined> { const [r] = await db.select().from(researchItems).where(eq(researchItems.id, id)); return r; }
  async createResearchItem(data: InsertResearchItem): Promise<ResearchItem> { const [r] = await db.insert(researchItems).values(data).returning(); return r; }
  async updateResearchItem(id: string, data: Partial<InsertResearchItem>): Promise<ResearchItem | undefined> { const [r] = await db.update(researchItems).set(data).where(eq(researchItems.id, id)).returning(); return r; }
  async deleteResearchItem(id: string): Promise<boolean> { const r = await db.delete(researchItems).where(eq(researchItems.id, id)).returning(); return r.length > 0; }

  // Milestones
  async getMilestones(): Promise<Milestone[]> { return db.select().from(milestones); }
  async getMilestone(id: string): Promise<Milestone | undefined> { const [r] = await db.select().from(milestones).where(eq(milestones.id, id)); return r; }
  async createMilestone(data: InsertMilestone): Promise<Milestone> { const [r] = await db.insert(milestones).values(data).returning(); return r; }
  async updateMilestone(id: string, data: Partial<InsertMilestone>): Promise<Milestone | undefined> { const [r] = await db.update(milestones).set(data).where(eq(milestones.id, id)).returning(); return r; }
  async deleteMilestone(id: string): Promise<boolean> { const r = await db.delete(milestones).where(eq(milestones.id, id)).returning(); return r.length > 0; }

  // MCAT Sessions
  async getMcatSessions(): Promise<McatSession[]> { return db.select().from(mcatSessions); }
  async getMcatSession(id: string): Promise<McatSession | undefined> { const [r] = await db.select().from(mcatSessions).where(eq(mcatSessions.id, id)); return r; }
  async createMcatSession(data: InsertMcatSession): Promise<McatSession> { const [r] = await db.insert(mcatSessions).values(data).returning(); return r; }
  async updateMcatSession(id: string, data: Partial<InsertMcatSession>): Promise<McatSession | undefined> { const [r] = await db.update(mcatSessions).set(data).where(eq(mcatSessions.id, id)).returning(); return r; }
  async deleteMcatSession(id: string): Promise<boolean> { const r = await db.delete(mcatSessions).where(eq(mcatSessions.id, id)).returning(); return r.length > 0; }

  // Saved Schools
  async getSavedSchools(): Promise<SavedSchool[]> { return db.select().from(savedSchools); }
  async getSavedSchool(id: string): Promise<SavedSchool | undefined> { const [r] = await db.select().from(savedSchools).where(eq(savedSchools.id, id)); return r; }
  async createSavedSchool(data: InsertSavedSchool): Promise<SavedSchool> { const [r] = await db.insert(savedSchools).values(data).returning(); return r; }
  async updateSavedSchool(id: string, data: Partial<InsertSavedSchool>): Promise<SavedSchool | undefined> { const [r] = await db.update(savedSchools).set(data).where(eq(savedSchools.id, id)).returning(); return r; }
  async deleteSavedSchool(id: string): Promise<boolean> { const r = await db.delete(savedSchools).where(eq(savedSchools.id, id)).returning(); return r.length > 0; }

  // Targets
  async getTargets(): Promise<Target[]> { return db.select().from(targets); }
  async getTarget(id: string): Promise<Target | undefined> { const [r] = await db.select().from(targets).where(eq(targets.id, id)); return r; }
  async createTarget(data: InsertTarget): Promise<Target> { const [r] = await db.insert(targets).values(data).returning(); return r; }
  async updateTarget(id: string, data: Partial<InsertTarget>): Promise<Target | undefined> { const [r] = await db.update(targets).set(data).where(eq(targets.id, id)).returning(); return r; }
  async deleteTarget(id: string): Promise<boolean> { const r = await db.delete(targets).where(eq(targets.id, id)).returning(); return r.length > 0; }
}

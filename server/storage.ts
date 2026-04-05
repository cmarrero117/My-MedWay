import {
  type Course, type InsertCourse,
  type Experience, type InsertExperience,
  type ResearchItem, type InsertResearchItem,
  type Milestone, type InsertMilestone,
  type McatSession, type InsertMcatSession,
  type SavedSchool, type InsertSavedSchool,
  type Target, type InsertTarget,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Courses
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course | undefined>;
  deleteCourse(id: string): Promise<boolean>;

  // Experiences
  getExperiences(): Promise<Experience[]>;
  getExperience(id: string): Promise<Experience | undefined>;
  createExperience(exp: InsertExperience): Promise<Experience>;
  updateExperience(id: string, exp: Partial<InsertExperience>): Promise<Experience | undefined>;
  deleteExperience(id: string): Promise<boolean>;

  // Research items
  getResearchItems(): Promise<ResearchItem[]>;
  getResearchItem(id: string): Promise<ResearchItem | undefined>;
  createResearchItem(item: InsertResearchItem): Promise<ResearchItem>;
  updateResearchItem(id: string, item: Partial<InsertResearchItem>): Promise<ResearchItem | undefined>;
  deleteResearchItem(id: string): Promise<boolean>;

  // Milestones
  getMilestones(): Promise<Milestone[]>;
  getMilestone(id: string): Promise<Milestone | undefined>;
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  updateMilestone(id: string, milestone: Partial<InsertMilestone>): Promise<Milestone | undefined>;
  deleteMilestone(id: string): Promise<boolean>;

  // MCAT sessions
  getMcatSessions(): Promise<McatSession[]>;
  getMcatSession(id: string): Promise<McatSession | undefined>;
  createMcatSession(session: InsertMcatSession): Promise<McatSession>;
  updateMcatSession(id: string, session: Partial<InsertMcatSession>): Promise<McatSession | undefined>;
  deleteMcatSession(id: string): Promise<boolean>;

  // Saved schools
  getSavedSchools(): Promise<SavedSchool[]>;
  getSavedSchool(id: string): Promise<SavedSchool | undefined>;
  createSavedSchool(school: InsertSavedSchool): Promise<SavedSchool>;
  updateSavedSchool(id: string, school: Partial<InsertSavedSchool>): Promise<SavedSchool | undefined>;
  deleteSavedSchool(id: string): Promise<boolean>;

  // Targets
  getTargets(): Promise<Target[]>;
  getTarget(id: string): Promise<Target | undefined>;
  createTarget(target: InsertTarget): Promise<Target>;
  updateTarget(id: string, target: Partial<InsertTarget>): Promise<Target | undefined>;
  deleteTarget(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private courses: Map<string, Course> = new Map();
  private experiences: Map<string, Experience> = new Map();
  private researchItems: Map<string, ResearchItem> = new Map();
  private milestones: Map<string, Milestone> = new Map();
  private mcatSessions: Map<string, McatSession> = new Map();
  private savedSchools: Map<string, SavedSchool> = new Map();
  private targets: Map<string, Target> = new Map();

  constructor() {
    // Seed default targets
    const defaults = [
      { key: "clinical", label: "Clinical Hours", value: 500 },
      { key: "volunteer", label: "Volunteer Hours", value: 200 },
      { key: "shadowing", label: "Shadowing Hours", value: 100 },
      { key: "mcat", label: "MCAT Study Hours", value: 300 },
    ];
    for (const d of defaults) {
      const id = randomUUID();
      this.targets.set(id, { id, ...d });
    }
  }

  // Courses
  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }
  async getCourse(id: string): Promise<Course | undefined> {
    return this.courses.get(id);
  }
  async createCourse(course: InsertCourse): Promise<Course> {
    const id = randomUUID();
    const entry: Course = { ...course, id };
    this.courses.set(id, entry);
    return entry;
  }
  async updateCourse(id: string, data: Partial<InsertCourse>): Promise<Course | undefined> {
    const existing = this.courses.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.courses.set(id, updated);
    return updated;
  }
  async deleteCourse(id: string): Promise<boolean> {
    return this.courses.delete(id);
  }

  // Experiences
  async getExperiences(): Promise<Experience[]> {
    return Array.from(this.experiences.values());
  }
  async getExperience(id: string): Promise<Experience | undefined> {
    return this.experiences.get(id);
  }
  async createExperience(exp: InsertExperience): Promise<Experience> {
    const id = randomUUID();
    const entry: Experience = { ...exp, id, isCurrent: exp.isCurrent ?? false, endDate: exp.endDate ?? null, description: exp.description ?? null };
    this.experiences.set(id, entry);
    return entry;
  }
  async updateExperience(id: string, data: Partial<InsertExperience>): Promise<Experience | undefined> {
    const existing = this.experiences.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.experiences.set(id, updated);
    return updated;
  }
  async deleteExperience(id: string): Promise<boolean> {
    return this.experiences.delete(id);
  }

  // Research items
  async getResearchItems(): Promise<ResearchItem[]> {
    return Array.from(this.researchItems.values());
  }
  async getResearchItem(id: string): Promise<ResearchItem | undefined> {
    return this.researchItems.get(id);
  }
  async createResearchItem(item: InsertResearchItem): Promise<ResearchItem> {
    const id = randomUUID();
    const entry: ResearchItem = { ...item, id, isCurrent: item.isCurrent ?? false, endDate: item.endDate ?? null, description: item.description ?? null };
    this.researchItems.set(id, entry);
    return entry;
  }
  async updateResearchItem(id: string, data: Partial<InsertResearchItem>): Promise<ResearchItem | undefined> {
    const existing = this.researchItems.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.researchItems.set(id, updated);
    return updated;
  }
  async deleteResearchItem(id: string): Promise<boolean> {
    return this.researchItems.delete(id);
  }

  // Milestones
  async getMilestones(): Promise<Milestone[]> {
    return Array.from(this.milestones.values());
  }
  async getMilestone(id: string): Promise<Milestone | undefined> {
    return this.milestones.get(id);
  }
  async createMilestone(milestone: InsertMilestone): Promise<Milestone> {
    const id = randomUUID();
    const entry: Milestone = { ...milestone, id, isSignificant: milestone.isSignificant ?? false, description: milestone.description ?? null };
    this.milestones.set(id, entry);
    return entry;
  }
  async updateMilestone(id: string, data: Partial<InsertMilestone>): Promise<Milestone | undefined> {
    const existing = this.milestones.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.milestones.set(id, updated);
    return updated;
  }
  async deleteMilestone(id: string): Promise<boolean> {
    return this.milestones.delete(id);
  }

  // MCAT sessions
  async getMcatSessions(): Promise<McatSession[]> {
    return Array.from(this.mcatSessions.values());
  }
  async getMcatSession(id: string): Promise<McatSession | undefined> {
    return this.mcatSessions.get(id);
  }
  async createMcatSession(session: InsertMcatSession): Promise<McatSession> {
    const id = randomUUID();
    const entry: McatSession = { ...session, id, topic: session.topic ?? null, notes: session.notes ?? null };
    this.mcatSessions.set(id, entry);
    return entry;
  }
  async updateMcatSession(id: string, data: Partial<InsertMcatSession>): Promise<McatSession | undefined> {
    const existing = this.mcatSessions.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.mcatSessions.set(id, updated);
    return updated;
  }
  async deleteMcatSession(id: string): Promise<boolean> {
    return this.mcatSessions.delete(id);
  }

  // Saved schools
  async getSavedSchools(): Promise<SavedSchool[]> {
    return Array.from(this.savedSchools.values());
  }
  async getSavedSchool(id: string): Promise<SavedSchool | undefined> {
    return this.savedSchools.get(id);
  }
  async createSavedSchool(school: InsertSavedSchool): Promise<SavedSchool> {
    const id = randomUUID();
    const entry: SavedSchool = {
      ...school, id,
      avgMcat: school.avgMcat ?? null,
      avgGpa: school.avgGpa ?? null,
      deadline: school.deadline ?? null,
      notes: school.notes ?? null,
      website: school.website ?? null,
    };
    this.savedSchools.set(id, entry);
    return entry;
  }
  async updateSavedSchool(id: string, data: Partial<InsertSavedSchool>): Promise<SavedSchool | undefined> {
    const existing = this.savedSchools.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.savedSchools.set(id, updated);
    return updated;
  }
  async deleteSavedSchool(id: string): Promise<boolean> {
    return this.savedSchools.delete(id);
  }

  // Targets
  async getTargets(): Promise<Target[]> {
    return Array.from(this.targets.values());
  }
  async getTarget(id: string): Promise<Target | undefined> {
    return this.targets.get(id);
  }
  async createTarget(target: InsertTarget): Promise<Target> {
    const id = randomUUID();
    const entry: Target = { ...target, id };
    this.targets.set(id, entry);
    return entry;
  }
  async updateTarget(id: string, data: Partial<InsertTarget>): Promise<Target | undefined> {
    const existing = this.targets.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.targets.set(id, updated);
    return updated;
  }
  async deleteTarget(id: string): Promise<boolean> {
    return this.targets.delete(id);
  }
}

import { DatabaseStorage } from "./database-storage";
export const storage = new DatabaseStorage();

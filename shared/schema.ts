import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Courses for sGPA tracking
export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(), // "biology", "chemistry", "physics", "math", "other_science"
  credits: integer("credits").notNull(),
  grade: text("grade").notNull(), // "A", "A-", "B+", etc.
  gradePoints: real("grade_points").notNull(),
  semester: text("semester").notNull(), // "Fall 2024", "Spring 2025"
});

export const insertCourseSchema = createInsertSchema(courses).omit({ id: true });
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

// Experience entries (clinical, volunteer, shadowing)
export const experiences = pgTable("experiences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // "clinical", "volunteer", "shadowing"
  title: text("title").notNull(),
  organization: text("organization").notNull(),
  hours: real("hours").notNull(),
  description: text("description"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  isCurrent: boolean("is_current").default(false),
});

export const insertExperienceSchema = createInsertSchema(experiences).omit({ id: true });
export type InsertExperience = z.infer<typeof insertExperienceSchema>;
export type Experience = typeof experiences.$inferSelect;

// Research items
export const researchItems = pgTable("research_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  type: text("type").notNull(), // "publication", "poster", "presentation", "abstract", "lab_project"
  role: text("role").notNull(), // "PI", "Co-PI", "Research Assistant", "Collaborator"
  institution: text("institution").notNull(),
  description: text("description"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  isCurrent: boolean("is_current").default(false),
  status: text("status").notNull(), // "in_progress", "completed", "published"
});

export const insertResearchItemSchema = createInsertSchema(researchItems).omit({ id: true });
export type InsertResearchItem = z.infer<typeof insertResearchItemSchema>;
export type ResearchItem = typeof researchItems.$inferSelect;

// Milestones
export const milestones = pgTable("milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  category: text("category").notNull(), // "academic", "research", "clinical", "personal", "application"
  date: text("date").notNull(),
  description: text("description"),
  isSignificant: boolean("is_significant").default(false),
});

export const insertMilestoneSchema = createInsertSchema(milestones).omit({ id: true });
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
export type Milestone = typeof milestones.$inferSelect;

// MCAT Study sessions
export const mcatSessions = pgTable("mcat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(),
  subject: text("subject").notNull(), // "bio_biochem", "chem_phys", "psych_soc", "cars", "full_length"
  hours: real("hours").notNull(),
  topic: text("topic"),
  notes: text("notes"),
});

export const insertMcatSessionSchema = createInsertSchema(mcatSessions).omit({ id: true });
export type InsertMcatSession = z.infer<typeof insertMcatSessionSchema>;
export type McatSession = typeof mcatSessions.$inferSelect;

// Saved medical schools
export const savedSchools = pgTable("saved_schools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(), // "MD", "DO", "MD/PhD"
  avgMcat: integer("avg_mcat"),
  avgGpa: real("avg_gpa"),
  deadline: text("deadline"),
  notes: text("notes"),
  tier: text("tier").notNull(), // "reach", "target", "safety"
  website: text("website"),
});

export const insertSavedSchoolSchema = createInsertSchema(savedSchools).omit({ id: true });
export type InsertSavedSchool = z.infer<typeof insertSavedSchoolSchema>;
export type SavedSchool = typeof savedSchools.$inferSelect;

// User-defined targets for progress tracking
export const targets = pgTable("targets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull(), // "clinical", "volunteer", "shadowing", "mcat", or custom
  label: text("label").notNull(),
  value: real("value").notNull(),
});

export const insertTargetSchema = createInsertSchema(targets).omit({ id: true });
export type InsertTarget = z.infer<typeof insertTargetSchema>;
export type Target = typeof targets.$inferSelect;

import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { sql } from 'drizzle-orm';
import { pgTable, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { users, profiles } from "./schema";

// User preference changes tracking table
export const userPreferenceChanges = pgTable("user_preference_changes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  profileId: varchar("profile_id").notNull().references(() => profiles.id),
  changeType: varchar("change_type").notNull(), // 'examination_system' or 'level'
  previousValue: varchar("previous_value"),
  newValue: varchar("new_value").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const insertUserPreferenceChangeSchema = createInsertSchema(userPreferenceChanges).omit({
  id: true,
  timestamp: true,
});

export type InsertUserPreferenceChange = z.infer<typeof insertUserPreferenceChangeSchema>;
export type UserPreferenceChange = typeof userPreferenceChanges.$inferSelect;
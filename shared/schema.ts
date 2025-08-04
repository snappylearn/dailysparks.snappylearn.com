import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  text,
  boolean,
  decimal
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  examType: varchar("exam_type").notNull().default('KCSE'), // KCSE, IGCSE, KPSEA
  form: varchar("form").notNull(), // Form 1, Form 2, Form 3, Form 4
  school: varchar("school"),
  currentTerm: varchar("current_term").default('Term 1'),
  sparks: integer("sparks").default(0),
  streak: integer("streak").default(0),
  lastActivity: timestamp("last_activity").defaultNow(),
  isPremium: boolean("is_premium").default(false),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subjects table
export const subjects = pgTable("subjects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  code: varchar("code").notNull().unique(),
  examType: varchar("exam_type").notNull(),
  icon: varchar("icon"),
  color: varchar("color"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Topics table (within subjects)
export const topics = pgTable("topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectId: varchar("subject_id").notNull().references(() => subjects.id),
  name: varchar("name").notNull(),
  form: varchar("form").notNull(),
  term: varchar("term").notNull(),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Questions table
export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topicId: varchar("topic_id").notNull().references(() => topics.id),
  questionText: text("question_text").notNull(),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  optionC: text("option_c").notNull(),
  optionD: text("option_d").notNull(),
  correctAnswer: varchar("correct_answer").notNull(), // A, B, C, or D
  explanation: text("explanation"),
  difficulty: varchar("difficulty").notNull().default('medium'), // easy, medium, hard
  createdAt: timestamp("created_at").defaultNow(),
});

// Quiz sessions table
export const quizSessions = pgTable("quiz_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  subjectId: varchar("subject_id").notNull().references(() => subjects.id),
  quizType: varchar("quiz_type").notNull(), // random, topical, term
  topicId: varchar("topic_id").references(() => topics.id), // for topical quizzes
  term: varchar("term"), // for term quizzes
  totalQuestions: integer("total_questions").default(30),
  correctAnswers: integer("correct_answers").default(0),
  sparksEarned: integer("sparks_earned").default(0),
  timeSpent: integer("time_spent"), // in seconds
  completed: boolean("completed").default(false),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// User answers table
export const userAnswers = pgTable("user_answers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizSessionId: varchar("quiz_session_id").notNull().references(() => quizSessions.id),
  questionId: varchar("question_id").notNull().references(() => questions.id),
  userAnswer: varchar("user_answer").notNull(), // A, B, C, or D
  isCorrect: boolean("is_correct").notNull(),
  timeSpent: integer("time_spent"), // in seconds
  answeredAt: timestamp("answered_at").defaultNow(),
});

// Daily challenges table
export const dailyChallenges = pgTable("daily_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: varchar("date").notNull().unique(), // YYYY-MM-DD format
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  targetValue: integer("target_value").notNull(),
  sparksReward: integer("sparks_reward").default(200),
  createdAt: timestamp("created_at").defaultNow(),
});

// User challenge progress table
export const userChallengeProgress = pgTable("user_challenge_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  challengeId: varchar("challenge_id").notNull().references(() => dailyChallenges.id),
  currentValue: integer("current_value").default(0),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  quizSessions: many(quizSessions),
  userAnswers: many(userAnswers),
  challengeProgress: many(userChallengeProgress),
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
  topics: many(topics),
  quizSessions: many(quizSessions),
}));

export const topicsRelations = relations(topics, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [topics.subjectId],
    references: [subjects.id],
  }),
  questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  topic: one(topics, {
    fields: [questions.topicId],
    references: [topics.id],
  }),
  userAnswers: many(userAnswers),
}));

export const quizSessionsRelations = relations(quizSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [quizSessions.userId],
    references: [users.id],
  }),
  subject: one(subjects, {
    fields: [quizSessions.subjectId],
    references: [subjects.id],
  }),
  topic: one(topics, {
    fields: [quizSessions.topicId],
    references: [topics.id],
  }),
  userAnswers: many(userAnswers),
}));

export const userAnswersRelations = relations(userAnswers, ({ one }) => ({
  quizSession: one(quizSessions, {
    fields: [userAnswers.quizSessionId],
    references: [quizSessions.id],
  }),
  question: one(questions, {
    fields: [userAnswers.questionId],
    references: [questions.id],
  }),
}));

export const dailyChallengesRelations = relations(dailyChallenges, ({ many }) => ({
  userProgress: many(userChallengeProgress),
}));

export const userChallengeProgressRelations = relations(userChallengeProgress, ({ one }) => ({
  user: one(users, {
    fields: [userChallengeProgress.userId],
    references: [users.id],
  }),
  challenge: one(dailyChallenges, {
    fields: [userChallengeProgress.challengeId],
    references: [dailyChallenges.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubjectSchema = createInsertSchema(subjects).omit({
  id: true,
  createdAt: true,
});

export const insertTopicSchema = createInsertSchema(topics).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true,
});

export const insertQuizSessionSchema = createInsertSchema(quizSessions).omit({
  id: true,
  startedAt: true,
});

export const insertUserAnswerSchema = createInsertSchema(userAnswers).omit({
  id: true,
  answeredAt: true,
});

export const insertDailyChallengeSchema = createInsertSchema(dailyChallenges).omit({
  id: true,
  createdAt: true,
});

export const insertUserChallengeProgressSchema = createInsertSchema(userChallengeProgress).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type Topic = typeof topics.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type QuizSession = typeof quizSessions.$inferSelect;
export type UserAnswer = typeof userAnswers.$inferSelect;
export type DailyChallenge = typeof dailyChallenges.$inferSelect;
export type UserChallengeProgress = typeof userChallengeProgress.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type InsertQuizSession = z.infer<typeof insertQuizSessionSchema>;
export type InsertUserAnswer = z.infer<typeof insertUserAnswerSchema>;
export type InsertDailyChallenge = z.infer<typeof insertDailyChallengeSchema>;
export type InsertUserChallengeProgress = z.infer<typeof insertUserChallengeProgressSchema>;

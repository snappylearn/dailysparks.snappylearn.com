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
  defaultProfileId: varchar("default_profile_id"),
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Examination systems table
export const examinationSystems = pgTable("examination_systems", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(), // KCSE, IGCSE, KPSEA
  code: varchar("code").notNull().unique(),
  description: text("description"),
  country: varchar("country"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Levels table (Form 1, Form 2, etc.)
export const levels = pgTable("levels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(), // Form 1, Form 2, Grade 9, etc.
  description: text("description"),
  examinationSystemId: varchar("examination_system_id").notNull().references(() => examinationSystems.id),
  order: integer("order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Student profiles table
export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  examinationSystemId: varchar("examination_system_id").notNull().references(() => examinationSystems.id),
  levelId: varchar("level_id").notNull().references(() => levels.id),
  currentTerm: varchar("current_term").default('Term 1'),
  sparks: integer("sparks").default(0),
  streak: integer("streak").default(0),
  lastActivity: timestamp("last_activity").defaultNow(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subjects table
export const subjects = pgTable("subjects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  code: varchar("code").notNull().unique(),
  examinationSystemId: varchar("examination_system_id").notNull().references(() => examinationSystems.id),
  icon: varchar("icon"),
  color: varchar("color"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Terms table - represents academic terms (Term 1, Term 2, Term 3)
export const terms = pgTable("terms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(), // "Term 1", "Term 2", "Term 3"
  description: text("description"),
  order: integer("order").notNull(), // 1, 2, 3
  createdAt: timestamp("created_at").defaultNow(),
});

// Topics table (within subjects)
export const topics = pgTable("topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  examinationSystemId: varchar("examination_system_id").notNull().references(() => examinationSystems.id),
  subjectId: varchar("subject_id").notNull().references(() => subjects.id),
  levelId: varchar("level_id").notNull().references(() => levels.id),
  termId: varchar("term_id").notNull().references(() => terms.id),
  title: varchar("title").notNull(),
  description: text("description"),
  summaryContent: text("summary_content"),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Questions table
export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topicId: varchar("topic_id").references(() => topics.id),
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
  profileId: varchar("profile_id").notNull().references(() => profiles.id),
  subjectId: varchar("subject_id").notNull().references(() => subjects.id),
  quizType: varchar("quiz_type").notNull(), // random, topical, term
  topicId: varchar("topic_id").references(() => topics.id), // for topical quizzes
  termId: varchar("term_id").references(() => terms.id), // for term quizzes
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
  profileId: varchar("profile_id").notNull().references(() => profiles.id),
  challengeId: varchar("challenge_id").notNull().references(() => dailyChallenges.id),
  currentValue: integer("current_value").default(0),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced LMS Tables following best practices

// Quiz types table
export const quizTypes = pgTable("quiz_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  code: varchar("code").notNull().unique(), // "random", "topical", "termly"
  createdAt: timestamp("created_at").defaultNow(),
});

// Question types table  
export const questionTypes = pgTable("question_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  code: varchar("code").notNull().unique(), // "mcq", "short_answer", "true_false"
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced quizzes table
export const quizzes = pgTable("quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  examinationSystemId: varchar("examination_system_id").notNull().references(() => examinationSystems.id),
  levelId: varchar("level_id").notNull().references(() => levels.id),
  subjectId: varchar("subject_id").notNull().references(() => subjects.id),
  quizTypeId: varchar("quiz_type_id").notNull().references(() => quizTypes.id),
  termId: varchar("term_id").references(() => terms.id), // For termly quizzes
  topicId: varchar("topic_id").references(() => topics.id), // For topical quizzes
  questionCount: integer("question_count").notNull().default(15),
  timeLimit: integer("time_limit"), // in minutes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced quiz questions table
export const quizQuestions = pgTable("quiz_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizId: varchar("quiz_id").notNull().references(() => quizzes.id),
  content: text("content").notNull(),
  questionTypeId: varchar("question_type_id").notNull().references(() => questionTypes.id),
  marks: integer("marks").notNull().default(1),
  difficulty: varchar("difficulty").notNull().default("medium"), // easy, medium, hard
  explanation: text("explanation"),
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quiz question choices table (for MCQs)
export const quizQuestionChoices = pgTable("quiz_question_choices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizQuestionId: varchar("quiz_question_id").notNull().references(() => quizQuestions.id),
  content: text("content").notNull(),
  isCorrect: boolean("is_correct").notNull().default(false),
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced quiz sessions with question snapshots
export const enhancedQuizSessions = pgTable("enhanced_quiz_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizId: varchar("quiz_id").notNull().references(() => quizzes.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  profileId: varchar("profile_id").notNull().references(() => profiles.id),
  examinationSystemId: varchar("examination_system_id").notNull().references(() => examinationSystems.id),
  levelId: varchar("level_id").notNull().references(() => levels.id),
  subjectId: varchar("subject_id").notNull().references(() => subjects.id),
  quizQuestions: jsonb("quiz_questions").notNull(), // JSON snapshot of questions at start
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").default(0),
  totalMarks: integer("total_marks").default(0),
  marksObtained: integer("marks_obtained").default(0),
  sparksEarned: integer("sparks_earned").default(0),
  accuracyPercentage: integer("accuracy_percentage").default(0),
  timeSpent: integer("time_spent"), // in seconds
  completed: boolean("completed").default(false),
  canRetake: boolean("can_retake").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced quiz question answers
export const quizQuestionAnswers = pgTable("quiz_question_answers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizSessionId: varchar("quiz_session_id").notNull().references(() => enhancedQuizSessions.id),
  quizQuestionId: varchar("quiz_question_id").notNull(), // Reference to question in snapshot
  quizQuestionChoiceId: varchar("quiz_question_choice_id"), // For MCQ answers
  answer: text("answer"), // For open-ended answers
  isCorrect: boolean("is_correct").notNull(),
  marks: integer("marks").default(0),
  sparks: integer("sparks").default(0),
  timeSpent: integer("time_spent"), // in seconds
  answeredAt: timestamp("answered_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profiles: many(profiles),
  defaultProfile: one(profiles, {
    fields: [users.defaultProfileId],
    references: [profiles.id],
  }),
}));

export const examinationSystemsRelations = relations(examinationSystems, ({ many }) => ({
  levels: many(levels),
  subjects: many(subjects),
  profiles: many(profiles),
}));

export const levelsRelations = relations(levels, ({ one, many }) => ({
  examinationSystem: one(examinationSystems, {
    fields: [levels.examinationSystemId],
    references: [examinationSystems.id],
  }),
  topics: many(topics),
  profiles: many(profiles),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  examinationSystem: one(examinationSystems, {
    fields: [profiles.examinationSystemId],
    references: [examinationSystems.id],
  }),
  level: one(levels, {
    fields: [profiles.levelId],
    references: [levels.id],
  }),
  quizSessions: many(quizSessions),
  challengeProgress: many(userChallengeProgress),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  examinationSystem: one(examinationSystems, {
    fields: [subjects.examinationSystemId],
    references: [examinationSystems.id],
  }),
  topics: many(topics),
  quizSessions: many(quizSessions),
}));

export const termsRelations = relations(terms, ({ many }) => ({
  topics: many(topics),
}));

export const topicsRelations = relations(topics, ({ one, many }) => ({
  examinationSystem: one(examinationSystems, {
    fields: [topics.examinationSystemId],
    references: [examinationSystems.id],
  }),
  subject: one(subjects, {
    fields: [topics.subjectId],
    references: [subjects.id],
  }),
  level: one(levels, {
    fields: [topics.levelId],
    references: [levels.id],
  }),
  term: one(terms, {
    fields: [topics.termId],
    references: [terms.id],
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
  profile: one(profiles, {
    fields: [quizSessions.profileId],
    references: [profiles.id],
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
  profile: one(profiles, {
    fields: [userChallengeProgress.profileId],
    references: [profiles.id],
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

export const insertExaminationSystemSchema = createInsertSchema(examinationSystems).omit({
  id: true,
  createdAt: true,
});

export const insertLevelSchema = createInsertSchema(levels).omit({
  id: true,
  createdAt: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubjectSchema = createInsertSchema(subjects).omit({
  id: true,
  createdAt: true,
});

export const insertTermSchema = createInsertSchema(terms).omit({
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
export type ExaminationSystem = typeof examinationSystems.$inferSelect;
export type Level = typeof levels.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type Term = typeof terms.$inferSelect;
export type Topic = typeof topics.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type QuizSession = typeof quizSessions.$inferSelect;
export type UserAnswer = typeof userAnswers.$inferSelect;
export type DailyChallenge = typeof dailyChallenges.$inferSelect;
export type UserChallengeProgress = typeof userChallengeProgress.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertExaminationSystem = z.infer<typeof insertExaminationSystemSchema>;
export type InsertLevel = z.infer<typeof insertLevelSchema>;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type InsertTerm = z.infer<typeof insertTermSchema>;
export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type InsertQuizSession = z.infer<typeof insertQuizSessionSchema>;
export type InsertUserAnswer = z.infer<typeof insertUserAnswerSchema>;
export type InsertDailyChallenge = z.infer<typeof insertDailyChallengeSchema>;
export type InsertUserChallengeProgress = z.infer<typeof insertUserChallengeProgressSchema>;

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

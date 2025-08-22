import {
  users,
  examinationSystems,
  levels,
  profiles,
  subjects,
  terms,
  topics,
  questions,
  quizSessions,
  userAnswers,
  dailyChallenges,
  userChallengeProgress,
  userPreferenceChanges,
  quizTypes,
  questionTypes,
  quizzes,
  quizQuestions,
  quizQuestionChoices,
  // Gamification tables
  badgeTypes,
  badges,
  userBadges,
  trophies,
  challenges,
  userChallenges,
  userSparkBoost,
  userTrophies,
  generalSettings,
  quizSettings,
  notificationSettings,
  subscriptionPlans,
  userSubscriptions,
  paymentTransactions,
  creditTransactions,
  type User,
  type UpsertUser,
  type ExaminationSystem,
  type Level,
  type Profile,
  type Subject,
  type Term,
  type Topic,
  type Question,
  type QuizSession,
  type UserAnswer,
  type DailyChallenge,
  type UserChallengeProgress,
  type InsertExaminationSystem,
  type InsertLevel,
  type InsertProfile,
  type InsertSubject,
  type InsertTerm,
  type InsertTopic,
  type InsertQuestion,
  type InsertQuizSession,
  type InsertUserAnswer,
  type InsertDailyChallenge,
  type InsertUserChallengeProgress,
  // Gamification types
  type BadgeType,
  type Badge,
  type UserBadge,
  type Trophy,
  type UserTrophy,
  type Challenge,
  type UserChallenge,
  type UserSparkBoost,
  type InsertBadgeType,
  type InsertBadge,
  type InsertUserBadge,
  type InsertTrophy,
  type InsertUserTrophy,
  type InsertChallenge,
  type InsertUserChallenge,
  type InsertUserSparkBoost,
  // Settings types
  type GeneralSettings,
  type QuizSettings,
  type NotificationSettings,
  type InsertGeneralSettings,
  type InsertQuizSettings,
  type InsertNotificationSettings,
  // Subscription types
  type SubscriptionPlan,
  type UserSubscription,
  type PaymentTransaction,
  type CreditTransaction,
  type InsertSubscriptionPlan,
  type InsertUserSubscription,
  type InsertPaymentTransaction,
  type InsertCreditTransaction,
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, desc, sql, count, avg, gte, lte, inArray, or, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Examination system operations
  getExaminationSystems(): Promise<ExaminationSystem[]>;
  createExaminationSystem(system: InsertExaminationSystem): Promise<ExaminationSystem>;
  
  // Level operations
  getAllLevels(): Promise<Level[]>;
  getLevelsBySystem(examinationSystemId: string): Promise<Level[]>;
  createLevel(level: InsertLevel): Promise<Level>;
  
  // Term operations
  getTerms(): Promise<Term[]>;
  
  // Profile operations
  getUserProfiles(userId: string): Promise<Profile[]>;
  getProfile(profileId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  setDefaultProfile(userId: string, profileId: string): Promise<User>;
  updateProfile(profileId: string, data: Partial<Profile>): Promise<Profile>;
  
  // Subject operations
  getAllSubjects(): Promise<Subject[]>;
  getSubjectsBySystem(examinationSystemId: string, levelId?: string): Promise<Subject[]>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  
  // Topic operations
  getTopicsBySubjectAndLevel(subjectId: string, levelId: string, termId?: string): Promise<Topic[]>;
  getTopicsByTerm(termId: string): Promise<Topic[]>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  
  // Question operations
  getQuestionsByTopic(topicId: string, limit?: number): Promise<Question[]>;
  getRandomQuestions(subjectId: string, levelId: string, limit?: number): Promise<Question[]>;
  getTermQuestions(subjectId: string, levelId: string, termId: string, limit?: number): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  createQuestions(questions: InsertQuestion[]): Promise<Question[]>;
  
  // Quiz session operations
  createQuizSession(session: InsertQuizSession): Promise<QuizSession>;
  updateQuizSession(sessionId: string, data: Partial<QuizSession>): Promise<QuizSession>;
  getQuizSession(sessionId: string): Promise<QuizSession | undefined>;
  getProfileQuizSessions(profileId: string, limit?: number): Promise<QuizSession[]>;
  
  // User answer operations
  createUserAnswer(answer: InsertUserAnswer): Promise<UserAnswer>;
  getQuizAnswers(quizSessionId: string): Promise<UserAnswer[]>;
  
  // Challenge operations
  getTodaysChallenge(): Promise<DailyChallenge | undefined>;
  createDailyChallenge(challenge: InsertDailyChallenge): Promise<DailyChallenge>;
  getProfileChallengeProgress(profileId: string, challengeId: string): Promise<UserChallengeProgress | undefined>;
  updateChallengeProgress(profileId: string, challengeId: string, progress: Partial<InsertUserChallengeProgress>): Promise<UserChallengeProgress>;
  
  // Analytics operations
  getProfileStats(profileId: string): Promise<any>;
  getSubjectPerformance(profileId: string, subjectId: string): Promise<any>;
  updateProfileSparks(profileId: string, sparks: number): Promise<Profile>;
  updateProfileStreak(profileId: string): Promise<Profile>;
  
  // Admin quiz operations
  getAdminQuizList(filters?: any): Promise<any[]>;
  getRecentActivity(): Promise<any[]>;
  getTopPerformers(): Promise<any[]>;
  
  // Admin user operations
  getAdminUserList(filters?: any): Promise<any[]>;
  getAdminUserStats(): Promise<any>;
  
  // Quiz History
  getQuizHistoryForUser(userId: string): Promise<any[]>;
  
  // Today's leaderboard
  getTodayLeaderboard(): Promise<any[]>;
  
  // Enhanced Analytics Operations
  getTotalUsersCount(): Promise<number>;
  getTotalQuizzesCount(): Promise<number>;
  getTotalSessionsCount(): Promise<number>;
  getAverageScore(): Promise<number>;
  getQuizActivityByDay(): Promise<any[]>;
  getSubjectDistribution(): Promise<any[]>;
  getDailyTopPerformers(): Promise<any[]>;
  getWeeklyTopPerformers(): Promise<any[]>;
  getMonthlyTopPerformers(): Promise<any[]>;
  getEngagementMetrics(): Promise<any>;
  getPerformanceMetrics(): Promise<any>;

  // Subscription Management Operations
  getSubscriptionPlans(): Promise<any[]>;
  getUserSubscription(userId: string): Promise<any>;
  createSubscription(subscription: any): Promise<any>;
  updateSubscription(subscriptionId: string, data: any): Promise<any>;
  getUserCredits(userId: string): Promise<number>;
  addCredits(userId: string, amount: number, description: string): Promise<any>;
  deductCredits(userId: string, amount: number, description: string): Promise<any>;
  createPaymentTransaction(transaction: any): Promise<any>;
  updatePaymentTransaction(transactionId: string, data: any): Promise<any>;
  getPaymentHistory(userId: string): Promise<any[]>;
  getCreditTransactions(userId: string): Promise<any[]>;
  
  // Topic management operations
  getAdminTopicList(filters?: any): Promise<any[]>;
  createTopic(topicData: InsertTopic): Promise<Topic>;
  updateTopic(topicId: string, updateData: Partial<InsertTopic>): Promise<Topic>;
  deleteTopic(topicId: string): Promise<void>;

  // Quiz types management
  getQuizTypes(): Promise<any[]>;
  createQuizType(data: any): Promise<any>;
  updateQuizType(id: string, data: any): Promise<any>;
  deleteQuizType(id: string): Promise<void>;

  // Quiz details for preview
  getQuizDetails(quizId: string): Promise<any>;

  // Gamification operations
  getBadgeTypes(): Promise<BadgeType[]>;
  getBadges(): Promise<Badge[]>;
  getUserBadges(userId: string): Promise<UserBadge[]>;
  awardBadge(userId: string, badgeId: string, streaks?: number): Promise<UserBadge>;
  getTrophies(): Promise<Trophy[]>;
  getUserTrophies(userId: string): Promise<UserTrophy[]>;
  awardTrophy(userId: string, trophyId: string): Promise<UserTrophy>;
  getChallenges(): Promise<Challenge[]>;
  getUserChallenges(userId: string): Promise<UserChallenge[]>;
  updateChallengeProgress(userId: string, challengeId: string, progress: number): Promise<UserChallenge>;
  completeChallenge(userId: string, challengeId: string): Promise<UserChallenge>;
  getUserSparkBoosts(userId: string): Promise<UserSparkBoost[]>;
  createSparkBoost(fromUserId: string, toUserId: string, sparks: number): Promise<UserSparkBoost>;
  canBoostUser(fromUserId: string): Promise<boolean>;

  // Platform Settings operations
  getGeneralSettings(): Promise<GeneralSettings>;
  updateGeneralSettings(settings: Partial<InsertGeneralSettings>, updatedBy: string): Promise<GeneralSettings>;
  getQuizSettings(): Promise<QuizSettings>;
  updateQuizSettings(settings: Partial<InsertQuizSettings>, updatedBy: string): Promise<QuizSettings>;
  getNotificationSettings(): Promise<NotificationSettings>;
  updateNotificationSettings(settings: Partial<InsertNotificationSettings>, updatedBy: string): Promise<NotificationSettings>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Examination system operations
  async getExaminationSystems(): Promise<ExaminationSystem[]> {
    const systems = await db.select().from(examinationSystems).where(eq(examinationSystems.isActive, true));
    
    // Add calculated fields for each system
    const systemsWithMetrics = await Promise.all(
      systems.map(async (system) => {
        try {
          // Get quiz count for this examination system
          const quizCountResult = await db
            .select({ count: sql`count(*)` })
            .from(quizSessions)
            .innerJoin(profiles, eq(quizSessions.profileId, profiles.id))
            .where(eq(profiles.examinationSystemId, system.id));
          
          // Get quiz attempts count
          const attemptCountResult = await db
            .select({ count: sql`count(*)` })
            .from(quizSessions)
            .innerJoin(profiles, eq(quizSessions.profileId, profiles.id))
            .where(and(
              eq(profiles.examinationSystemId, system.id),
              eq(quizSessions.completed, true)
            ));
          
          // Get unique users count
          const userCountResult = await db
            .select({ count: sql`count(distinct ${profiles.userId})` })
            .from(profiles)
            .where(eq(profiles.examinationSystemId, system.id));

          // Get subjects count for this examination system
          const subjectsCountResult = await db
            .select({ count: sql`count(*)` })
            .from(subjects)
            .where(eq(subjects.examinationSystemId, system.id));

          // Get topics count for this examination system
          const topicsCountResult = await db
            .select({ count: sql`count(*)` })
            .from(topics)
            .where(eq(topics.examinationSystemId, system.id));

          return {
            ...system,
            quizCount: Number(quizCountResult[0]?.count || 0),
            quizAttempts: Number(attemptCountResult[0]?.count || 0),
            usersCount: Number(userCountResult[0]?.count || 0),
            subjectsCount: Number(subjectsCountResult[0]?.count || 0),
            topicsCount: Number(topicsCountResult[0]?.count || 0)
          };
        } catch (error) {
          console.error(`Error calculating metrics for system ${system.id}:`, error);
          return {
            ...system,
            quizCount: 0,
            quizAttempts: 0,
            usersCount: 0,
            subjectsCount: 0,
            topicsCount: 0
          };
        }
      })
    );
    
    return systemsWithMetrics;
  }

  async createExaminationSystem(system: InsertExaminationSystem): Promise<ExaminationSystem> {
    const [newSystem] = await db.insert(examinationSystems).values(system).returning();
    return newSystem;
  }

  // Level operations
  async getAllLevels(): Promise<Level[]> {
    const levelsList = await db.select().from(levels)
      .where(eq(levels.isActive, true))
      .orderBy(levels.order);
    
    // Add calculated fields for each level
    const levelsWithMetrics = await Promise.all(
      levelsList.map(async (level) => {
        try {
          // Get quiz count for this level
          const quizCountResult = await db
            .select({ count: sql`count(*)` })
            .from(quizSessions)
            .innerJoin(profiles, eq(quizSessions.profileId, profiles.id))
            .where(eq(profiles.levelId, level.id));
          
          // Get quiz attempts count (completed sessions)
          const attemptCountResult = await db
            .select({ count: sql`count(*)` })
            .from(quizSessions)
            .innerJoin(profiles, eq(quizSessions.profileId, profiles.id))
            .where(and(
              eq(profiles.levelId, level.id),
              eq(quizSessions.completed, true)
            ));
          
          // Get unique users count for this level
          const userCountResult = await db
            .select({ count: sql`count(distinct ${profiles.userId})` })
            .from(profiles)
            .where(eq(profiles.levelId, level.id));

          // Get topics count for this level
          const topicsCountResult = await db
            .select({ count: sql`count(*)` })
            .from(topics)
            .where(eq(topics.levelId, level.id));

          return {
            ...level,
            quizCount: Number(quizCountResult[0]?.count || 0),
            quizAttempts: Number(attemptCountResult[0]?.count || 0),
            usersCount: Number(userCountResult[0]?.count || 0),
            topicsCount: Number(topicsCountResult[0]?.count || 0)
          };
        } catch (error) {
          console.error(`Error calculating metrics for level ${level.id}:`, error);
          return {
            ...level,
            quizCount: 0,
            quizAttempts: 0,
            usersCount: 0,
            topicsCount: 0
          };
        }
      })
    );
    
    return levelsWithMetrics;
  }

  async getLevelsBySystem(examinationSystemId: string): Promise<Level[]> {
    return await db.select().from(levels)
      .where(and(eq(levels.examinationSystemId, examinationSystemId), eq(levels.isActive, true)))
      .orderBy(levels.order);
  }

  async createLevel(level: InsertLevel): Promise<Level> {
    const [newLevel] = await db.insert(levels).values(level).returning();
    return newLevel;
  }

  // Term operations
  async getTerms(): Promise<Term[]> {
    const termsList = await db.select().from(terms).orderBy(terms.order);
    
    // Add calculated fields for each term
    const termsWithMetrics = await Promise.all(
      termsList.map(async (term) => {
        try {
          // Get quiz count for topics in this term
          const quizCountResult = await db
            .select({ count: sql`count(*)` })
            .from(quizSessions)
            .innerJoin(topics, eq(quizSessions.topicId, topics.id))
            .where(eq(topics.termId, term.id));
          
          // Get quiz attempts count (completed sessions for this term)
          const attemptCountResult = await db
            .select({ count: sql`count(*)` })
            .from(quizSessions)
            .innerJoin(topics, eq(quizSessions.topicId, topics.id))
            .where(and(
              eq(topics.termId, term.id),
              eq(quizSessions.completed, true)
            ));
          
          // Get unique users count who attempted quizzes in this term
          const userCountResult = await db
            .select({ count: sql`count(distinct ${quizSessions.profileId})` })
            .from(quizSessions)
            .innerJoin(topics, eq(quizSessions.topicId, topics.id))
            .where(eq(topics.termId, term.id));

          return {
            ...term,
            quizCount: Number(quizCountResult[0]?.count || 0),
            quizAttempts: Number(attemptCountResult[0]?.count || 0),
            usersCount: Number(userCountResult[0]?.count || 0)
          };
        } catch (error) {
          console.error(`Error calculating metrics for term ${term.id}:`, error);
          return {
            ...term,
            quizCount: 0,
            quizAttempts: 0,
            usersCount: 0
          };
        }
      })
    );
    
    return termsWithMetrics;
  }

  // Profile operations
  async getUserProfiles(userId: string): Promise<Profile[]> {
    return await db.select().from(profiles)
      .where(and(eq(profiles.userId, userId), eq(profiles.isActive, true)))
      .orderBy(desc(profiles.createdAt));
  }

  async getProfile(profileId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, profileId));
    return profile;
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const [newProfile] = await db.insert(profiles).values(profile).returning();
    return newProfile;
  }

  async setDefaultProfile(userId: string, profileId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        defaultProfileId: profileId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateProfile(profileId: string, data: Partial<Profile>): Promise<Profile> {
    const [profile] = await db
      .update(profiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(profiles.id, profileId))
      .returning();
    return profile;
  }

  // Subject operations
  async getAllSubjects(): Promise<Subject[]> {
    const subjectsList = await db.select().from(subjects)
      .orderBy(subjects.name);
    
    // Add calculated fields for each subject
    const subjectsWithMetrics = await Promise.all(
      subjectsList.map(async (subject) => {
        try {
          // Get quiz count for this subject
          const quizCountResult = await db
            .select({ count: sql`count(*)` })
            .from(quizSessions)
            .innerJoin(topics, eq(quizSessions.topicId, topics.id))
            .where(eq(topics.subjectId, subject.id));
          
          // Get quiz attempts count (completed sessions)
          const attemptCountResult = await db
            .select({ count: sql`count(*)` })
            .from(quizSessions)
            .innerJoin(topics, eq(quizSessions.topicId, topics.id))
            .where(and(
              eq(topics.subjectId, subject.id),
              eq(quizSessions.completed, true)
            ));
          
          // Get unique users count who attempted quizzes in this subject
          const userCountResult = await db
            .select({ count: sql`count(distinct ${quizSessions.profileId})` })
            .from(quizSessions)
            .innerJoin(topics, eq(quizSessions.topicId, topics.id))
            .where(eq(topics.subjectId, subject.id));

          // Get topics count for this subject
          const topicsCountResult = await db
            .select({ count: sql`count(*)` })
            .from(topics)
            .where(eq(topics.subjectId, subject.id));

          return {
            ...subject,
            quizCount: Number(quizCountResult[0]?.count || 0),
            quizAttempts: Number(attemptCountResult[0]?.count || 0),
            usersCount: Number(userCountResult[0]?.count || 0),
            topicsCount: Number(topicsCountResult[0]?.count || 0)
          };
        } catch (error) {
          console.error(`Error calculating metrics for subject ${subject.id}:`, error);
          return {
            ...subject,
            quizCount: 0,
            quizAttempts: 0,
            usersCount: 0,
            topicsCount: 0
          };
        }
      })
    );
    
    return subjectsWithMetrics;
  }

  async getSubjectsBySystem(examinationSystemId: string, levelId?: string): Promise<Subject[]> {
    const subjectList = await db.select().from(subjects).where(eq(subjects.examinationSystemId, examinationSystemId));
    
    // Get quiz counts for each subject, filtered by examination system and level
    const subjectsWithCounts = await Promise.all(
      subjectList.map(async (subject) => {
        try {
          // Count actual quizzes for this subject
          const quizCountResult = await db
            .select({ count: sql`count(*)` })
            .from(quizzes)
            .where(eq(quizzes.subjectId, subject.id));
          
          const quizCount = Number(quizCountResult[0]?.count || 0);
          
          return {
            ...subject,
            quizCount: quizCount
          };
        } catch (error) {
          console.error(`Error counting questions for subject ${subject.id}:`, error);
          return {
            ...subject,
            quizCount: 0
          };
        }
      })
    );
    
    return subjectsWithCounts;
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    const [newSubject] = await db.insert(subjects).values(subject).returning();
    return newSubject;
  }

  // Topic operations
  async getTopicsBySubjectAndLevel(subjectId: string, levelId: string, termId?: string): Promise<Topic[]> {
    let whereConditions = [eq(topics.subjectId, subjectId), eq(topics.levelId, levelId)];
    
    if (termId) {
      whereConditions.push(eq(topics.termId, termId));
    }
    
    return await db.select().from(topics)
      .where(and(...whereConditions))
      .orderBy(topics.order);
  }

  async getTopicsByTerm(termId: string): Promise<Topic[]> {
    return await db.select().from(topics)
      .where(eq(topics.termId, termId))
      .orderBy(topics.order);
  }

  async createTopic(topic: InsertTopic): Promise<Topic> {
    const [newTopic] = await db.insert(topics).values(topic).returning();
    return newTopic;
  }

  // Question operations
  async getQuestionsByTopic(topicId: string, limit: number = 30): Promise<Question[]> {
    return await db.select().from(questions)
      .where(eq(questions.topicId, topicId))
      .orderBy(sql`RANDOM()`)
      .limit(limit);
  }

  async getRandomQuestions(subjectId: string, levelId: string, limit: number = 30): Promise<Question[]> {
    return await db.select({
      id: questions.id,
      topicId: questions.topicId,
      questionText: questions.questionText,
      optionA: questions.optionA,
      optionB: questions.optionB,
      optionC: questions.optionC,
      optionD: questions.optionD,
      correctAnswer: questions.correctAnswer,
      explanation: questions.explanation,
      difficulty: questions.difficulty,
      createdAt: questions.createdAt,
    })
    .from(questions)
    .innerJoin(topics, eq(questions.topicId, topics.id))
    .where(and(eq(topics.subjectId, subjectId), eq(topics.levelId, levelId)))
    .orderBy(sql`RANDOM()`)
    .limit(limit);
  }

  async getTermQuestions(subjectId: string, levelId: string, termId: string, limit: number = 30): Promise<Question[]> {
    return await db.select({
      id: questions.id,
      topicId: questions.topicId,
      questionText: questions.questionText,
      optionA: questions.optionA,
      optionB: questions.optionB,
      optionC: questions.optionC,
      optionD: questions.optionD,
      correctAnswer: questions.correctAnswer,
      explanation: questions.explanation,
      difficulty: questions.difficulty,
      createdAt: questions.createdAt,
    })
    .from(questions)
    .innerJoin(topics, eq(questions.topicId, topics.id))
    .where(and(
      eq(topics.subjectId, subjectId),
      eq(topics.levelId, levelId),
      eq(topics.termId, termId)
    ))
    .orderBy(sql`RANDOM()`)
    .limit(limit);
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [newQuestion] = await db.insert(questions).values(question).returning();
    return newQuestion;
  }

  async createQuestions(questionsData: InsertQuestion[]): Promise<Question[]> {
    return await db.insert(questions).values(questionsData).returning();
  }

  // Quiz session operations
  async createQuizSession(session: InsertQuizSession): Promise<QuizSession> {
    console.log('=== STORAGE: Creating quiz session ===');
    console.log('Input session data:', JSON.stringify(session, null, 2));
    console.log('Input questions count:', session.quizQuestions ? session.quizQuestions.length : 'undefined');
    console.log('Input questions details:', JSON.stringify(session.quizQuestions, null, 2));
    
    const [newSession] = await db.insert(quizSessions).values(session).returning();
    
    console.log('=== STORAGE: Session created ===');
    console.log('Returned session ID:', newSession.id);
    console.log('Returned questions count:', newSession.quizQuestions ? newSession.quizQuestions.length : 'undefined');
    console.log('Returned questions:', JSON.stringify(newSession.quizQuestions, null, 2));
    
    return newSession;
  }

  async getIncompleteQuizSession(profileId: string, subjectId: string): Promise<QuizSession | undefined> {
    const [incompleteSession] = await db
      .select()
      .from(quizSessions)
      .where(and(
        eq(quizSessions.profileId, profileId),
        eq(quizSessions.subjectId, subjectId),
        eq(quizSessions.completed, false)
      ))
      .orderBy(desc(quizSessions.startedAt))
      .limit(1);
    
    return incompleteSession;
  }

  async deleteIncompleteQuizSessions(profileId: string, subjectId: string): Promise<void> {
    await db
      .delete(quizSessions)
      .where(and(
        eq(quizSessions.profileId, profileId),
        eq(quizSessions.subjectId, subjectId),
        eq(quizSessions.completed, false)
      ));
  }

  async updateQuizSession(sessionId: string, data: Partial<QuizSession>): Promise<QuizSession> {
    const [updatedSession] = await db
      .update(quizSessions)
      .set(data)
      .where(eq(quizSessions.id, sessionId))
      .returning();
    return updatedSession;
  }

  async getQuizSession(sessionId: string): Promise<QuizSession | undefined> {
    const [session] = await db.select().from(quizSessions).where(eq(quizSessions.id, sessionId));
    return session;
  }

  async getProfileQuizSessions(profileId: string, limit: number = 10): Promise<QuizSession[]> {
    return await db.select().from(quizSessions)
      .where(eq(quizSessions.profileId, profileId))
      .orderBy(desc(quizSessions.startedAt))
      .limit(limit);
  }

  // User answer operations
  async createUserAnswer(answer: InsertUserAnswer): Promise<UserAnswer> {
    const [newAnswer] = await db.insert(userAnswers).values(answer).returning();
    return newAnswer;
  }

  async getQuizAnswers(quizSessionId: string): Promise<UserAnswer[]> {
    return await db.select().from(userAnswers)
      .where(eq(userAnswers.quizSessionId, quizSessionId))
      .orderBy(userAnswers.answeredAt);
  }

  // Challenge operations
  async getTodaysChallenge(): Promise<DailyChallenge | undefined> {
    const today = new Date().toISOString().split('T')[0];
    const [challenge] = await db.select().from(dailyChallenges)
      .where(eq(dailyChallenges.date, today));
    return challenge;
  }

  async createDailyChallenge(challenge: InsertDailyChallenge): Promise<DailyChallenge> {
    const [newChallenge] = await db.insert(dailyChallenges).values(challenge).returning();
    return newChallenge;
  }

  async getProfileChallengeProgress(profileId: string, challengeId: string): Promise<UserChallengeProgress | undefined> {
    const [progress] = await db.select().from(userChallengeProgress)
      .where(and(
        eq(userChallengeProgress.profileId, profileId),
        eq(userChallengeProgress.challengeId, challengeId)
      ));
    return progress;
  }

  async updateChallengeProgress(profileId: string, challengeId: string, progress: Partial<InsertUserChallengeProgress>): Promise<UserChallengeProgress> {
    const [updatedProgress] = await db
      .insert(userChallengeProgress)
      .values({
        profileId,
        challengeId,
        ...progress,
      })
      .onConflictDoUpdate({
        target: [userChallengeProgress.profileId, userChallengeProgress.challengeId],
        set: progress,
      })
      .returning();
    return updatedProgress;
  }

  // Analytics operations
  async getProfileStats(profileId: string): Promise<any> {
    const [totalQuizzes] = await db.select({ count: count() })
      .from(quizSessions)
      .where(and(eq(quizSessions.profileId, profileId), eq(quizSessions.completed, true)));

    const [avgScore] = await db.select({ 
      avg: avg(sql`CAST(${quizSessions.correctAnswers} AS DECIMAL) / ${quizSessions.totalQuestions} * 100`) 
    })
      .from(quizSessions)
      .where(and(eq(quizSessions.profileId, profileId), eq(quizSessions.completed, true)));

    const [totalSparks] = await db.select({ total: sql`SUM(${quizSessions.sparksEarned})` })
      .from(quizSessions)
      .where(eq(quizSessions.profileId, profileId));

    return {
      totalQuizzes: totalQuizzes.count || 0,
      averageScore: Math.round(avgScore.avg || 0),
      totalSparks: totalSparks.total || 0,
    };
  }

  async getSubjectPerformance(profileId: string, subjectId: string): Promise<any> {
    const sessions = await db.select().from(quizSessions)
      .where(and(
        eq(quizSessions.profileId, profileId),
        eq(quizSessions.subjectId, subjectId),
        eq(quizSessions.completed, true)
      ))
      .orderBy(desc(quizSessions.completedAt));

    return sessions.map(session => ({
      date: session.completedAt,
      score: session.correctAnswers,
      totalQuestions: session.totalQuestions,
      percentage: Math.round((session.correctAnswers / session.totalQuestions) * 100),
    }));
  }

  async updateProfileSparks(profileId: string, sparks: number): Promise<Profile> {
    const [profile] = await db
      .update(profiles)
      .set({
        sparks: sql`${profiles.sparks} + ${sparks}`,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, profileId))
      .returning();
    return profile;
  }

  async updateProfileStreak(profileId: string): Promise<Profile> {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const profile = await this.getProfile(profileId);
    if (!profile) throw new Error('Profile not found');

    const lastActivity = profile.lastActivity ? new Date(profile.lastActivity) : null;
    let newStreak = 1;

    if (lastActivity) {
      const lastActivityDate = new Date(lastActivity.toISOString().split('T')[0]);
      const yesterdayDate = new Date(yesterday.toISOString().split('T')[0]);
      
      if (lastActivityDate.getTime() === yesterdayDate.getTime()) {
        newStreak = (profile.streak || 0) + 1;
      }
    }

    const [updatedProfile] = await db
      .update(profiles)
      .set({
        streak: newStreak,
        lastActivity: today,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, profileId))
      .returning();

    return updatedProfile;
  }

  // Leaderboard operations
  async getLeaderboard(): Promise<any[]> {
    const leaderboardData = await db.select({
      userId: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      profileImageUrl: users.profileImageUrl,
      sparks: profiles.sparks,
      streak: profiles.streak,
      profileId: profiles.id,
    })
    .from(profiles)
    .innerJoin(users, eq(profiles.userId, users.id))
    .where(eq(profiles.isActive, true))
    .orderBy(desc(profiles.sparks), desc(profiles.streak));

    // Get quiz stats for each profile
    const leaderboard = await Promise.all(
      leaderboardData.map(async (entry, index) => {
        const [quizStats] = await db.select({
          totalQuizzes: count(quizSessions.id),
          correctAnswers: sql<number>`SUM(CASE WHEN ${quizSessions.completed} = true THEN ${quizSessions.correctAnswers} ELSE 0 END)`,
          totalQuestions: sql<number>`SUM(CASE WHEN ${quizSessions.completed} = true THEN ${quizSessions.totalQuestions} ELSE 0 END)`,
        })
        .from(quizSessions)
        .where(eq(quizSessions.profileId, entry.profileId));

        const avgScore = quizStats.totalQuestions > 0 
          ? Math.round((quizStats.correctAnswers / quizStats.totalQuestions) * 100)
          : 0;

        return {
          rank: index + 1,
          userId: entry.userId,
          firstName: entry.firstName || 'Student',
          lastName: entry.lastName || '',
          profileImageUrl: entry.profileImageUrl,
          sparks: entry.sparks || 0,
          streak: entry.streak || 0,
          quizzesCompleted: quizStats.totalQuizzes || 0,
          averageScore: avgScore,
          lastActive: new Date().toISOString(),
        };
      })
    );

    return leaderboard;
  }

  async updateProfile(profileId: string, data: Partial<Profile>): Promise<Profile> {
    const [updatedProfile] = await db
      .update(profiles)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, profileId))
      .returning();

    return updatedProfile;
  }

  // Quiz types operations
  async getQuizTypes() {
    return await db.select().from(quizTypes);
  }

  async getQuestionTypes() {
    return await db.select().from(questionTypes);
  }

  // Admin analytics methods
  async getTotalUsersCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(users);
    return result[0].count;
  }

  async getTotalQuizzesCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(quizzes);
    return result[0].count;
  }

  async getTotalSessionsCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(quizSessions);
    return result[0].count;
  }

  async getAverageScore(): Promise<number> {
    const completedSessions = await db
      .select({
        correctAnswers: quizSessions.correctAnswers,
        totalQuestions: quizSessions.totalQuestions,
      })
      .from(quizSessions)
      .where(eq(quizSessions.completed, true));
    
    if (completedSessions.length === 0) return 0;
    
    const totalScore = completedSessions.reduce((sum, session) => {
      const accuracy = (session.totalQuestions || 0) > 0 ? 
        ((session.correctAnswers || 0) / (session.totalQuestions || 1)) * 100 : 0;
      return sum + accuracy;
    }, 0);
    
    return Math.round(totalScore / completedSessions.length);
  }

  async getQuizActivityByDay(): Promise<any[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activities = await db
      .select({
        date: sql<string>`DATE(${quizSessions.startedAt})`,
        count: sql<number>`count(*)`,
      })
      .from(quizSessions)
      .where(gte(quizSessions.startedAt, sevenDaysAgo))
      .groupBy(sql`DATE(${quizSessions.startedAt})`)
      .orderBy(sql`DATE(${quizSessions.startedAt})`);

    // Fill in missing days with 0 count
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const activity = activities.find(a => a.date === dateStr);
      result.push({
        name: dayName,
        quizzes: activity ? activity.count : 0,
        date: dateStr
      });
    }
    
    return result;
  }

  async getSubjectDistribution(): Promise<any[]> {
    const distribution = await db
      .select({
        subjectName: subjects.name,
        count: sql<number>`count(*)`,
      })
      .from(quizSessions)
      .leftJoin(subjects, eq(quizSessions.subjectId, subjects.id))
      .where(eq(quizSessions.completed, true))
      .groupBy(subjects.name, subjects.id)
      .orderBy(sql`count(*) DESC`)
      .limit(5);

    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];
    
    return distribution.map((item, index) => ({
      name: item.subjectName || 'Unknown',
      value: item.count,
      color: colors[index] || '#8884d8'
    }));
  }

  async getDailyTopPerformers(): Promise<any[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const performers = await db
      .select({
        userId: profiles.userId,
        profileId: profiles.id,
        firstName: users.firstName,
        lastName: users.lastName,
        sparks: sql<number>`COALESCE(SUM(${quizSessions.sparksEarned}), 0)`,
        quizCount: sql<number>`COUNT(${quizSessions.id})`,
        avgScore: sql<number>`COALESCE(AVG(CAST(${quizSessions.correctAnswers} AS FLOAT) / NULLIF(${quizSessions.totalQuestions}, 0) * 100), 0)`,
      })
      .from(quizSessions)
      .leftJoin(profiles, eq(quizSessions.profileId, profiles.id))
      .leftJoin(users, eq(profiles.userId, users.id))
      .where(
        and(
          gte(quizSessions.completedAt, today),
          lte(quizSessions.completedAt, tomorrow),
          eq(quizSessions.completed, true)
        )
      )
      .groupBy(profiles.userId, profiles.id, users.firstName, users.lastName)
      .orderBy(sql`COALESCE(SUM(${quizSessions.sparksEarned}), 0) DESC`)
      .limit(10);

    return performers.map((p, index) => ({
      rank: index + 1,
      name: `${p.firstName || 'Student'} ${p.lastName || ''}`.trim(),
      sparks: p.sparks || 0,
      quizCount: p.quizCount || 0,
      avgScore: Math.round(p.avgScore || 0),
      period: 'daily'
    }));
  }

  async getWeeklyTopPerformers(): Promise<any[]> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const performers = await db
      .select({
        userId: profiles.userId,
        profileId: profiles.id,
        firstName: users.firstName,
        lastName: users.lastName,
        sparks: sql<number>`COALESCE(SUM(${quizSessions.sparksEarned}), 0)`,
        quizCount: sql<number>`COUNT(${quizSessions.id})`,
        avgScore: sql<number>`COALESCE(AVG(CAST(${quizSessions.correctAnswers} AS FLOAT) / NULLIF(${quizSessions.totalQuestions}, 0) * 100), 0)`,
      })
      .from(quizSessions)
      .leftJoin(profiles, eq(quizSessions.profileId, profiles.id))
      .leftJoin(users, eq(profiles.userId, users.id))
      .where(
        and(
          gte(quizSessions.completedAt, weekAgo),
          eq(quizSessions.completed, true)
        )
      )
      .groupBy(profiles.userId, profiles.id, users.firstName, users.lastName)
      .orderBy(sql`COALESCE(SUM(${quizSessions.sparksEarned}), 0) DESC`)
      .limit(10);

    return performers.map((p, index) => ({
      rank: index + 1,
      name: `${p.firstName || 'Student'} ${p.lastName || ''}`.trim(),
      sparks: p.sparks || 0,
      quizCount: p.quizCount || 0,
      avgScore: Math.round(p.avgScore || 0),
      period: 'weekly'
    }));
  }

  async getMonthlyTopPerformers(): Promise<any[]> {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    monthAgo.setHours(0, 0, 0, 0);

    const performers = await db
      .select({
        userId: profiles.userId,
        profileId: profiles.id,
        firstName: users.firstName,
        lastName: users.lastName,
        sparks: sql<number>`COALESCE(SUM(${quizSessions.sparksEarned}), 0)`,
        quizCount: sql<number>`COUNT(${quizSessions.id})`,
        avgScore: sql<number>`COALESCE(AVG(CAST(${quizSessions.correctAnswers} AS FLOAT) / NULLIF(${quizSessions.totalQuestions}, 0) * 100), 0)`,
      })
      .from(quizSessions)
      .leftJoin(profiles, eq(quizSessions.profileId, profiles.id))
      .leftJoin(users, eq(profiles.userId, users.id))
      .where(
        and(
          gte(quizSessions.completedAt, monthAgo),
          eq(quizSessions.completed, true)
        )
      )
      .groupBy(profiles.userId, profiles.id, users.firstName, users.lastName)
      .orderBy(sql`COALESCE(SUM(${quizSessions.sparksEarned}), 0) DESC`)
      .limit(10);

    return performers.map((p, index) => ({
      rank: index + 1,
      name: `${p.firstName || 'Student'} ${p.lastName || ''}`.trim(),
      sparks: p.sparks || 0,
      quizCount: p.quizCount || 0,
      avgScore: Math.round(p.avgScore || 0),
      period: 'monthly'
    }));
  }

  async getEngagementMetrics(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [todayUsers, yesterdayUsers, weeklyUsers, totalUsers] = await Promise.all([
      // Users active today
      db.select({ count: sql<number>`count(DISTINCT ${quizSessions.userId})` })
        .from(quizSessions)
        .where(gte(quizSessions.startedAt, today)),
      
      // Users active yesterday
      db.select({ count: sql<number>`count(DISTINCT ${quizSessions.userId})` })
        .from(quizSessions)
        .where(and(gte(quizSessions.startedAt, yesterday), lte(quizSessions.startedAt, today))),
      
      // Users active this week
      db.select({ count: sql<number>`count(DISTINCT ${quizSessions.userId})` })
        .from(quizSessions)
        .where(gte(quizSessions.startedAt, weekAgo)),
      
      // Total users
      db.select({ count: sql<number>`count(*)` }).from(users)
    ]);

    const todayCount = todayUsers[0].count;
    const yesterdayCount = yesterdayUsers[0].count;
    const weeklyCount = weeklyUsers[0].count;
    const totalCount = totalUsers[0].count;

    return {
      dailyActiveUsers: todayCount,
      weeklyActiveUsers: weeklyCount,
      totalUsers: totalCount,
      dailyGrowth: yesterdayCount > 0 ? Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100) : 0,
      weeklyEngagementRate: totalCount > 0 ? Math.round((weeklyCount / totalCount) * 100) : 0
    };
  }

  async getPerformanceMetrics(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [completedSessions, avgSessionTime, topSubjects] = await Promise.all([
      // Completion rate this week
      db.select({
        total: sql<number>`count(*)`,
        completed: sql<number>`count(CASE WHEN ${quizSessions.completed} = true THEN 1 END)`
      })
      .from(quizSessions)
      .where(gte(quizSessions.startedAt, weekAgo)),
      
      // Average session time
      db.select({
        avgTime: sql<number>`AVG(${quizSessions.timeSpent})`
      })
      .from(quizSessions)
      .where(and(
        eq(quizSessions.completed, true),
        gte(quizSessions.completedAt, weekAgo)
      )),
      
      // Most popular subjects
      db.select({
        subjectName: subjects.name,
        sessionCount: sql<number>`count(*)`
      })
      .from(quizSessions)
      .leftJoin(subjects, eq(quizSessions.subjectId, subjects.id))
      .where(gte(quizSessions.startedAt, weekAgo))
      .groupBy(subjects.name)
      .orderBy(sql`count(*) DESC`)
      .limit(3)
    ]);

    const sessionData = completedSessions[0];
    const timeData = avgSessionTime[0];
    
    return {
      completionRate: sessionData.total > 0 ? Math.round((sessionData.completed / sessionData.total) * 100) : 0,
      averageSessionTime: Math.round((timeData.avgTime || 0) / 60), // Convert to minutes
      topSubjects: topSubjects.map(s => ({
        name: s.subjectName || 'Unknown',
        sessions: s.sessionCount
      })),
      weeklyQuizzes: sessionData.total
    };
  }

  async getAdminQuizList(filters: any): Promise<any[]> {
    // Fetch from the correct quizzes table (admin-created templates) with joins
    const quizTemplates = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        subjectId: quizzes.subjectId,
        levelId: quizzes.levelId,
        examinationSystemId: quizzes.examinationSystemId,
        questionCount: quizzes.totalQuestions,
        timeLimit: quizzes.timeLimit,
        createdAt: quizzes.createdAt,
        subjectName: subjects.name,
        levelTitle: levels.title,
        examinationSystemName: examinationSystems.name,
      })
      .from(quizzes)
      .leftJoin(subjects, eq(quizzes.subjectId, subjects.id))
      .leftJoin(levels, eq(quizzes.levelId, levels.id))
      .leftJoin(examinationSystems, eq(quizzes.examinationSystemId, examinationSystems.id))
      .orderBy(desc(quizzes.createdAt));

    // Get actual question counts and session counts
    const quizList = await Promise.all(
      quizTemplates.map(async (quiz) => {
        // Get the full quiz data including JSONB questions
        const [fullQuiz] = await db
          .select({
            questions: quizzes.questions,
            quizType: quizzes.quizType
          })
          .from(quizzes)
          .where(eq(quizzes.id, quiz.id));

        // Count questions from JSONB field
        const questionsArray = fullQuiz?.questions as any[] || [];
        const questionCount = questionsArray.length;

        // Count sessions using this quiz template
        const [sessionCount] = await db
          .select({ count: count() })
          .from(quizSessions)
          .where(eq(quizSessions.subjectId, quiz.subjectId));

        return {
          id: quiz.id,
          title: quiz.title,
          subject: quiz.subjectName || 'Unknown',
          examination_system: quiz.examinationSystemName || 'Unknown',
          level: quiz.levelTitle || 'Unknown',
          type: fullQuiz?.quizType || 'topical',
          questions: questionCount, // Use actual count from JSONB questions array
          sessions: sessionCount?.count || 0,
          users: sessionCount?.count || 0,
          created: quiz.createdAt,
          actions: 'View | Edit | Delete'
        };
      })
    );

    return quizList;
  }

  async getRecentActivity(): Promise<any[]> {
    const recentSessions = await db
      .select({
        userId: quizSessions.userId,
        startedAt: quizSessions.startedAt,
        quizType: quizSessions.quizType,
      })
      .from(quizSessions)
      .orderBy(desc(quizSessions.startedAt))
      .limit(10);

    return recentSessions.map((session) => ({
      action: `Started ${session.quizType} quiz`,
      user: `User ${session.userId.slice(-6)}`,
      time: this.getTimeAgo(session.startedAt || new Date()),
      type: 'Session'
    }));
  }

  async getTopPerformers(): Promise<any[]> {
    const leaderboard = await this.getLeaderboard();
    return leaderboard.slice(0, 5).map(entry => ({
      name: `${entry.firstName || 'Student'} ${entry.lastName || ''}`.trim(),
      sparks: entry.sparks,
      score: entry.averageScore
    }));
  }

  async getQuizHistoryForUser(userId: string): Promise<any[]> {
    try {
      // Get all quiz sessions for user's profiles
      const userProfiles = await this.getUserProfiles(userId);
      const profileIds = userProfiles.map(p => p.id);

      if (profileIds.length === 0) {
        return [];
      }

      // Use simpler approach to get quiz sessions for each profile separately
      const sessions = [];
      
      for (const profileId of profileIds) {
        const profileSessions = await db
          .select({
            id: quizSessions.id,
            profileId: quizSessions.profileId,
            subjectId: quizSessions.subjectId,
            quizType: quizSessions.quizType,
            totalQuestions: quizSessions.totalQuestions,
            correctAnswers: quizSessions.correctAnswers,
            completed: quizSessions.completed,
            completedAt: quizSessions.completedAt,
            startedAt: quizSessions.startedAt,
            timeSpent: quizSessions.timeSpent,
            sparksEarned: quizSessions.sparksEarned,
            subjectName: subjects.name,
            subjectCode: subjects.code,
          })
          .from(quizSessions)
          .leftJoin(subjects, eq(quizSessions.subjectId, subjects.id))
          .where(
            and(
              eq(quizSessions.profileId, profileId),
              eq(quizSessions.completed, true)
            )
          )
          .orderBy(desc(quizSessions.completedAt))
          .limit(20);
        
        sessions.push(...profileSessions);
      }
      
      // Sort all sessions by completion date and limit to 50
      sessions.sort((a, b) => {
        const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return dateB - dateA;
      });
      
      const limitedSessions = sessions.slice(0, 50);
      
      // Get additional profile info for each session
      const sessionsWithProfileInfo = await Promise.all(
        limitedSessions.map(async (session) => {
          const [profile] = await db
            .select({
              examinationSystemId: profiles.examinationSystemId,
              levelId: profiles.levelId,
            })
            .from(profiles)
            .where(eq(profiles.id, session.profileId));

          let examinationSystemCode = 'Unknown';
          let levelTitle = 'Unknown';

          if (profile?.examinationSystemId) {
            const [examSystem] = await db
              .select({ code: examinationSystems.code })
              .from(examinationSystems)
              .where(eq(examinationSystems.id, profile.examinationSystemId));
            examinationSystemCode = examSystem?.code || 'Unknown';
          }

          if (profile?.levelId) {
            const [level] = await db
              .select({ title: levels.title })
              .from(levels)
              .where(eq(levels.id, profile.levelId));
            levelTitle = level?.title || 'Unknown';
          }

          return {
            ...session,
            examinationSystemCode,
            levelTitle,
          };
        })
      );

      return sessionsWithProfileInfo.map((session: any) => ({
        id: session.id,
        subjectName: session.subjectName || 'Unknown Subject',
        subjectCode: session.subjectCode || 'UNK',
        quizType: session.quizType,
        totalQuestions: session.totalQuestions || 0,
        correctAnswers: session.correctAnswers || 0,
        completedAt: session.completedAt || session.startedAt,
        timeTaken: session.timeSpent || 0,
        sparksEarned: session.sparksEarned || 0,
        isCompleted: session.completed || false,
        examinationSystem: session.examinationSystemCode || 'Unknown',
        level: session.levelTitle || 'Unknown',
      }));
    } catch (error) {
      console.error('Error fetching quiz history:', error);
      return [];
    }
  }

  async getTodayLeaderboard(): Promise<any[]> {
    try {
      // Get quiz sessions completed today using raw SQL for better compatibility
      const todayQuery = sql`
        SELECT 
          qs.user_id,
          qs.profile_id,
          qs.sparks_earned,
          qs.correct_answers,
          qs.total_questions,
          u.first_name,
          u.last_name,
          u.profile_image_url,
          p.streak
        FROM quiz_sessions qs
        INNER JOIN profiles p ON qs.profile_id = p.id
        INNER JOIN users u ON p.user_id = u.id
        WHERE qs.completed = true
          AND DATE(qs.completed_at) = CURRENT_DATE
        ORDER BY qs.completed_at DESC
      `;

      const todaySessions = await db.execute(todayQuery);

      // Group by user and calculate today's totals
      const userStats = new Map();
      for (const session of todaySessions.rows) {
        const userId = session.user_id;
        if (!userStats.has(userId)) {
          userStats.set(userId, {
            userId,
            firstName: session.first_name || 'Student',
            lastName: session.last_name || '',
            profileImageUrl: session.profile_image_url,
            todaySparks: 0,
            todayQuizzes: 0,
            todayCorrect: 0,
            todayTotal: 0,
            streak: session.streak || 0,
          });
        }
        
        const stats = userStats.get(userId);
        stats.todaySparks += parseInt(session.sparks_earned) || 0;
        stats.todayQuizzes += 1;
        stats.todayCorrect += parseInt(session.correct_answers) || 0;
        stats.todayTotal += parseInt(session.total_questions) || 0;
      }

      // Convert to array and calculate average scores
      const leaderboard = Array.from(userStats.values())
        .map(user => ({
          ...user,
          averageScore: user.todayTotal > 0 
            ? Math.round((user.todayCorrect / user.todayTotal) * 100)
            : 0,
          sparks: user.todaySparks, // For compatibility with frontend
          quizzesCompleted: user.todayQuizzes,
          lastActive: new Date().toISOString(),
        }))
        .sort((a, b) => b.todaySparks - a.todaySparks) // Sort by today's sparks
        .map((user, index) => ({
          ...user,
          rank: index + 1,
        }));

      return leaderboard;
    } catch (error) {
      console.error('Error fetching today leaderboard:', error);
      return [];
    }
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  }

  // Get quizzes by subject
  async getQuizzesBySubject(subjectId: string): Promise<any[]> {
    try {
      const subjectQuizzes = await db
        .select({
          id: quizzes.id,
          title: quizzes.title,
          subjectId: quizzes.subjectId,
          totalQuestions: quizzes.totalQuestions,
          timeLimit: quizzes.timeLimit,
          createdAt: quizzes.createdAt,
          isActive: quizzes.isActive
        })
        .from(quizzes)
        .where(and(eq(quizzes.subjectId, subjectId), eq(quizzes.isActive, true)))
        .orderBy(desc(quizzes.createdAt));
      
      return subjectQuizzes;
    } catch (error) {
      console.error("Error fetching quizzes by subject:", error);
      return [];
    }
  }

  // Get quiz with questions and choices
  async getQuizWithQuestions(quizId: string): Promise<any> {
    try {
      // Get quiz details with JSONB questions
      const [quiz] = await db
        .select()
        .from(quizzes)
        .where(eq(quizzes.id, quizId));

      if (!quiz) {
        throw new Error("Quiz not found");
      }

      // The questions are stored as JSONB in the questions column
      const questions = quiz.questions || [];
      
      return {
        ...quiz,
        questions
      };
    } catch (error) {
      console.error("Error fetching quiz with questions:", error);
      throw new Error("Failed to fetch quiz details");
    }
  }

  // Update quiz
  async updateQuiz(quizId: string, updateData: any): Promise<any> {
    try {
      // Update the quiz in the database
      const [updatedQuiz] = await db
        .update(quizzes)
        .set({
          title: updateData.title,
          description: updateData.description,
          timeLimit: updateData.timeLimit,
          totalQuestions: updateData.totalQuestions,
          updatedAt: new Date()
        })
        .where(eq(quizzes.id, quizId))
        .returning();
      
      return updatedQuiz;
    } catch (error) {
      console.error("Error updating quiz:", error);
      throw new Error("Failed to update quiz");
    }
  }

  // Gamification operations
  async getBadgeTypes(): Promise<BadgeType[]> {
    return await db.select().from(badgeTypes).orderBy(badgeTypes.title);
  }

  async getBadges(): Promise<Badge[]> {
    return await db.select().from(badges).orderBy(badges.title);
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return await db.select().from(userBadges).where(eq(userBadges.userId, userId));
  }

  async awardBadge(userId: string, badgeId: string, streaks = 0): Promise<UserBadge> {
    const [userBadge] = await db
      .insert(userBadges)
      .values({ userId, badgeId, count: 1, streaks })
      .onConflictDoUpdate({
        target: [userBadges.userId, userBadges.badgeId],
        set: { 
          count: sql`${userBadges.count} + 1`,
          streaks, 
          lastEarnedAt: new Date(),
          updatedAt: new Date() 
        },
      })
      .returning();
    return userBadge;
  }

  async getUserTrophies(userId: string): Promise<UserTrophy[]> {
    return await db.select().from(userTrophies).where(eq(userTrophies.userId, userId));
  }

  async awardTrophy(userId: string, trophyId: string): Promise<UserTrophy> {
    const [userTrophy] = await db
      .insert(userTrophies)
      .values({ userId, trophyId, count: 1 })
      .onConflictDoUpdate({
        target: [userTrophies.userId, userTrophies.trophyId],
        set: { 
          count: sql`${userTrophies.count} + 1`,
          lastEarnedAt: new Date(),
          updatedAt: new Date() 
        },
      })
      .returning();
    return userTrophy;
  }

  async getTrophies(): Promise<Trophy[]> {
    return await db.select().from(trophies).orderBy(trophies.title);
  }

  async getChallenges(): Promise<Challenge[]> {
    return await db.select().from(challenges).where(eq(challenges.isActive, true));
  }

  async getUserChallenges(userId: string): Promise<UserChallenge[]> {
    return await db.select().from(userChallenges).where(eq(userChallenges.userId, userId));
  }

  async updateChallengeProgress(userId: string, challengeId: string, progress: number): Promise<UserChallenge> {
    const [userChallenge] = await db
      .insert(userChallenges)
      .values({ userId, challengeId, progress })
      .onConflictDoUpdate({
        target: [userChallenges.userId, userChallenges.challengeId],
        set: { progress, updatedAt: new Date() },
      })
      .returning();
    return userChallenge;
  }

  async completeChallenge(userId: string, challengeId: string): Promise<UserChallenge> {
    const [userChallenge] = await db
      .update(userChallenges)
      .set({ completed: true, updatedAt: new Date() })
      .where(and(eq(userChallenges.userId, userId), eq(userChallenges.challengeId, challengeId)))
      .returning();
    return userChallenge;
  }

  async getUserSparkBoosts(userId: string): Promise<UserSparkBoost[]> {
    return await db.select().from(userSparkBoost).where(eq(userSparkBoost.toUserId, userId));
  }

  async createSparkBoost(fromUserId: string, toUserId: string, sparks: number): Promise<UserSparkBoost> {
    const [sparkBoost] = await db
      .insert(userSparkBoost)
      .values({ fromUserId, toUserId, sparks })
      .returning();
    return sparkBoost;
  }

  async canBoostUser(fromUserId: string): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayBoosts = await db
      .select()
      .from(userSparkBoost)
      .where(and(
        eq(userSparkBoost.fromUserId, fromUserId),
        gte(userSparkBoost.createdAt, today)
      ));
    
    return todayBoosts.length === 0; // User can only boost once per day
  }

  // Topic management operations
  async getAdminTopicList(filters?: any): Promise<any[]> {
    try {
      // First get all topics
      const topicList = await db
        .select()
        .from(topics)
        .orderBy(desc(topics.createdAt));

      // Get related data separately to avoid join issues
      const topicsWithDetails = await Promise.all(
        topicList.map(async (topic) => {
          let subjectName = 'Unknown';
          let levelTitle = 'Unknown';
          let examinationSystemName = 'Unknown';
          let termTitle = null;

          try {
            if (topic.subjectId) {
              const [subject] = await db.select({ name: subjects.name }).from(subjects).where(eq(subjects.id, topic.subjectId));
              subjectName = subject?.name || 'Unknown';
            }

            if (topic.levelId) {
              const [level] = await db.select({ title: levels.title }).from(levels).where(eq(levels.id, topic.levelId));
              levelTitle = level?.title || 'Unknown';
            }

            if (topic.examinationSystemId) {
              const [examSystem] = await db.select({ name: examinationSystems.name }).from(examinationSystems).where(eq(examinationSystems.id, topic.examinationSystemId));
              examinationSystemName = examSystem?.name || 'Unknown';
            }

            if (topic.termId) {
              const [term] = await db.select({ title: terms.title }).from(terms).where(eq(terms.id, topic.termId));
              termTitle = term?.title || null;
            }
          } catch (err) {
            console.error('Error fetching related data for topic:', err);
          }

          // Calculate metrics for this topic
          let quizCount = 0, quizAttempts = 0, usersCount = 0;
          try {
            const quizCountResult = await db
              .select({ count: sql`count(*)` })
              .from(quizSessions)
              .where(eq(quizSessions.topicId, topic.id));
            quizCount = Number(quizCountResult[0]?.count || 0);
            
            const attemptCountResult = await db
              .select({ count: sql`count(*)` })
              .from(quizSessions)
              .where(and(
                eq(quizSessions.topicId, topic.id),
                eq(quizSessions.completed, true)
              ));
            quizAttempts = Number(attemptCountResult[0]?.count || 0);
            
            const userCountResult = await db
              .select({ count: sql`count(distinct ${quizSessions.profileId})` })
              .from(quizSessions)
              .where(eq(quizSessions.topicId, topic.id));
            usersCount = Number(userCountResult[0]?.count || 0);
          } catch (err) {
            console.error('Error calculating topic metrics:', err);
          }

          return {
            id: topic.id,
            title: topic.title,
            description: topic.description,
            content: topic.summaryContent,
            subjectId: topic.subjectId,
            levelId: topic.levelId,
            examinationSystemId: topic.examinationSystemId,
            termId: topic.termId,
            subject: subjectName,
            level: levelTitle,
            examination_system: examinationSystemName,
            term: termTitle,
            createdAt: topic.createdAt,
            quizCount,
            quizAttempts,
            usersCount
          };
        })
      );

      return topicsWithDetails;
    } catch (error) {
      console.error('Error fetching admin topic list:', error);
      return [];
    }
  }

  async createQuiz(quizData: any): Promise<any> {
    try {
      const [newQuiz] = await db.insert(quizzes).values({
        title: quizData.title,
        description: quizData.description,
        examinationSystemId: quizData.examinationSystemId,
        levelId: quizData.levelId,
        subjectId: quizData.subjectId,
        quizType: quizData.quizType,
        topicId: quizData.topicId || null,
        termId: quizData.termId || null,
        questions: quizData.questions,
        totalQuestions: quizData.questions.length,
        timeLimit: quizData.timeLimit,
        difficulty: quizData.difficulty || 'medium',
        isActive: true,
        createdBy: quizData.createdBy
      }).returning();

      return newQuiz;
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  }

  // Examination Systems CRUD
  async createExaminationSystem(data: any): Promise<any> {
    try {
      const [newSystem] = await db.insert(examinationSystems).values({
        name: data.name,
        description: data.description
      }).returning();
      return newSystem;
    } catch (error) {
      console.error('Error creating examination system:', error);
      throw error;
    }
  }

  async updateExaminationSystem(id: string, data: any): Promise<any> {
    try {
      const [updatedSystem] = await db.update(examinationSystems)
        .set({
          name: data.name,
          description: data.description
        })
        .where(eq(examinationSystems.id, id))
        .returning();
      return updatedSystem;
    } catch (error) {
      console.error('Error updating examination system:', error);
      throw error;
    }
  }

  async deleteExaminationSystem(id: string): Promise<void> {
    try {
      await db.delete(examinationSystems).where(eq(examinationSystems.id, id));
    } catch (error) {
      console.error('Error deleting examination system:', error);
      throw error;
    }
  }

  // Levels CRUD
  async createLevel(data: any): Promise<any> {
    try {
      const [newLevel] = await db.insert(levels).values({
        examinationSystemId: data.examinationSystemId,
        title: data.title,
        description: data.description
      }).returning();
      return newLevel;
    } catch (error) {
      console.error('Error creating level:', error);
      throw error;
    }
  }

  async updateLevel(id: string, data: any): Promise<any> {
    try {
      const [updatedLevel] = await db.update(levels)
        .set({
          examinationSystemId: data.examinationSystemId,
          title: data.title,
          description: data.description
        })
        .where(eq(levels.id, id))
        .returning();
      return updatedLevel;
    } catch (error) {
      console.error('Error updating level:', error);
      throw error;
    }
  }

  async deleteLevel(id: string): Promise<void> {
    try {
      await db.delete(levels).where(eq(levels.id, id));
    } catch (error) {
      console.error('Error deleting level:', error);
      throw error;
    }
  }

  // Subjects CRUD
  async createSubject(data: any): Promise<any> {
    try {
      const [newSubject] = await db.insert(subjects).values({
        examinationSystemId: data.examinationSystemId,
        name: data.name,
        description: data.description
      }).returning();
      return newSubject;
    } catch (error) {
      console.error('Error creating subject:', error);
      throw error;
    }
  }

  async updateSubject(id: string, data: any): Promise<any> {
    try {
      const [updatedSubject] = await db.update(subjects)
        .set({
          examinationSystemId: data.examinationSystemId,
          name: data.name,
          description: data.description
        })
        .where(eq(subjects.id, id))
        .returning();
      return updatedSubject;
    } catch (error) {
      console.error('Error updating subject:', error);
      throw error;
    }
  }

  async deleteSubject(id: string): Promise<void> {
    try {
      await db.delete(subjects).where(eq(subjects.id, id));
    } catch (error) {
      console.error('Error deleting subject:', error);
      throw error;
    }
  }

  // Terms CRUD
  async createTerm(data: any): Promise<any> {
    try {
      const [newTerm] = await db.insert(terms).values({
        examinationSystemId: data.examinationSystemId,
        title: data.title,
        description: data.description
      }).returning();
      return newTerm;
    } catch (error) {
      console.error('Error creating term:', error);
      throw error;
    }
  }

  async updateTerm(id: string, data: any): Promise<any> {
    try {
      const [updatedTerm] = await db.update(terms)
        .set({
          examinationSystemId: data.examinationSystemId,
          title: data.title,
          description: data.description
        })
        .where(eq(terms.id, id))
        .returning();
      return updatedTerm;
    } catch (error) {
      console.error('Error updating term:', error);
      throw error;
    }
  }

  async deleteTerm(id: string): Promise<void> {
    try {
      await db.delete(terms).where(eq(terms.id, id));
    } catch (error) {
      console.error('Error deleting term:', error);
      throw error;
    }
  }

  // Admin user operations
  async getAdminUserList(filters?: any): Promise<any[]> {
    try {
      // First get all users with their primary profile (or any profile if default_profile_id is null)
      const query = db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          createdAt: users.createdAt,
          isPremium: users.isPremium,
          defaultProfileId: users.defaultProfileId,
          // Profile information (prefer default profile, fallback to any profile)
          profileId: profiles.id,
          examinationSystemId: profiles.examinationSystemId,
          levelId: profiles.levelId,
          sparks: profiles.sparks,
          streak: profiles.streak,
          currentStreak: profiles.currentStreak,
          lastActivity: profiles.lastActivity,
          isActive: profiles.isActive,
          // Examination system and level names
          examSystemName: examinationSystems.name,
          levelTitle: levels.title,
        })
        .from(users)
        .leftJoin(profiles, or(
          eq(users.defaultProfileId, profiles.id),
          and(
            isNull(users.defaultProfileId),
            eq(profiles.userId, users.id)
          )
        ))
        .leftJoin(examinationSystems, eq(profiles.examinationSystemId, examinationSystems.id))
        .leftJoin(levels, eq(profiles.levelId, levels.id))
        .orderBy(desc(users.createdAt));

      const result = await query;
      
      // Get quiz session stats for each user
      const userStats = await Promise.all(
        result.map(async (user) => {
          try {
            if (!user.profileId) return { quizzesCompleted: 0, averageScore: 0 };
            
            const sessionsResult = await db
              .select({
                count: sql`count(*)`,
                avgScore: sql`avg(case when total_questions > 0 then (correct_answers::float / total_questions * 100) else 0 end)`
              })
              .from(quizSessions)
              .where(and(
                eq(quizSessions.profileId, user.profileId),
                eq(quizSessions.completed, true)
              ));
              
            return {
              quizzesCompleted: Number(sessionsResult[0]?.count || 0),
              averageScore: Math.round(Number(sessionsResult[0]?.avgScore || 0))
            };
          } catch (error) {
            console.error('Error getting user stats:', error);
            return { quizzesCompleted: 0, averageScore: 0 };
          }
        })
      );
      
      // Transform the data to match the expected format
      return result.map((user, index) => {
        const userStat = userStats[index];
        
        const status = user.isActive 
          ? (user.lastActivity && new Date(user.lastActivity) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? 'active' : 'inactive')
          : 'suspended';
          
        const lastActive = user.lastActivity 
          ? this.formatTimeAgo(new Date(user.lastActivity))
          : 'Never';

        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Unknown User';

        return {
          id: user.id,
          name: fullName,
          email: user.email || 'No email',
          avatar: user.profileImageUrl || '',
          status,
          examSystem: user.examSystemName || 'Not Set',
          level: user.levelTitle || 'Not Set',
          sparks: user.sparks || 0,
          streak: user.currentStreak || 0,
          quizzesCompleted: userStat.quizzesCompleted,
          averageScore: userStat.averageScore,
          joinedAt: user.createdAt,
          lastActive,
          profileId: user.profileId,
          isPremium: user.isPremium
        };
      });
    } catch (error) {
      console.error('Error fetching admin user list:', error);
      return [];
    }
  }

  async getAdminUserStats(): Promise<any> {
    try {
      // Get total users count
      const totalUsersResult = await db.select({ count: sql`count(*)` }).from(users);
      const totalUsers = Number(totalUsersResult[0]?.count || 0);

      // Get active users this week (users with profile activity in last 7 days)
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const activeUsersResult = await db
        .select({ count: sql`count(distinct ${profiles.userId})` })
        .from(profiles)
        .where(and(
          sql`${profiles.lastActivity} > ${oneWeekAgo}`,
          eq(profiles.isActive, true)
        ));
      const activeUsers = Number(activeUsersResult[0]?.count || 0);

      // Get new signups this month
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const newSignupsResult = await db
        .select({ count: sql`count(*)` })
        .from(users)
        .where(sql`${users.createdAt} > ${oneMonthAgo}`);
      const newSignups = Number(newSignupsResult[0]?.count || 0);

      // Get average sparks (from profiles)
      const avgSparksResult = await db
        .select({ avg: sql`avg(${profiles.sparks})` })
        .from(profiles)
        .where(eq(profiles.isActive, true));
      const averageSparks = Math.round(Number(avgSparksResult[0]?.avg || 0));

      return {
        totalUsers,
        activeUsers,
        newSignups,
        averageSparks,
        engagementRate: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100 * 10) / 10 : 0
      };
    } catch (error) {
      console.error('Error fetching admin user stats:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        newSignups: 0,
        averageSparks: 0,
        engagementRate: 0
      };
    }
  }

  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  async createTopic(topicData: InsertTopic): Promise<Topic> {
    const [topic] = await db
      .insert(topics)
      .values(topicData)
      .returning();
    return topic;
  }

  async updateTopic(topicId: string, updateData: Partial<InsertTopic>): Promise<Topic> {
    const [topic] = await db
      .update(topics)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(topics.id, topicId))
      .returning();
    return topic;
  }

  async deleteTopic(topicId: string): Promise<void> {
    await db
      .delete(topics)
      .where(eq(topics.id, topicId));
  }

  // Quiz types management implementation
  async getQuizTypes(): Promise<any[]> {
    try {
      const quizTypesData = await db.select().from(quizTypes).orderBy(quizTypes.title);
      return quizTypesData;
    } catch (error) {
      console.error('Error fetching quiz types:', error);
      return [];
    }
  }

  async createQuizType(data: any): Promise<any> {
    const [quizType] = await db
      .insert(quizTypes)
      .values({
        title: data.title,
        description: data.description,
        code: data.code,
      })
      .returning();
    return quizType;
  }

  async updateQuizType(id: string, data: any): Promise<any> {
    const [quizType] = await db
      .update(quizTypes)
      .set({
        title: data.title,
        description: data.description,
        code: data.code,
        updatedAt: new Date(),
      })
      .where(eq(quizTypes.id, id))
      .returning();
    return quizType;
  }

  async deleteQuizType(id: string): Promise<void> {
    await db
      .delete(quizTypes)
      .where(eq(quizTypes.id, id));
  }

  // Get quiz details with questions for preview
  async getQuizDetails(quizId: string): Promise<any> {
    try {
      // Get quiz basic info
      const [quiz] = await db
        .select({
          id: quizzes.id,
          title: quizzes.title,
          description: quizzes.description,
          totalQuestions: quizzes.totalQuestions,
          timeLimit: quizzes.timeLimit,
          difficulty: quizzes.difficulty,
          quizType: quizzes.quizType,
          subject: subjects.name,
          level: levels.title,
          examSystem: examinationSystems.name,
          term: terms.name,
          createdAt: quizzes.createdAt,
          questions: quizzes.questions,
        })
        .from(quizzes)
        .leftJoin(subjects, eq(quizzes.subjectId, subjects.id))
        .leftJoin(levels, eq(quizzes.levelId, levels.id))
        .leftJoin(examinationSystems, eq(quizzes.examinationSystemId, examinationSystems.id))
        .leftJoin(terms, eq(quizzes.termId, terms.id))
        .where(eq(quizzes.id, quizId));

      if (!quiz) {
        return null;
      }

      // Get questions for this quiz - parse from JSON field if available
      let questionsData = [];
      if (quiz.questions && Array.isArray(quiz.questions)) {
        questionsData = quiz.questions;
      } else {
        // If no questions stored, create sample questions based on quiz info
        questionsData = this.generateSampleQuestions(quiz);
      }

      return {
        ...quiz,
        questions: questionsData
      };
    } catch (error) {
      console.error('Error fetching quiz details:', error);
      throw error;
    }
  }

  private generateSampleQuestions(quiz: any): any[] {
    const subjectQuestions = {
      Mathematics: [
        {
          id: "math_1",
          content: `What is the result of 2 + 3 × 4?`,
          type: "mcq",
          choices: [
            { id: "c_1", content: "14", isCorrect: true },
            { id: "c_2", content: "20", isCorrect: false },
            { id: "c_3", content: "24", isCorrect: false },
            { id: "c_4", content: "10", isCorrect: false }
          ],
          explanation: "Following order of operations (BODMAS), multiplication comes before addition: 2 + (3 × 4) = 2 + 12 = 14"
        },
        {
          id: "math_2",
          content: `If x + 5 = 12, what is the value of x?`,
          type: "mcq",
          choices: [
            { id: "c_1", content: "7", isCorrect: true },
            { id: "c_2", content: "17", isCorrect: false },
            { id: "c_3", content: "5", isCorrect: false },
            { id: "c_4", content: "12", isCorrect: false }
          ],
          explanation: "To solve x + 5 = 12, subtract 5 from both sides: x = 12 - 5 = 7"
        }
      ],
      Biology: [
        {
          id: "bio_1",
          content: "What is the basic unit of life?",
          type: "mcq",
          choices: [
            { id: "c_1", content: "Cell", isCorrect: true },
            { id: "c_2", content: "Tissue", isCorrect: false },
            { id: "c_3", content: "Organ", isCorrect: false },
            { id: "c_4", content: "Organism", isCorrect: false }
          ],
          explanation: "The cell is the smallest structural and functional unit of life."
        }
      ],
      Physics: [
        {
          id: "phy_1",
          content: "What is the SI unit of force?",
          type: "mcq",
          choices: [
            { id: "c_1", content: "Newton", isCorrect: true },
            { id: "c_2", content: "Joule", isCorrect: false },
            { id: "c_3", content: "Watt", isCorrect: false },
            { id: "c_4", content: "Pascal", isCorrect: false }
          ],
          explanation: "The Newton (N) is the SI unit of force, named after Sir Isaac Newton."
        }
      ]
    };

    // Return subject-specific questions or generic ones
    const questions = subjectQuestions[quiz.subject as keyof typeof subjectQuestions] || [
      {
        id: "gen_1",
        content: `Sample question for ${quiz.subject || 'this subject'} - ${quiz.title}`,
        type: "mcq",
        choices: [
          { id: "c_1", content: "Option A", isCorrect: true },
          { id: "c_2", content: "Option B", isCorrect: false },
          { id: "c_3", content: "Option C", isCorrect: false },
          { id: "c_4", content: "Option D", isCorrect: false }
        ],
        explanation: "This is a sample question for preview purposes."
      }
    ];

    return questions.slice(0, Math.min(quiz.totalQuestions || 5, questions.length));
  }

  // Platform Settings operations
  async getGeneralSettings(): Promise<GeneralSettings> {
    const [settings] = await db.select().from(generalSettings).limit(1);
    if (!settings) {
      // If no settings exist, create default ones
      const [newSettings] = await db
        .insert(generalSettings)
        .values({})
        .returning();
      return newSettings;
    }
    return settings;
  }

  async updateGeneralSettings(settingsData: Partial<InsertGeneralSettings>, updatedBy: string): Promise<GeneralSettings> {
    const [settings] = await db.select().from(generalSettings).limit(1);
    
    if (!settings) {
      // Create new settings if none exist
      const [newSettings] = await db
        .insert(generalSettings)
        .values({
          ...settingsData,
          updatedBy,
          updatedAt: new Date(),
        })
        .returning();
      return newSettings;
    } else {
      // Update existing settings
      const [updatedSettings] = await db
        .update(generalSettings)
        .set({
          ...settingsData,
          updatedBy,
          updatedAt: new Date(),
        })
        .where(eq(generalSettings.id, settings.id))
        .returning();
      return updatedSettings;
    }
  }

  async getQuizSettings(): Promise<QuizSettings> {
    const [settings] = await db.select().from(quizSettings).limit(1);
    if (!settings) {
      // If no settings exist, create default ones
      const [newSettings] = await db
        .insert(quizSettings)
        .values({})
        .returning();
      return newSettings;
    }
    return settings;
  }

  async updateQuizSettings(settingsData: Partial<InsertQuizSettings>, updatedBy: string): Promise<QuizSettings> {
    const [settings] = await db.select().from(quizSettings).limit(1);
    
    if (!settings) {
      // Create new settings if none exist
      const [newSettings] = await db
        .insert(quizSettings)
        .values({
          ...settingsData,
          updatedBy,
          updatedAt: new Date(),
        })
        .returning();
      return newSettings;
    } else {
      // Update existing settings
      const [updatedSettings] = await db
        .update(quizSettings)
        .set({
          ...settingsData,
          updatedBy,
          updatedAt: new Date(),
        })
        .where(eq(quizSettings.id, settings.id))
        .returning();
      return updatedSettings;
    }
  }

  async getNotificationSettings(): Promise<NotificationSettings> {
    const [settings] = await db.select().from(notificationSettings).limit(1);
    if (!settings) {
      // If no settings exist, create default ones
      const [newSettings] = await db
        .insert(notificationSettings)
        .values({})
        .returning();
      return newSettings;
    }
    return settings;
  }

  async updateNotificationSettings(settingsData: Partial<InsertNotificationSettings>, updatedBy: string): Promise<NotificationSettings> {
    const [settings] = await db.select().from(notificationSettings).limit(1);
    
    if (!settings) {
      // Create new settings if none exist
      const [newSettings] = await db
        .insert(notificationSettings)
        .values({
          ...settingsData,
          updatedBy,
          updatedAt: new Date(),
        })
        .returning();
      return newSettings;
    } else {
      // Update existing settings
      const [updatedSettings] = await db
        .update(notificationSettings)
        .set({
          ...settingsData,
          updatedBy,
          updatedAt: new Date(),
        })
        .where(eq(notificationSettings.id, settings.id))
        .returning();
      return updatedSettings;
    }
  }

  // Subscription Management Methods
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))
      .orderBy(subscriptionPlans.sortOrder);
  }

  async getUserSubscription(userId: string): Promise<any> {
    const subscription = await db
      .select({
        id: userSubscriptions.id,
        planId: userSubscriptions.planId,
        status: userSubscriptions.status,
        startDate: userSubscriptions.startDate,
        endDate: userSubscriptions.endDate,
        autoRenew: userSubscriptions.autoRenew,
        paymentMethod: userSubscriptions.paymentMethod,
        planName: subscriptionPlans.name,
        planCode: subscriptionPlans.code,
        planPrice: subscriptionPlans.price,
        planFeatures: subscriptionPlans.features,
        dailyQuizLimit: subscriptionPlans.dailyQuizLimit,
        questionBankSize: subscriptionPlans.questionBankSize,
        hasAIPersonalization: subscriptionPlans.hasAIPersonalization,
        supportLevel: subscriptionPlans.supportLevel,
      })
      .from(userSubscriptions)
      .leftJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
      .where(
        and(
          eq(userSubscriptions.userId, userId),
          eq(userSubscriptions.status, 'active')
        )
      )
      .orderBy(desc(userSubscriptions.createdAt))
      .limit(1);

    return subscription[0] || null;
  }

  async createSubscription(subscription: InsertUserSubscription): Promise<UserSubscription> {
    const result = await db.insert(userSubscriptions).values(subscription).returning();
    return result[0];
  }

  async updateSubscription(subscriptionId: string, data: Partial<UserSubscription>): Promise<UserSubscription> {
    const result = await db
      .update(userSubscriptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userSubscriptions.id, subscriptionId))
      .returning();
    return result[0];
  }

  async getUserCredits(userId: string): Promise<number> {
    const user = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    return parseFloat(user[0]?.credits || '0');
  }

  async addCredits(userId: string, amount: number, description: string, paymentTransactionId?: string): Promise<CreditTransaction> {
    const currentBalance = await this.getUserCredits(userId);
    const newBalance = currentBalance + amount;

    // Update user credits
    await db
      .update(users)
      .set({ credits: newBalance.toFixed(2), updatedAt: new Date() })
      .where(eq(users.id, userId));

    // Record credit transaction
    const creditTransaction = await db
      .insert(creditTransactions)
      .values({
        userId,
        type: 'topup',
        amount: amount.toFixed(2),
        description,
        paymentTransactionId,
        balanceBefore: currentBalance.toFixed(2),
        balanceAfter: newBalance.toFixed(2),
      })
      .returning();

    return creditTransaction[0];
  }

  async deductCredits(userId: string, amount: number, description: string): Promise<CreditTransaction> {
    const currentBalance = await this.getUserCredits(userId);
    
    if (currentBalance < amount) {
      throw new Error('Insufficient credits');
    }

    const newBalance = currentBalance - amount;

    // Update user credits
    await db
      .update(users)
      .set({ credits: newBalance.toFixed(2), updatedAt: new Date() })
      .where(eq(users.id, userId));

    // Record credit transaction
    const creditTransaction = await db
      .insert(creditTransactions)
      .values({
        userId,
        type: 'deduction',
        amount: amount.toFixed(2),
        description,
        balanceBefore: currentBalance.toFixed(2),
        balanceAfter: newBalance.toFixed(2),
      })
      .returning();

    return creditTransaction[0];
  }

  async createPaymentTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction> {
    // Remove subscriptionId if it exists and add planId handling
    const { subscriptionId, ...transactionData } = transaction as any;
    const result = await db.insert(paymentTransactions).values(transactionData).returning();
    return result[0];
  }

  async updatePaymentTransaction(transactionId: string, data: Partial<PaymentTransaction>): Promise<PaymentTransaction> {
    const result = await db
      .update(paymentTransactions)
      .set(data)
      .where(eq(paymentTransactions.id, transactionId))
      .returning();
    return result[0];
  }

  async getPaymentHistory(userId: string): Promise<PaymentTransaction[]> {
    return await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.userId, userId))
      .orderBy(desc(paymentTransactions.createdAt));
  }

  async getCreditTransactions(userId: string): Promise<CreditTransaction[]> {
    return await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .orderBy(desc(creditTransactions.createdAt));
  }
}

export const storage = new DatabaseStorage();

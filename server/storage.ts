import {
  users,
  subjects,
  topics,
  questions,
  quizSessions,
  userAnswers,
  dailyChallenges,
  userChallengeProgress,
  type User,
  type UpsertUser,
  type Subject,
  type Topic,
  type Question,
  type QuizSession,
  type UserAnswer,
  type DailyChallenge,
  type UserChallengeProgress,
  type InsertSubject,
  type InsertTopic,
  type InsertQuestion,
  type InsertQuizSession,
  type InsertUserAnswer,
  type InsertDailyChallenge,
  type InsertUserChallengeProgress,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, count, avg, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserOnboarding(userId: string, examType: string, form: string, school?: string): Promise<User>;
  
  // Subject operations
  getSubjects(examType: string): Promise<Subject[]>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  
  // Topic operations
  getTopicsBySubject(subjectId: string, form?: string, term?: string): Promise<Topic[]>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  
  // Question operations
  getQuestionsByTopic(topicId: string, limit?: number): Promise<Question[]>;
  getRandomQuestions(subjectId: string, form: string, limit?: number): Promise<Question[]>;
  getTermQuestions(subjectId: string, form: string, term: string, limit?: number): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  
  // Quiz session operations
  createQuizSession(session: InsertQuizSession): Promise<QuizSession>;
  updateQuizSession(sessionId: string, data: Partial<QuizSession>): Promise<QuizSession>;
  getQuizSession(sessionId: string): Promise<QuizSession | undefined>;
  getUserQuizSessions(userId: string, limit?: number): Promise<QuizSession[]>;
  
  // User answer operations
  createUserAnswer(answer: InsertUserAnswer): Promise<UserAnswer>;
  getQuizAnswers(quizSessionId: string): Promise<UserAnswer[]>;
  
  // Challenge operations
  getTodaysChallenge(): Promise<DailyChallenge | undefined>;
  createDailyChallenge(challenge: InsertDailyChallenge): Promise<DailyChallenge>;
  getUserChallengeProgress(userId: string, challengeId: string): Promise<UserChallengeProgress | undefined>;
  updateChallengeProgress(userId: string, challengeId: string, progress: Partial<InsertUserChallengeProgress>): Promise<UserChallengeProgress>;
  
  // Analytics operations
  getUserStats(userId: string): Promise<any>;
  getSubjectPerformance(userId: string, subjectId: string): Promise<any>;
  updateUserSparks(userId: string, sparks: number): Promise<User>;
  updateUserStreak(userId: string): Promise<User>;
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

  async updateUserOnboarding(userId: string, examType: string, form: string, school?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        examType,
        form,
        school,
        onboardingCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Subject operations
  async getSubjects(examType: string): Promise<Subject[]> {
    return await db.select().from(subjects).where(eq(subjects.examType, examType));
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    const [newSubject] = await db.insert(subjects).values(subject).returning();
    return newSubject;
  }

  // Topic operations
  async getTopicsBySubject(subjectId: string, form?: string, term?: string): Promise<Topic[]> {
    let query = db.select().from(topics).where(eq(topics.subjectId, subjectId));
    
    if (form) {
      query = query.where(and(eq(topics.subjectId, subjectId), eq(topics.form, form)));
    }
    
    if (term) {
      query = query.where(and(eq(topics.subjectId, subjectId), eq(topics.form, form!), eq(topics.term, term)));
    }
    
    return await query.orderBy(topics.order);
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

  async getRandomQuestions(subjectId: string, form: string, limit: number = 30): Promise<Question[]> {
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
    .where(and(eq(topics.subjectId, subjectId), eq(topics.form, form)))
    .orderBy(sql`RANDOM()`)
    .limit(limit);
  }

  async getTermQuestions(subjectId: string, form: string, term: string, limit: number = 30): Promise<Question[]> {
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
      eq(topics.form, form),
      eq(topics.term, term)
    ))
    .orderBy(sql`RANDOM()`)
    .limit(limit);
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [newQuestion] = await db.insert(questions).values(question).returning();
    return newQuestion;
  }

  // Quiz session operations
  async createQuizSession(session: InsertQuizSession): Promise<QuizSession> {
    const [newSession] = await db.insert(quizSessions).values(session).returning();
    return newSession;
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

  async getUserQuizSessions(userId: string, limit: number = 10): Promise<QuizSession[]> {
    return await db.select().from(quizSessions)
      .where(eq(quizSessions.userId, userId))
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

  async getUserChallengeProgress(userId: string, challengeId: string): Promise<UserChallengeProgress | undefined> {
    const [progress] = await db.select().from(userChallengeProgress)
      .where(and(
        eq(userChallengeProgress.userId, userId),
        eq(userChallengeProgress.challengeId, challengeId)
      ));
    return progress;
  }

  async updateChallengeProgress(userId: string, challengeId: string, progress: Partial<InsertUserChallengeProgress>): Promise<UserChallengeProgress> {
    const [updatedProgress] = await db
      .insert(userChallengeProgress)
      .values({
        userId,
        challengeId,
        ...progress,
      })
      .onConflictDoUpdate({
        target: [userChallengeProgress.userId, userChallengeProgress.challengeId],
        set: progress,
      })
      .returning();
    return updatedProgress;
  }

  // Analytics operations
  async getUserStats(userId: string): Promise<any> {
    const [totalQuizzes] = await db.select({ count: count() })
      .from(quizSessions)
      .where(and(eq(quizSessions.userId, userId), eq(quizSessions.completed, true)));

    const [avgScore] = await db.select({ 
      avg: avg(sql`CAST(${quizSessions.correctAnswers} AS DECIMAL) / ${quizSessions.totalQuestions} * 100`) 
    })
      .from(quizSessions)
      .where(and(eq(quizSessions.userId, userId), eq(quizSessions.completed, true)));

    const [totalSparks] = await db.select({ total: sql`SUM(${quizSessions.sparksEarned})` })
      .from(quizSessions)
      .where(eq(quizSessions.userId, userId));

    return {
      totalQuizzes: totalQuizzes.count || 0,
      averageScore: Math.round(avgScore.avg || 0),
      totalSparks: totalSparks.total || 0,
    };
  }

  async getSubjectPerformance(userId: string, subjectId: string): Promise<any> {
    const sessions = await db.select().from(quizSessions)
      .where(and(
        eq(quizSessions.userId, userId),
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

  async updateUserSparks(userId: string, sparks: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        sparks: sql`${users.sparks} + ${sparks}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserStreak(userId: string): Promise<User> {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');

    const lastActivity = user.lastActivity ? new Date(user.lastActivity) : null;
    let newStreak = 1;

    if (lastActivity) {
      const lastActivityDate = new Date(lastActivity.toISOString().split('T')[0]);
      const yesterdayDate = new Date(yesterday.toISOString().split('T')[0]);
      
      if (lastActivityDate.getTime() === yesterdayDate.getTime()) {
        newStreak = (user.streak || 0) + 1;
      }
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        streak: newStreak,
        lastActivity: today,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return updatedUser;
  }
}

export const storage = new DatabaseStorage();

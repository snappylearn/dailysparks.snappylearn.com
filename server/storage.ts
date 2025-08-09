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
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, desc, sql, count, avg, gte, lte } from "drizzle-orm";

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
  getSubjectsBySystem(examinationSystemId: string): Promise<Subject[]>;
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
    return await db.select().from(examinationSystems).where(eq(examinationSystems.isActive, true));
  }

  async createExaminationSystem(system: InsertExaminationSystem): Promise<ExaminationSystem> {
    const [newSystem] = await db.insert(examinationSystems).values(system).returning();
    return newSystem;
  }

  // Level operations
  async getAllLevels(): Promise<Level[]> {
    return await db.select().from(levels)
      .where(eq(levels.isActive, true))
      .orderBy(levels.order);
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
    return await db.select().from(terms).orderBy(terms.order);
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
    return await db.select().from(subjects)
      .orderBy(subjects.name);
  }

  async getSubjectsBySystem(examinationSystemId: string): Promise<Subject[]> {
    return await db.select().from(subjects).where(eq(subjects.examinationSystemId, examinationSystemId));
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

  async getAdminQuizList(filters: any): Promise<any[]> {
    // Fetch from the correct quizzes table (admin-created templates)
    const quizTemplates = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        subjectId: quizzes.subjectId,
        questionCount: quizzes.totalQuestions,
        timeLimit: quizzes.timeLimit,
        createdAt: quizzes.createdAt,
      })
      .from(quizzes)
      .orderBy(desc(quizzes.createdAt));

    // Get subject names, actual question counts, and session counts
    const quizList = await Promise.all(
      quizTemplates.map(async (quiz) => {
        // Get subject name
        const [subject] = await db
          .select({ name: subjects.name })
          .from(subjects)
          .where(eq(subjects.id, quiz.subjectId));

        // Count actual questions from quiz_questions table
        const [questionCount] = await db
          .select({ count: count() })
          .from(quizQuestions)
          .where(eq(quizQuestions.quizId, quiz.id));

        // Count sessions using this quiz template
        const [sessionCount] = await db
          .select({ count: count() })
          .from(quizSessions)
          .where(eq(quizSessions.subjectId, quiz.subjectId));

        return {
          id: quiz.id,
          title: quiz.title,
          subject: subject?.name || 'Unknown',
          type: 'topical', // Default for now
          questions: questionCount?.count || 0, // Use actual count from quiz_questions
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

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  }

  // Get quiz with questions and choices
  async getQuizWithQuestions(quizId: string): Promise<any> {
    try {
      // Get quiz details
      const [quiz] = await db
        .select()
        .from(quizzes)
        .where(eq(quizzes.id, quizId));

      if (!quiz) {
        throw new Error("Quiz not found");
      }

      // Use raw SQL query since column names don't match ORM exactly
      const result = await pool.query(`
        SELECT 
            qq.id,
            qq.content,
            qq.explanation,
            qq.order_index,
            qc.id as choice_id,
            qc.content as choice_content,
            qc.is_correct,
            qc.order_index as choice_order_index
        FROM quiz_questions qq
        LEFT JOIN quiz_question_choices qc ON qq.id = qc.quiz_question_id
        WHERE qq.quiz_id = $1
        ORDER BY qq.order_index, qc.order_index
      `, [quizId]);

      // Group choices by question
      const questionsMap = new Map();
      
      result.rows.forEach((row: any) => {
        if (!questionsMap.has(row.id)) {
          questionsMap.set(row.id, {
            id: row.id,
            content: row.content,
            explanation: row.explanation,
            orderIndex: row.order_index,
            choices: []
          });
        }
        
        if (row.choice_id) {
          questionsMap.get(row.id).choices.push({
            id: row.choice_id,
            content: row.choice_content,
            isCorrect: row.is_correct,
            orderIndex: row.choice_order_index
          });
        }
      });

      const questions = Array.from(questionsMap.values());
      
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
}

export const storage = new DatabaseStorage();

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAuthenticatedAndActive, createUser, authenticateUser, getCurrentUser, hashPassword, verifyPassword } from "./formAuth";
import { setupAdminAuth, isAdminAuthenticated } from "./adminAuth";
import { generateQuestions } from "./aiService";
import { insertQuizSessionSchema, insertUserAnswerSchema, topics, questions, quizSessions, userAnswers, subjects, levels, terms, signupSchema, signinSchema, passwordSetupSchema } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  
  // Setup admin authentication
  setupAdminAuth(app);

  // Auth routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const validatedData = signupSchema.parse(req.body);
      const newUser = await createUser(validatedData);
      
      // Store user in session
      (req.session as any).user = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      };
      
      res.status(201).json({
        message: "Account created successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
        }
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.code === '23505') { // Unique constraint violation
        res.status(400).json({ message: "Email already exists" });
      } else if (error.issues) {
        res.status(400).json({ message: "Validation error", errors: error.issues });
      } else {
        res.status(500).json({ message: "Failed to create account" });
      }
    }
  });

  app.post('/api/auth/signin', async (req, res) => {
    try {
      const validatedData = signinSchema.parse(req.body);
      const user = await authenticateUser(validatedData);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Store user in session
      (req.session as any).user = user;
      
      res.json({
        message: "Signed in successfully",
        user
      });
    } catch (error: any) {
      console.error("Signin error:", error);
      if (error.issues) {
        res.status(400).json({ message: "Validation error", errors: error.issues });
      } else {
        res.status(500).json({ message: "Failed to sign in" });
      }
    }
  });

  app.post('/api/auth/change-password', isAuthenticated, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters" });
      }
      
      const userId = (req.session as any).user.id;
      
      // Get current user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
        
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password
      const isValidPassword = await verifyPassword(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      // Hash new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update password
      await db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, userId));
      
      res.json({ message: "Password updated successfully" });
    } catch (error: any) {
      console.error("Password change error:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Logout error:", err);
          return res.status(500).json({ message: "Failed to logout" });
        }
        res.clearCookie('connect.sid');
        res.json({ message: "Logged out successfully" });
      });
    } else {
      res.json({ message: "Already logged out" });
    }
  });

  app.get('/api/auth/user', isAuthenticatedAndActive, async (req: any, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(currentUser.id);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Examination system routes
  app.get('/api/examination-systems', async (req, res) => {
    try {
      const systems = await storage.getExaminationSystems();
      res.json(systems);
    } catch (error) {
      console.error("Error fetching examination systems:", error);
      res.status(500).json({ message: "Failed to fetch examination systems" });
    }
  });

  // Level routes - All levels for admin filtering
  app.get('/api/levels', async (req, res) => {
    try {
      const levels = await storage.getAllLevels();
      res.json(levels);
    } catch (error) {
      console.error("Error fetching levels:", error);
      res.status(500).json({ message: "Failed to fetch levels" });
    }
  });

  // Level routes - By system
  app.get('/api/levels/:systemId', async (req, res) => {
    try {
      const { systemId } = req.params;
      const levels = await storage.getLevelsBySystem(systemId);
      res.json(levels);
    } catch (error) {
      console.error("Error fetching levels:", error);
      res.status(500).json({ message: "Failed to fetch levels" });
    }
  });

  // Terms routes - basic terms only for quiz selection (KCSE: Term 1, 2, 3)
  app.get('/api/terms', async (req, res) => {
    try {
      const terms = await storage.getTerms();
      // Filter to only show basic terms for KCSE (Term 1, 2, 3) for quiz selection
      const basicTerms = terms.filter(term => 
        term.examinationSystemId === 'bde2015e-8e30-4460-ad2b-c79837d9438b' && term.order <= 3
      );
      res.json(basicTerms);
    } catch (error) {
      console.error("Error fetching terms:", error);
      res.status(500).json({ message: "Failed to fetch terms" });
    }
  });

  // Terms routes - filtered by examination system for admin panel
  app.get('/api/terms/:systemId', async (req, res) => {
    try {
      const { systemId } = req.params;
      const terms = await storage.getTermsBySystem(systemId);
      res.json(terms);
    } catch (error) {
      console.error("Error fetching terms by system:", error);
      res.status(500).json({ message: "Failed to fetch terms" });
    }
  });

  // Leaderboard routes
  app.get('/api/leaderboard/:filter?', async (req, res) => {
    try {
      const filter = req.params.filter || 'overall';
      const leaderboard = filter === 'today' 
        ? await storage.getTodayLeaderboard()
        : await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Get quiz history for current user
  app.get('/api/quiz-history', isAuthenticatedAndActive, async (req: any, res) => {
    try {
      const userId = getCurrentUser(req)?.id;
      const quizHistory = await storage.getQuizHistoryForUser(userId);
      res.json(quizHistory);
    } catch (error) {
      console.error('Error fetching quiz history:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get user stats for dashboard
  app.get('/api/user-stats', isAuthenticatedAndActive, async (req: any, res) => {
    try {
      const userId = getCurrentUser(req)?.id;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Profile update routes
  app.patch('/api/profiles/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = getCurrentUser(req)?.id;
      
      // Handle empty levelId - remove it from update data to avoid constraint violation
      if (updateData.levelId === '') {
        delete updateData.levelId;
      }
      
      console.log('Updating profile:', id, 'with data:', updateData);
      
      // First verify the profile belongs to the user
      const currentProfile = await storage.getProfile(id);
      if (!currentProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      if (currentProfile.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized to update this profile" });
      }
      
      const updatedProfile = await storage.updateProfile(id, updateData);
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile: " + error.message });
    }
  });

  // Enhanced Quiz API Routes
  
  // Generate and start a new quiz
  app.post('/api/quizzes/generate', isAuthenticatedAndActive, async (req: any, res) => {
    try {
      const userId = getCurrentUser(req)?.id;
      const { 
        examinationSystemId, 
        levelId, 
        subjectId, 
        quizType, 
        topicId, 
        termId,
        questionCount = 15,
        timeLimit = 30 
      } = req.body;

      // Get user's active profile first (needed for limit checking)
      const profiles = await storage.getUserProfiles(userId);
      const currentProfile = profiles.find(p => p.isDefault) || profiles[0];
      
      if (!currentProfile) {
        return res.status(400).json({ message: "No profile found" });
      }

      // Check daily quiz limit with comprehensive enforcement
      const limitCheck = await storage.checkDailyQuizLimit(userId, currentProfile.id);
      
      if (!limitCheck.canTakeQuiz) {
        const usageInfo = limitCheck.usageInfo;
        
        if (usageInfo.requiresSubscription) {
          return res.status(403).json({ 
            message: "Active subscription required", 
            requiresSubscription: true 
          });
        }
        
        if (usageInfo.limitExceeded) {
          return res.status(403).json({ 
            message: `Daily quiz limit reached. You've used ${usageInfo.dailyUsage}/${usageInfo.dailyLimit} quizzes today.`, 
            limitExceeded: true,
            dailyLimit: usageInfo.dailyLimit,
            dailyUsage: usageInfo.dailyUsage,
            planName: usageInfo.planName
          });
        }
        
        return res.status(403).json({ 
          message: "Cannot start quiz at this time", 
          error: usageInfo.error 
        });
      }

      const params = {
        examinationSystemId,
        levelId,
        subjectId,
        quizType,
        topicId,
        termId,
        questionCount,
        timeLimit
      };

      const { LLMQuizEngine } = await import('./llmQuizEngine');
      const sessionId = await LLMQuizEngine.generateQuiz(params, userId, currentProfile.id);
      
      res.json({ sessionId, message: "Quiz generated successfully" });
    } catch (error) {
      console.error("Error generating quiz:", error);
      res.status(500).json({ message: "Failed to generate quiz: " + error.message });
    }
  });

  // Get quiz session details
  app.get('/api/quiz-sessions/:sessionId', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const userId = getCurrentUser(req)?.id;
      
      const { LLMQuizEngine } = await import('./llmQuizEngine');
      const sessionData = await LLMQuizEngine.getQuizSession(sessionId);
      
      // Verify session belongs to user
      const profiles = await storage.getUserProfiles(userId);
      const userProfileIds = profiles.map(p => p.id);
      
      // Note: Would need to add profileId check in QuizEngine.getQuizSession
      
      res.json(sessionData);
    } catch (error) {
      console.error("Error fetching quiz session:", error);
      res.status(500).json({ message: "Failed to fetch quiz session: " + error.message });
    }
  });

  // Get detailed quiz review with questions and answers
  app.get('/api/quiz-sessions/:sessionId/review', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const userId = getCurrentUser(req)?.id;
      
      // Get the quiz session with subject name
      const session = await db
        .select({
          id: quizSessions.id,
          profileId: quizSessions.profileId,
          subjectId: quizSessions.subjectId,
          quizType: quizSessions.quizType,
          topicId: quizSessions.topicId,
          termId: quizSessions.termId,
          quizQuestions: quizSessions.quizQuestions,
          totalQuestions: quizSessions.totalQuestions,
          correctAnswers: quizSessions.correctAnswers,
          completed: quizSessions.completed,
          subjectName: subjects.name,
          subjectCode: subjects.code,
        })
        .from(quizSessions)
        .leftJoin(subjects, eq(quizSessions.subjectId, subjects.id))
        .where(eq(quizSessions.id, sessionId))
        .limit(1);
      
      if (session.length === 0) {
        return res.status(404).json({ message: "Quiz session not found" });
      }
      
      // Verify session belongs to user
      const profiles = await storage.getUserProfiles(userId);
      const userProfileIds = profiles.map(p => p.id);
      if (!userProfileIds.includes(session[0].profileId)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Get user answers for this session
      const answers = await db
        .select()
        .from(userAnswers)
        .where(eq(userAnswers.quizSessionId, sessionId));
      
      // Get quiz questions from session JSONB data
      const quizQuestions = session[0].quizQuestions as any;
      
      if (!quizQuestions || !Array.isArray(quizQuestions)) {
        return res.status(400).json({ message: "Quiz questions not found in session" });
      }
      
      // Combine questions with user answers
      const reviewData = quizQuestions.map((question: any) => {
        const userAnswer = answers.find(a => a.questionId === question.id);
        return {
          ...question,
          userAnswer: userAnswer ? userAnswer.userAnswer : null,
          isCorrect: userAnswer ? userAnswer.isCorrect : false,
          timeSpent: userAnswer ? userAnswer.timeSpent : 0
        };
      });
      
      // Get subject name from the joined query
      const subjectName = session[0].subjectName || session[0].subjectCode || 'Unknown Subject';
      
      res.json({
        sessionId,
        subjectName: subjectName,
        quizType: session[0].quizType,
        totalQuestions: session[0].totalQuestions,
        correctAnswers: session[0].correctAnswers,
        completed: session[0].completed,
        questions: reviewData
      });
    } catch (error) {
      console.error("Error fetching quiz review:", error);
      res.status(500).json({ message: "Failed to fetch quiz review: " + error.message });
    }
  });

  // Submit answer for quiz question
  app.post('/api/quiz-sessions/:sessionId/answers', isAuthenticatedAndActive, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const { questionId, choiceId, answer, timeSpent } = req.body;
      
      const { LLMQuizEngine } = await import('./llmQuizEngine');
      const result = await LLMQuizEngine.submitAnswer(sessionId, questionId, choiceId, answer, timeSpent || 0);
      
      res.json({ isCorrect: result.isCorrect, message: "Answer submitted successfully" });
    } catch (error) {
      console.error("Error submitting answer:", error);
      res.status(500).json({ message: "Failed to submit answer: " + error.message });
    }
  });

  // Complete quiz session
  app.post('/api/quiz-sessions/:sessionId/complete', isAuthenticatedAndActive, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      
      const { LLMQuizEngine } = await import('./llmQuizEngine');
      const results = await LLMQuizEngine.completeQuiz(sessionId);
      
      res.json(results);
    } catch (error) {
      console.error("Error completing quiz:", error);
      res.status(500).json({ message: "Failed to complete quiz: " + error.message });
    }
  });

  // ===== ADMIN ROUTES =====
  
  // Admin analytics and metrics
  app.get('/api/admin/metrics', isAdminAuthenticated, async (req: any, res) => {
    try {
      // Enhanced metrics for admin dashboard
      const [
        totalUsers,
        totalQuizzes,
        totalSessions,
        avgScore,
        engagementMetrics,
        performanceMetrics
      ] = await Promise.all([
        storage.getTotalUsersCount(),
        storage.getTotalQuizzesCount(),
        storage.getTotalSessionsCount(),
        storage.getAverageScore(),
        storage.getEngagementMetrics(),
        storage.getPerformanceMetrics()
      ]);
      
      res.json({
        totalUsers,
        totalQuizzes, 
        totalSessions,
        avgScore,
        dailyActiveUsers: engagementMetrics.dailyActiveUsers,
        weeklyActiveUsers: engagementMetrics.weeklyActiveUsers,
        completionRate: performanceMetrics.completionRate,
        averageSessionTime: performanceMetrics.averageSessionTime,
        dailyGrowth: engagementMetrics.dailyGrowth,
        weeklyEngagementRate: engagementMetrics.weeklyEngagementRate
      });
    } catch (error) {
      console.error("Error fetching admin metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // Admin quiz list with filters and analytics
  app.get('/api/admin/quizzes', isAdminAuthenticated, async (req: any, res) => {
    try {
      const quizzes = await storage.getAdminQuizList(req.query);
      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching admin quizzes:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  // Get quiz details with questions
  app.get('/api/admin/quizzes/:quizId', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { quizId } = req.params;
      const quizWithQuestions = await storage.getQuizWithQuestions(quizId);
      res.json(quizWithQuestions);
    } catch (error) {
      console.error("Error fetching quiz details:", error);
      res.status(500).json({ message: "Failed to fetch quiz details" });
    }
  });

  // Create new quiz
  app.post('/api/admin/quizzes', isAdminAuthenticated, async (req: any, res) => {
    try {
      const userId = getCurrentUser(req)?.id;
      const quizData = { ...req.body, createdBy: userId };
      
      const newQuiz = await storage.createQuiz(quizData);
      res.json(newQuiz);
    } catch (error) {
      console.error("Error creating quiz:", error);
      res.status(500).json({ message: "Failed to create quiz" });
    }
  });

  // Update quiz
  app.put('/api/admin/quizzes/:quizId', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { quizId } = req.params;
      const updateData = req.body;
      
      const updatedQuiz = await storage.updateQuiz(quizId, updateData);
      res.json(updatedQuiz);
    } catch (error) {
      console.error("Error updating quiz:", error);
      res.status(500).json({ message: "Failed to update quiz" });
    }
  });

  // Delete quiz
  app.delete('/api/admin/quizzes/:quizId', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { quizId } = req.params;
      await storage.deleteQuiz(quizId);
      res.json({ message: "Quiz deleted successfully" });
    } catch (error) {
      console.error("Error deleting quiz:", error);
      res.status(500).json({ message: "Failed to delete quiz" });
    }
  });

  // CRUD routes for Examination Systems
  app.post('/api/admin/examination-systems', isAdminAuthenticated, async (req: any, res) => {
    try {
      const newSystem = await storage.createExaminationSystem(req.body);
      res.json(newSystem);
    } catch (error) {
      console.error("Error creating examination system:", error);
      res.status(500).json({ message: "Failed to create examination system" });
    }
  });

  app.put('/api/admin/examination-systems/:id', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updatedSystem = await storage.updateExaminationSystem(id, req.body);
      res.json(updatedSystem);
    } catch (error) {
      console.error("Error updating examination system:", error);
      res.status(500).json({ message: "Failed to update examination system" });
    }
  });

  app.delete('/api/admin/examination-systems/:id', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteExaminationSystem(id);
      res.json({ message: "Examination system deleted successfully" });
    } catch (error) {
      console.error("Error deleting examination system:", error);
      res.status(500).json({ message: "Failed to delete examination system" });
    }
  });

  // CRUD routes for Levels
  app.post('/api/admin/levels', isAdminAuthenticated, async (req: any, res) => {
    try {
      const newLevel = await storage.createLevel(req.body);
      res.json(newLevel);
    } catch (error) {
      console.error("Error creating level:", error);
      res.status(500).json({ message: "Failed to create level" });
    }
  });

  app.put('/api/admin/levels/:id', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updatedLevel = await storage.updateLevel(id, req.body);
      res.json(updatedLevel);
    } catch (error) {
      console.error("Error updating level:", error);
      res.status(500).json({ message: "Failed to update level" });
    }
  });

  app.delete('/api/admin/levels/:id', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteLevel(id);
      res.json({ message: "Level deleted successfully" });
    } catch (error) {
      console.error("Error deleting level:", error);
      res.status(500).json({ message: "Failed to delete level" });
    }
  });

  // CRUD routes for Subjects
  app.post('/api/admin/subjects', isAdminAuthenticated, async (req: any, res) => {
    try {
      const newSubject = await storage.createSubject(req.body);
      res.json(newSubject);
    } catch (error) {
      console.error("Error creating subject:", error);
      res.status(500).json({ message: "Failed to create subject" });
    }
  });

  app.put('/api/admin/subjects/:id', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updatedSubject = await storage.updateSubject(id, req.body);
      res.json(updatedSubject);
    } catch (error) {
      console.error("Error updating subject:", error);
      res.status(500).json({ message: "Failed to update subject" });
    }
  });

  app.delete('/api/admin/subjects/:id', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSubject(id);
      res.json({ message: "Subject deleted successfully" });
    } catch (error) {
      console.error("Error deleting subject:", error);
      res.status(500).json({ message: "Failed to delete subject" });
    }
  });

  // CRUD routes for Terms
  app.post('/api/admin/terms', isAdminAuthenticated, async (req: any, res) => {
    try {
      const newTerm = await storage.createTerm(req.body);
      res.json(newTerm);
    } catch (error) {
      console.error("Error creating term:", error);
      res.status(500).json({ message: "Failed to create term" });
    }
  });

  app.put('/api/admin/terms/:id', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updatedTerm = await storage.updateTerm(id, req.body);
      res.json(updatedTerm);
    } catch (error) {
      console.error("Error updating term:", error);
      res.status(500).json({ message: "Failed to update term" });
    }
  });

  app.delete('/api/admin/terms/:id', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTerm(id);
      res.json({ message: "Term deleted successfully" });
    } catch (error) {
      console.error("Error deleting term:", error);
      res.status(500).json({ message: "Failed to delete term" });
    }
  });

  // Admin generate quiz endpoint
  app.post('/api/admin/generate-quiz', isAdminAuthenticated, async (req: any, res) => {
    try {
      const userId = getCurrentUser(req)?.id;
      const quizData = req.body;
      
      // Use LLM to generate quiz with admin privileges
      const { LLMQuizEngine } = await import('./llmQuizEngine');
      const sessionId = await LLMQuizEngine.generateQuizForAdmin(quizData, userId);
      
      res.json({ 
        quizId: sessionId, 
        message: "Quiz template created successfully by admin" 
      });
    } catch (error: any) {
      console.error("Error generating admin quiz:", error);
      res.status(500).json({ message: "Failed to generate quiz: " + (error?.message || 'Unknown error') });
    }
  });

  // Recent activity for admin dashboard
  app.get('/api/admin/recent-activity', isAdminAuthenticated, async (req: any, res) => {
    try {
      const activities = await storage.getRecentActivity();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  // Admin leaderboard
  app.get('/api/admin/leaderboard', isAdminAuthenticated, async (req: any, res) => {
    try {
      const leaderboard = await storage.getTopPerformers();
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching admin leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Enhanced analytics endpoints
  app.get('/api/admin/analytics', isAdminAuthenticated, async (req: any, res) => {
    try {
      // Test with basic analytics first
      const quizActivity = await storage.getQuizActivityByDay();
      const subjectDistribution = await storage.getSubjectDistribution();
      const engagementMetrics = await storage.getEngagementMetrics();
      const performanceMetrics = await storage.getPerformanceMetrics();

      // Get actual user counts
      const [userCounts, examDistribution, revenueData] = await Promise.all([
        // User statistics
        Promise.all([
          storage.getUsersCount(),
          storage.getActiveUsersCount(),
        ]).then(([total, active]) => ({ total, active })),
        
        // Exam system distribution
        storage.getExamSystemDistribution().catch(() => []),
        
        // Revenue metrics
        storage.getRevenueMetrics().catch(() => ({
          monthlyRevenue: 0,
          avgRevenuePerUser: 0,
          conversionRate: 0,
          customerLTV: 0
        }))
      ]);
      
      // Calculate user growth data
      const userGrowthData = [
        { month: 'Aug', users: Math.max(1, userCounts.total - 1), active: Math.max(1, userCounts.active - 1) },
        { month: 'Sep', users: userCounts.total, active: userCounts.active }
      ];
      
      const examSystemDistribution = examDistribution.length > 0 ? examDistribution : [
        { name: 'KCSE', value: userCounts.total, color: '#8884d8' }
      ];
      
      const userActivity = {
        totalUsers: userCounts.total,
        newUsersThisWeek: Math.max(0, userCounts.total - 1),
        activeUsersToday: userCounts.active,
        activeUsersThisWeek: userCounts.active,
        avgSessionsPerUser: performanceMetrics.weeklyQuizzes ? 
          Number((performanceMetrics.weeklyQuizzes / Math.max(1, userCounts.active)).toFixed(1)) : 0
      };

      res.json({
        quizActivity,
        subjectDistribution,
        engagement: engagementMetrics,
        performance: performanceMetrics,
        userGrowth: userGrowthData,
        hourlyEngagement: [],
        examSystemDistribution,
        revenue: revenueData,
        userActivity,
        completionTrends: []
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Top performers by period (daily/weekly/monthly)
  app.get('/api/admin/top-performers/:period', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { period } = req.params;
      let performers;

      switch (period) {
        case 'daily':
          performers = await storage.getDailyTopPerformers();
          break;
        case 'weekly':
          performers = await storage.getWeeklyTopPerformers();
          break;
        case 'monthly':
          performers = await storage.getMonthlyTopPerformers();
          break;
        default:
          return res.status(400).json({ message: "Invalid period. Use daily, weekly, or monthly" });
      }

      res.json(performers);
    } catch (error) {
      console.error(`Error fetching ${req.params.period} top performers:`, error);
      res.status(500).json({ message: `Failed to fetch ${req.params.period} top performers` });
    }
  });

  // Admin topic management routes
  app.get('/api/admin/topics', isAdminAuthenticated, async (req: any, res) => {
    try {
      const topics = await storage.getAdminTopicList(req.query);
      res.json(topics);
    } catch (error) {
      console.error("Error fetching admin topics:", error);
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  app.post('/api/admin/topics', isAdminAuthenticated, async (req: any, res) => {
    try {
      const topicData = req.body;
      const newTopic = await storage.createTopic(topicData);
      res.json(newTopic);
    } catch (error) {
      console.error("Error creating topic:", error);
      res.status(500).json({ message: "Failed to create topic" });
    }
  });

  app.put('/api/admin/topics/:topicId', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { topicId } = req.params;
      const updateData = req.body;
      const updatedTopic = await storage.updateTopic(topicId, updateData);
      res.json(updatedTopic);
    } catch (error) {
      console.error("Error updating topic:", error);
      res.status(500).json({ message: "Failed to update topic" });
    }
  });

  app.delete('/api/admin/topics/:topicId', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { topicId } = req.params;
      await storage.deleteTopic(topicId);
      res.json({ message: "Topic deleted successfully" });
    } catch (error) {
      console.error("Error deleting topic:", error);
      res.status(500).json({ message: "Failed to delete topic" });
    }
  });

  // Generate topic content with AI
  app.post('/api/admin/topics/:topicId/generate-content', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { topicId } = req.params;
      
      // Get topic details
      const topic = await storage.getTopicById(topicId);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }

      // Import AI service
      const { generateTopicContent } = await import('./aiService');
      
      // Generate content
      const content = await generateTopicContent({
        subject: topic.subject || 'Unknown Subject',
        level: topic.level || 'Unknown Level',
        topicTitle: topic.title,
        topicDescription: topic.description,
        termTitle: topic.term
      });

      // Update topic with generated content - using summaryContent field
      await storage.updateTopic(topicId, { summaryContent: content });

      res.json({ content });
    } catch (error) {
      console.error("Error generating topic content:", error);
      res.status(500).json({ message: "Failed to generate content" });
    }
  });

  // Admin user management routes
  app.get('/api/admin/users', isAdminAuthenticated, async (req: any, res) => {
    try {
      const users = await storage.getAdminUserList(req.query);
      res.json(users);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/user-stats', isAdminAuthenticated, async (req: any, res) => {
    try {
      const stats = await storage.getAdminUserStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Get detailed user information
  app.get('/api/admin/users/:id', isAdminAuthenticated, async (req: any, res) => {
    try {
      const userDetails = await storage.getAdminUserDetails(req.params.id);
      if (!userDetails) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(userDetails);
    } catch (error) {
      console.error("Error fetching user details:", error);
      res.status(500).json({ message: "Failed to fetch user details" });
    }
  });

  // Block/unblock user
  app.patch('/api/admin/users/:id/status', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { isBlocked } = req.body;
      const result = await storage.updateUserStatus(req.params.id, isBlocked);
      res.json(result);
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  // Delete user completely
  app.delete('/api/admin/users/:id', isAdminAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const result = await storage.deleteUser(userId);
      res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Quiz types management routes
  app.get('/api/admin/quiz-types', isAdminAuthenticated, async (req: any, res) => {
    try {
      const quizTypes = await storage.getQuizTypes();
      res.json(quizTypes);
    } catch (error) {
      console.error('Error fetching quiz types:', error);
      res.status(500).json({ error: 'Failed to fetch quiz types' });
    }
  });

  app.post('/api/admin/quiz-types', isAdminAuthenticated, async (req: any, res) => {
    try {
      const quizType = await storage.createQuizType(req.body);
      res.json(quizType);
    } catch (error) {
      console.error('Error creating quiz type:', error);
      res.status(500).json({ error: 'Failed to create quiz type' });
    }
  });

  app.patch('/api/admin/quiz-types/:id', isAdminAuthenticated, async (req: any, res) => {
    try {
      const quizType = await storage.updateQuizType(req.params.id, req.body);
      res.json(quizType);
    } catch (error) {
      console.error('Error updating quiz type:', error);
      res.status(500).json({ error: 'Failed to update quiz type' });
    }
  });

  app.delete('/api/admin/quiz-types/:id', isAdminAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteQuizType(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting quiz type:', error);
      res.status(500).json({ error: 'Failed to delete quiz type' });
    }
  });

  // Enhanced quiz system routes
  app.get('/api/admin/quizzes', isAdminAuthenticated, async (req: any, res) => {
    const quizzes = await storage.getAdminQuizzes();
    res.json(quizzes);
  });

  // Get single quiz details for preview
  app.get('/api/admin/quizzes/:quizId', isAdminAuthenticated, async (req: any, res) => {
    try {
      const quiz = await storage.getQuizDetails(req.params.quizId);
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }
      res.json(quiz);
    } catch (error) {
      console.error('Error fetching quiz details:', error);
      res.status(500).json({ error: 'Failed to fetch quiz details' });
    }
  });

  // ===== END ADMIN ROUTES =====

  // Get quiz types
  app.get('/api/quiz-types', async (req, res) => {
    try {
      const quizTypes = await storage.getQuizTypes();
      res.json(quizTypes);
    } catch (error) {
      console.error("Error fetching quiz types:", error);
      res.status(500).json({ message: "Failed to fetch quiz types" });
    }
  });

  // Primary quiz start endpoint - uses existing admin-created quizzes
  app.post('/api/quiz/start', isAuthenticatedAndActive, async (req: any, res) => {
    try {
      const userId = getCurrentUser(req)?.id;
      const { profileId, subjectId, quizType, topicId, termId } = req.body;
      
      // Check if user has active subscription
      const subscription = await storage.getUserSubscription(userId);
      if (!subscription || subscription.status !== 'active') {
        return res.status(403).json({ 
          message: "Active subscription required", 
          requiresSubscription: true 
        });
      }

      // Check daily quiz limit with comprehensive enforcement
      const limitCheck = await storage.checkDailyQuizLimit(userId, profileId);
      
      if (!limitCheck.canTakeQuiz) {
        const usageInfo = limitCheck.usageInfo;
        
        if (usageInfo.requiresSubscription) {
          return res.status(403).json({ 
            message: "Active subscription required", 
            requiresSubscription: true 
          });
        }
        
        if (usageInfo.limitExceeded) {
          return res.status(403).json({ 
            message: `Daily quiz limit reached. You've used ${usageInfo.dailyUsage}/${usageInfo.dailyLimit} quizzes today.`, 
            limitExceeded: true,
            dailyLimit: usageInfo.dailyLimit,
            dailyUsage: usageInfo.dailyUsage,
            planName: usageInfo.planName
          });
        }
        
        return res.status(403).json({ 
          message: "Cannot start quiz at this time", 
          error: usageInfo.error 
        });
      }
      
      // Get profile to access examination system and level
      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      // Get available quizzes based on filters  
      const availableQuizzes = await storage.getQuizzesBySubject(subjectId);
      console.log('Available quizzes for subject:', availableQuizzes);

      // Filter quizzes that have actual questions in them
      let quizzesWithQuestions = availableQuizzes.filter(quiz => {
        const questions = quiz.questions;
        return questions && Array.isArray(questions) && questions.length > 0;
      });

      console.log('All quizzes with questions before filtering:', quizzesWithQuestions.map(q => `${q.title} (Type: ${q.quizType}, Level: ${q.levelId}, Topic: ${q.topicId})`));

      // Filter by current profile level
      quizzesWithQuestions = quizzesWithQuestions.filter(quiz => quiz.levelId === profile.levelId);
      console.log('Quizzes after level filtering:', quizzesWithQuestions.length);

      // Filter by quiz type - very important for random vs topical separation
      if (quizType === 'random') {
        // For random quizzes, only get quizzes that are specifically marked as random or have no specific topic/term
        quizzesWithQuestions = quizzesWithQuestions.filter(quiz => 
          quiz.quizType === 'random' || (!quiz.topicId && !quiz.termId)
        );
        console.log('Random quizzes after type filtering:', quizzesWithQuestions.length);
      }

      // For topical quizzes, try to find existing quizzes that match the specific topic
      else if (quizType === 'topical' && topicId) {
        // Filter for topical quizzes only
        quizzesWithQuestions = quizzesWithQuestions.filter(quiz => quiz.quizType === 'topical');
        
        // First try exact topicId match
        let topicalQuizzes = quizzesWithQuestions.filter(quiz => quiz.topicId === topicId);
        
        // If no exact match, try to find quizzes with similar topic names (for cross-level compatibility)
        if (topicalQuizzes.length === 0) {
          const [selectedTopic] = await db
            .select()
            .from(topics)
            .where(eq(topics.id, topicId));
          
          if (selectedTopic) {
            // Find all topics with similar names across levels for this subject
            const similarTopics = await db
              .select()
              .from(topics)
              .where(and(
                eq(topics.subjectId, subjectId),
                eq(topics.title, selectedTopic.title)
              ));
            
            const similarTopicIds = similarTopics.map(t => t.id);
            topicalQuizzes = quizzesWithQuestions.filter(quiz => 
              similarTopicIds.includes(quiz.topicId)
            );
            
            console.log(`Found ${topicalQuizzes.length} quizzes for similar topic "${selectedTopic.title}" across levels`);
          }
        }
        
        if (topicalQuizzes.length > 0) {
          quizzesWithQuestions = topicalQuizzes;
          console.log('Using existing topical quizzes:', topicalQuizzes.length);
        }
      }

      // For termly quizzes, try to find existing quizzes that match the specific term
      else if (quizType === 'termly' && termId) {
        // Filter for termly quizzes only
        quizzesWithQuestions = quizzesWithQuestions.filter(quiz => 
          quiz.quizType === 'termly' && quiz.termId === termId
        );
        console.log('Found existing termly quizzes for term:', quizzesWithQuestions.length);
      }

      console.log('Final filtered quizzes with questions:', quizzesWithQuestions.length);

      // If we have admin quizzes with questions, use them
      if (quizzesWithQuestions.length > 0) {
        // Pick a random quiz from available ones
        const selectedQuiz = quizzesWithQuestions[Math.floor(Math.random() * quizzesWithQuestions.length)];
        console.log('Selected admin quiz:', selectedQuiz.title);

        // Get questions from the selected quiz
        const quizQuestions = selectedQuiz.questions.map((q: any, index: number) => ({
          id: q.id,
          content: q.content,
          choices: q.choices,
          explanation: q.explanation
        }));

        // Create quiz session with admin quiz questions
        const quizSession = await storage.createQuizSession({
          userId,
          profileId,
          subjectId,
          quizType,
          totalQuestions: quizQuestions.length,
          currentQuestionIndex: 0,
          quizQuestions: quizQuestions,
        });

        const sessionQuestions = quizQuestions.map(q => ({
          id: q.id,
          questionText: q.content,
          optionA: q.choices[0]?.content || '',
          optionB: q.choices[1]?.content || '',
          optionC: q.choices[2]?.content || '',
          optionD: q.choices[3]?.content || '',
          correctAnswer: q.choices.find(c => c.isCorrect) ? 
            String.fromCharCode(65 + q.choices.findIndex(c => c.isCorrect)) : 'A',
          explanation: q.explanation
        }));

        return res.json({
          sessionId: quizSession.id,
          questions: sessionQuestions,
          source: 'admin'
        });
      }

      // If no admin quizzes with questions found, use AI to generate questions
      if (!availableQuizzes || availableQuizzes.length === 0 || quizzesWithQuestions.length === 0) {
        console.log('No admin quizzes with questions found, generating with AI and saving to admin pool...');
        
        // Get subject info for AI generation
        const [subjectInfo] = await db
          .select()
          .from(subjects)
          .where(eq(subjects.id, subjectId));
        
        if (!subjectInfo) {
          return res.status(404).json({ message: "Subject not found" });
        }

        try {
          console.log('Starting AI quiz generation for level:', profile.levelId);
          
          // Use the LLM Quiz Engine to generate and save quiz as admin template
          const { LLMQuizEngine } = await import('./llmQuizEngine');
          
          const quizGenerationParams = {
            examinationSystemId: profile.examinationSystemId,
            levelId: profile.levelId,
            subjectId: subjectId,
            quizType: quizType || 'random',
            topicId: topicId || null,
            termId: termId || null,
            questionCount: 10,
            timeLimit: 1800 // 30 minutes default
          };

          console.log('Generating admin quiz with params:', quizGenerationParams);
          
          // Generate and save quiz as admin template for future reuse
          const savedQuizId = await LLMQuizEngine.generateQuizForAdmin(quizGenerationParams, userId);
          
          console.log('Auto-generated admin quiz saved with ID:', savedQuizId);
          
          // Now get the saved quiz and use it for the session
          const savedQuiz = await storage.getQuizDetails(savedQuizId);
          
          if (!savedQuiz || !savedQuiz.questions || savedQuiz.questions.length === 0) {
            console.error('Failed to retrieve saved quiz or quiz has no questions');
            throw new Error("Generated quiz is empty or invalid");
          }

          // Use the saved quiz questions for the session
          const quizQuestions = savedQuiz.questions.map((q: any) => ({
            id: q.id,
            content: q.content,
            choices: q.choices,
            explanation: q.explanation
          }));

          // Create quiz session with the saved admin quiz questions
          const quizSession = await storage.createQuizSession({
            userId,
            profileId,
            subjectId,
            quizType,
            totalQuestions: quizQuestions.length,
            currentQuestionIndex: 0,
            quizQuestions: quizQuestions,
          });

          const sessionQuestions = quizQuestions.map(q => ({
            id: q.id,
            questionText: q.content,
            optionA: q.choices[0]?.content || '',
            optionB: q.choices[1]?.content || '',
            optionC: q.choices[2]?.content || '',
            optionD: q.choices[3]?.content || '',
            correctAnswer: q.choices.find(c => c.isCorrect) ? 
              String.fromCharCode(65 + q.choices.findIndex(c => c.isCorrect)) : 'A',
            explanation: q.explanation
          }));

          return res.json({
            sessionId: quizSession.id,
            questions: sessionQuestions,
            totalQuestions: sessionQuestions.length,
            currentQuestionIndex: 0,
            source: 'ai-generated-admin'
          });
        } catch (error) {
          console.error('AI question generation failed:', error);
          return res.status(500).json({ 
            message: "Failed to generate quiz questions", 
            error: error.message,
            level: profile.levelId,
            subject: subjectId,
            quizType: quizType
          });
        }
      }
    } catch (error) {
      console.error("Error starting quiz:", error);
      res.status(500).json({ message: "Failed to start quiz: " + error.message });
    }
  });

  // Profile routes
  app.get('/api/profiles', isAuthenticatedAndActive, async (req: any, res) => {
    try {
      const userId = getCurrentUser(req)?.id;
      const profiles = await storage.getUserProfiles(userId);
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      res.status(500).json({ message: "Failed to fetch profiles" });
    }
  });

  app.post('/api/profiles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getCurrentUser(req)?.id;
      const { examinationSystemId, levelId } = req.body;
      
      console.log('=== CREATE PROFILE REQUEST ===');
      console.log('User ID:', userId);
      console.log('Request body:', req.body);
      console.log('Examination System ID:', examinationSystemId);
      console.log('Level ID:', levelId);
      
      const profile = await storage.createProfile({
        userId,
        examinationSystemId,
        levelId,
      });

      console.log('Profile created:', profile);

      // If this is the user's first profile, set it as default
      const userProfiles = await storage.getUserProfiles(userId);
      console.log('User profiles count:', userProfiles.length);
      
      if (userProfiles.length === 1) {
        await storage.setDefaultProfile(userId, profile.id);
        console.log('Set as default profile');
      }

      console.log('=== PROFILE CREATION SUCCESS ===');
      res.json(profile);
    } catch (error) {
      console.error("=== PROFILE CREATION ERROR ===", error);
      res.status(500).json({ message: "Failed to create profile: " + error.message });
    }
  });

  app.put('/api/profiles/:profileId/default', isAdminAuthenticated, async (req: any, res) => {
    try {
      const userId = getCurrentUser(req)?.id;
      const { profileId } = req.params;
      
      const user = await storage.setDefaultProfile(userId, profileId);
      res.json(user);
    } catch (error) {
      console.error("Error setting default profile:", error);
      res.status(500).json({ message: "Failed to set default profile" });
    }
  });

  // Subject routes - All subjects for admin filtering
  app.get('/api/subjects', async (req, res) => {
    try {
      const subjects = await storage.getAllSubjects();
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  // Subject routes - By system (with quiz counts filtered by user level)
  app.get('/api/subjects/:systemId', isAuthenticated, async (req: any, res) => {
    try {
      const { systemId } = req.params;
      const userId = getCurrentUser(req)?.id;
      
      // Get user's current profile to filter questions by their level
      const profiles = await storage.getUserProfiles(userId);
      const currentProfile = profiles.find(p => p.examinationSystemId === systemId) || profiles[0];
      
      const subjects = await storage.getSubjectsBySystem(systemId, currentProfile?.levelId);
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  // Topic routes
  app.get('/api/topics/:subjectId/:levelId', async (req, res) => {
    try {
      const { subjectId, levelId } = req.params;
      const { termId } = req.query;
      const topics = await storage.getTopicsBySubjectAndLevel(subjectId, levelId, termId as string);
      res.json(topics);
    } catch (error) {
      console.error("Error fetching topics:", error);
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  // Get study notes for a specific topic
  app.get('/api/study-notes/:topicId', isAuthenticated, async (req: any, res) => {
    try {
      const { topicId } = req.params;
      
      // Get topic with study notes
      const topic = await storage.getTopicById(topicId);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }

      // If no study notes exist, generate them
      if (!topic.summaryContent) {
        console.log('No study notes found, generating content for topic:', topic.title);
        
        // Import AI service
        const { generateTopicContent } = await import('./aiService');
        
        // Generate content
        const content = await generateTopicContent({
          subject: topic.subject || 'Unknown Subject',
          level: topic.level || 'Unknown Level',
          topicTitle: topic.title,
          topicDescription: topic.description,
          termTitle: topic.term
        });

        // Update topic with generated content
        await storage.updateTopic(topicId, { summaryContent: content });
        
        // Return the generated content
        res.json({
          id: topic.id,
          title: topic.title,
          description: topic.description,
          content: content,
          subject: topic.subject,
          level: topic.level,
          term: topic.term
        });
      } else {
        // Return existing content
        res.json({
          id: topic.id,
          title: topic.title,
          description: topic.description,
          content: topic.summaryContent,
          subject: topic.subject,
          level: topic.level,
          term: topic.term
        });
      }
    } catch (error) {
      console.error("Error fetching study notes:", error);
      res.status(500).json({ message: "Failed to fetch study notes" });
    }
  });

  // Quiz session routes are now handled by the primary quiz start endpoint above

  // Batch answer submission for better performance
  app.post('/api/quiz/:sessionId/batch-answers', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const { answers } = req.body;

      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ message: "Answers array is required" });
      }

      const results = [];
      for (const answerData of answers) {
        const { questionId, userAnswer, timeSpent } = answerData;
        
        // Get the question to check if answer is correct
        const questionResult = await db.select().from(questions).where(eq(questions.id, questionId));
        const question = questionResult[0];
        
        if (question) {
          const isCorrect = question.correctAnswer === userAnswer;
          
          // Save user answer
          await storage.createUserAnswer({
            quizSessionId: sessionId,
            questionId,
            userAnswer,
            isCorrect,
            timeSpent: timeSpent || 0,
          });

          results.push({
            questionId,
            isCorrect,
            correctAnswer: question.correctAnswer,
          });
        }
      }

      res.json({ results, message: "All answers submitted successfully" });
    } catch (error) {
      console.error("Error submitting batch answers:", error);
      res.status(500).json({ message: "Failed to submit answers" });
    }
  });

  // Single answer submission (kept for backward compatibility)
  app.post('/api/quiz/:sessionId/answer', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const { questionId, userAnswer, timeSpent } = req.body;
      const userId = getCurrentUser(req)?.id;

      console.log('Submitting answer for session:', sessionId, 'question:', questionId, 'answer:', userAnswer);

      // Get the quiz session to access JSONB questions
      const session = await storage.getQuizSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Quiz session not found" });
      }

      // Find the question in the session's JSONB questions
      const questions = session.quizQuestions || [];
      const question = questions.find((q: any) => q.id === questionId);
      
      console.log('Available questions in session:', questions.map(q => ({ id: q.id, content: q.content?.substring(0, 50) })));
      console.log('Looking for question ID:', questionId);
      
      if (!question) {
        return res.status(404).json({ 
          message: "Question not found in session",
          availableQuestions: questions.map(q => q.id),
          requestedQuestionId: questionId
        });
      }

      // Check if answer is correct by looking at choices
      const correctChoice = question.choices?.find((choice: any) => choice.isCorrect);
      let isCorrect = false;
      
      console.log(`=== GRADING DEBUG ===`);
      console.log(`Question: ${question.content}`);
      console.log(`User answer: ${userAnswer}`);
      console.log(`All choices:`, question.choices);
      
      // Handle letter answers (A, B, C, D) - map to orderIndex (1, 2, 3, 4)
      if (userAnswer === 'A' || userAnswer === 'B' || userAnswer === 'C' || userAnswer === 'D') {
        const answerIndex = userAnswer === 'A' ? 1 : userAnswer === 'B' ? 2 : userAnswer === 'C' ? 3 : userAnswer === 'D' ? 4 : 0;
        console.log(`Looking for orderIndex: ${answerIndex}`);
        const selectedChoice = question.choices?.find((choice: any) => Number(choice.orderIndex) === Number(answerIndex));
        console.log(`Selected choice:`, selectedChoice);
        isCorrect = selectedChoice && selectedChoice.isCorrect === true;
        console.log(`Is correct: ${isCorrect}`);
      } else {
        // Full text answer
        const userChoice = question.choices?.find((choice: any) => choice.content === userAnswer);
        isCorrect = userChoice && userChoice.isCorrect === true;
      }

      console.log('Question found:', question.content);
      console.log('Correct choice:', correctChoice?.content);
      console.log('User answer:', userAnswer);
      console.log('Is correct:', isCorrect);
      console.log('Question choices:', question.choices);

      // Save user answer
      const answer = await storage.createUserAnswer({
        quizSessionId: sessionId,
        questionId,
        userAnswer,
        isCorrect: !!isCorrect,
        timeSpent,
      });

      // Update quiz session progress
      const currentIndex = session.currentQuestionIndex || 0;
      const newIndex = currentIndex + 1;
      const totalQuestions = questions.length;
      const completed = newIndex >= totalQuestions;

      await storage.updateQuizSession(sessionId, {
        currentQuestionIndex: newIndex,
        completed,
        correctAnswers: (session.correctAnswers || 0) + (isCorrect ? 1 : 0),
        ...(completed && { completedAt: new Date() })
      });

      res.json({
        isCorrect: !!isCorrect,
        correctAnswer: correctChoice?.content,
        explanation: question.explanation,
        currentIndex: newIndex,
        totalQuestions,
        completed
      });

    } catch (error) {
      console.error("Error submitting answer:", error);
      res.status(500).json({ message: "Failed to submit answer: " + error.message });
    }
  });


  // Get topics for a subject and level
  app.get('/api/subjects/:subjectId/topics/:levelId', async (req, res) => {
    try {
      const { subjectId, levelId } = req.params;
      const { term } = req.query;
      
      const topics = await storage.getTopicsBySubjectAndLevel(subjectId, levelId, term as string);
      res.json(topics);
    } catch (error) {
      console.error("Error fetching topics:", error);
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  // Resume an existing quiz session
  app.post('/api/quiz/resume/:sessionId', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getQuizSession(sessionId);
      
      if (!session || !session.quizQuestions) {
        return res.status(404).json({ message: "Quiz session not found" });
      }

      // Transform questions to frontend format  
      const questions = session.quizQuestions.map((q: any) => ({
        id: q.id,
        questionText: q.content,
        optionA: q.choices[0]?.content || 'Option A',
        optionB: q.choices[1]?.content || 'Option B', 
        optionC: q.choices[2]?.content || 'Option C',
        optionD: q.choices[3]?.content || 'Option D',
        correctAnswer: q.choices.find((c: any) => c.isCorrect)?.content || 'A',
        explanation: q.explanation
      }));

      res.json({
        sessionId: session.id,
        questions: questions,
        totalQuestions: questions.length,
        currentQuestionIndex: session.currentQuestionIndex || 0,
        isResuming: true
      });
    } catch (error) {
      console.error("Error resuming quiz:", error);
      res.status(500).json({ message: "Failed to resume quiz" });
    }
  });

  // Get topics for a subject and level
  app.get('/api/subjects/:subjectId/topics/:levelId', async (req, res) => {
    try {
      const { subjectId, levelId } = req.params;
      const { term } = req.query;
      
      const topics = await storage.getTopicsBySubjectAndLevel(subjectId, levelId, term as string);
      res.json(topics);
    } catch (error) {
      console.error("Error fetching topics:", error);
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  // Resume an existing quiz session
  app.post('/api/quiz/resume/:sessionId', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getQuizSession(sessionId);
      
      if (!session || !session.quizQuestions) {
        return res.status(404).json({ message: "Quiz session not found" });
      }

      // Transform questions to frontend format
      const questions = session.quizQuestions.map((q: any) => ({
        id: q.id,
        questionText: q.content,
        optionA: q.choices[0]?.content || 'Option A',
        optionB: q.choices[1]?.content || 'Option B', 
        optionC: q.choices[2]?.content || 'Option C',
        optionD: q.choices[3]?.content || 'Option D',
        correctAnswer: q.choices.find((c: any) => c.isCorrect)?.content || 'A',
        explanation: q.explanation
      }));

      res.json({
        sessionId: session.id,
        questions: questions,
        totalQuestions: questions.length,
        currentQuestionIndex: session.currentQuestionIndex || 0,
        isResuming: true
      });
    } catch (error) {
      console.error("Error resuming quiz:", error);
      res.status(500).json({ message: "Failed to resume quiz" });
    }
  });

  // Start a completely new quiz session (ignoring incomplete ones)
  app.post('/api/quiz/start-fresh', isAuthenticatedAndActive, async (req: any, res) => {
    try {
      const userId = getCurrentUser(req)?.id;
      const { profileId, subjectId, quizType } = req.body;

      if (!profileId || !subjectId) {
        return res.status(400).json({ message: "Profile ID and Subject ID are required" });
      }

      // Check if user has active subscription
      const subscription = await storage.getUserSubscription(userId);
      if (!subscription || subscription.status !== 'active') {
        return res.status(403).json({ 
          message: "Active subscription required", 
          requiresSubscription: true 
        });
      }

      // Check daily quiz limit with comprehensive enforcement
      const limitCheck = await storage.checkDailyQuizLimit(userId, profileId);
      
      if (!limitCheck.canTakeQuiz) {
        const usageInfo = limitCheck.usageInfo;
        
        if (usageInfo.limitExceeded) {
          return res.status(403).json({ 
            message: `Daily quiz limit reached. You've used ${usageInfo.dailyUsage}/${usageInfo.dailyLimit} quizzes today.`, 
            limitExceeded: true,
            dailyLimit: usageInfo.dailyLimit,
            dailyUsage: usageInfo.dailyUsage,
            planName: usageInfo.planName
          });
        }
        
        return res.status(403).json({ 
          message: "Cannot start quiz at this time", 
          error: usageInfo.error 
        });
      }

      // Delete any incomplete sessions for this subject
      await storage.deleteIncompleteQuizSessions(profileId, subjectId);

      // Test quiz questions
      const testQuestions = [
        {
          id: "physics_q1",
          content: "What is the SI unit of force?",
          choices: [
            { id: "physics_q1_c1", content: "Newton", isCorrect: true, orderIndex: 1 },
            { id: "physics_q1_c2", content: "Joule", isCorrect: false, orderIndex: 2 },
            { id: "physics_q1_c3", content: "Watt", isCorrect: false, orderIndex: 3 },
            { id: "physics_q1_c4", content: "Pascal", isCorrect: false, orderIndex: 4 }
          ],
          explanation: "The SI unit of force is the Newton (N), named after Sir Isaac Newton."
        },
        {
          id: "physics_q2", 
          content: "What is the acceleration due to gravity on Earth?",
          choices: [
            { id: "physics_q2_c1", content: "9.8 m/s²", isCorrect: true, orderIndex: 1 },
            { id: "physics_q2_c2", content: "10 m/s²", isCorrect: false, orderIndex: 2 },
            { id: "physics_q2_c3", content: "8.9 m/s²", isCorrect: false, orderIndex: 3 },
            { id: "physics_q2_c4", content: "11.2 m/s²", isCorrect: false, orderIndex: 4 }
          ],
          explanation: "The standard acceleration due to gravity on Earth is approximately 9.8 m/s²."
        },
        {
          id: "physics_q3",
          content: "Which law states that for every action, there is an equal and opposite reaction?",
          choices: [
            { id: "physics_q3_c1", content: "Newton's First Law", isCorrect: false, orderIndex: 1 },
            { id: "physics_q3_c2", content: "Newton's Second Law", isCorrect: false, orderIndex: 2 },
            { id: "physics_q3_c3", content: "Newton's Third Law", isCorrect: true, orderIndex: 3 },
            { id: "physics_q3_c4", content: "Law of Universal Gravitation", isCorrect: false, orderIndex: 4 }
          ],
          explanation: "Newton's Third Law states that for every action, there is an equal and opposite reaction."
        }
      ];

      // Create new session
      const quizSession = await storage.createQuizSession({
        userId,
        profileId,
        subjectId,
        quizType: 'random',
        totalQuestions: testQuestions.length,
        currentQuestionIndex: 0,
        quizQuestions: testQuestions,
      });

      // Transform questions to frontend format
      const questions = testQuestions.map((q: any) => ({
        id: q.id,
        questionText: q.content,
        optionA: q.choices[0]?.content || 'Option A',
        optionB: q.choices[1]?.content || 'Option B', 
        optionC: q.choices[2]?.content || 'Option C',
        optionD: q.choices[3]?.content || 'Option D',
        correctAnswer: q.choices.find((c: any) => c.isCorrect)?.content || 'A',
        explanation: q.explanation
      }));

      res.json({
        sessionId: quizSession.id,
        questions: questions,
        totalQuestions: questions.length,
        currentQuestionIndex: 0,
        isResuming: false
      });
    } catch (error) {
      console.error("Error starting fresh quiz:", error);
      res.status(500).json({ message: "Failed to start fresh quiz" });
    }
  });

  // Submit individual answer with session persistence
  app.post('/api/quiz/:sessionId/answer', isAuthenticatedAndActive, async (req: any, res) => {
    try {
      const userId = getCurrentUser(req)?.id;
      const sessionId = req.params.sessionId;
      const { questionId, userAnswer, timeSpent } = req.body;

      if (!sessionId || !questionId || !userAnswer) {
        return res.status(400).json({ message: "Session ID, question ID, and user answer are required" });
      }

      // Get quiz session to access the questions snapshot  
      const [quizSession] = await db
        .select()
        .from(quizSessions)
        .where(eq(quizSessions.id, sessionId));

      if (!quizSession) {
        return res.status(404).json({ message: "Quiz session not found" });
      }

      // Get the question from the quiz session's questions snapshot
      const questions = quizSession.quizQuestions as any[];
      const question = questions.find(q => q.id === questionId);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found in this quiz" });
      }

      // Find the correct answer from choices
      const correctChoice = question.choices?.find((c: any) => c.isCorrect);
      const correctAnswer = correctChoice ? correctChoice.content.charAt(0).toUpperCase() : 'A';
      const isCorrect = userAnswer.toUpperCase() === correctAnswer;

      // Save user answer
      await db.insert(userAnswers).values({
        quizSessionId: sessionId,
        questionId,
        userAnswer,
        isCorrect,
        timeSpent,
      });

      // Update current question index in quiz session
      const currentIndex = quizSession.currentQuestionIndex || 0;
      await db
        .update(quizSessions)
        .set({ currentQuestionIndex: currentIndex + 1 })
        .where(eq(quizSessions.id, sessionId));

      res.json({
        isCorrect,
        correctAnswer,
        explanation: question.explanation,
        sparksEarned: isCorrect ? 10 : 0,
      });
    } catch (error) {
      console.error("Error submitting answer:", error);
      res.status(500).json({ message: "Failed to submit answer" });
    }
  });

  // Complete quiz  
  app.post('/api/quiz/:sessionId/complete', isAuthenticatedAndActive, async (req: any, res) => {
    try {
      const userId = getCurrentUser(req)?.id;
      const sessionId = req.params.sessionId;

      if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
      }

      // Get quiz answers from user_answers table
      const answers = await db
        .select()
        .from(userAnswers)
        .where(eq(userAnswers.quizSessionId, sessionId));
      const correctAnswers = answers.filter(a => a.isCorrect).length;
      const totalQuestions = answers.length;
      
      // Get platform settings for sparks calculation
      const quizSettings = await storage.getQuizSettings();
      
      // Calculate accuracy percentage
      const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;
      const percentage = totalQuestions > 0 ? Math.round(accuracy * 100) : 0;
      
      console.log(`Quiz completion - Correct: ${correctAnswers}, Total: ${totalQuestions}, Accuracy: ${accuracy}, Percentage: ${percentage}`);
      
      // Calculate sparks earned using platform settings
      const baseSparks = correctAnswers * quizSettings.sparksPerCorrectAnswer;
      
      // Apply accuracy bonuses based on platform settings
      let bonusMultiplier = 1;
      if (accuracy >= Number(quizSettings.accuracyBonusThreshold)) {
        bonusMultiplier = Number(quizSettings.accuracyBonusMultiplier);
      } else if (accuracy >= Number(quizSettings.goodAccuracyThreshold)) {
        bonusMultiplier = Number(quizSettings.goodAccuracyMultiplier);
      }
      
      const sparksEarned = Math.round(baseSparks * bonusMultiplier);

      // Update quiz session
      const [updatedSession] = await db.update(quizSessions).set({
        correctAnswers,
        sparksEarned,
        completed: true,
        completedAt: new Date(),
      }).where(eq(quizSessions.id, sessionId)).returning();

      // Get current profile to update sparks and streaks
      const [currentProfile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, updatedSession.profileId));

      let newStreak = 1;
      if (currentProfile) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const lastQuizDate = currentProfile.lastQuizDate ? new Date(currentProfile.lastQuizDate) : null;
        let currentStreak = currentProfile.currentStreak || 0;
        
        // Update streak logic
        if (!lastQuizDate) {
          // First quiz ever
          newStreak = 1;
        } else {
          const lastQuizDay = new Date(lastQuizDate.getFullYear(), lastQuizDate.getMonth(), lastQuizDate.getDate());
          const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const yesterdayDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
          
          if (lastQuizDay.getTime() === yesterdayDay.getTime()) {
            // Consecutive day - increment streak
            newStreak = currentStreak + 1;
          } else if (lastQuizDay.getTime() === todayDay.getTime()) {
            // Already took quiz today - keep current streak
            newStreak = currentStreak;
          } else {
            // Gap in days - reset streak
            newStreak = 1;
          }
        }
        
        // Update profile with sparks, streak, and last quiz date
        await db
          .update(profiles)
          .set({
            sparks: sql`${profiles.sparks} + ${sparksEarned}`,
            currentStreak: newStreak,
            longestStreak: sql`GREATEST(${profiles.longestStreak}, ${newStreak})`,
            lastQuizDate: today,
            lastActivity: today,
            updatedAt: today
          })
          .where(eq(profiles.id, updatedSession.profileId));

        console.log(`✨ Profile updated - Added ${sparksEarned} sparks, streak: ${newStreak}`);
      }

      // Calculate grade
      let grade = 'F';
      if (percentage >= 90) grade = 'A';
      else if (percentage >= 80) grade = 'B+';
      else if (percentage >= 70) grade = 'B';
      else if (percentage >= 60) grade = 'C+';
      else if (percentage >= 50) grade = 'C';
      else if (percentage >= 40) grade = 'D';

      const responseObj = {
        correctAnswers,
        totalQuestions,
        score: `${correctAnswers}/${totalQuestions}`,
        percentage,
        accuracy: percentage, // Send percentage as accuracy for frontend
        grade,
        sparksEarned,
        currentStreak: newStreak,
        bonusMultiplier: bonusMultiplier > 1 ? bonusMultiplier : null,
      };
      
      console.log('Sending quiz completion response:', JSON.stringify(responseObj));
      res.json(responseObj);
    } catch (error) {
      console.error("Error completing quiz:", error);
      res.status(500).json({ message: "Failed to complete quiz" });
    }
  });

  // Get today's challenge
  app.get('/api/challenge/today', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getCurrentUser(req)?.id;
      const challenge = await storage.getTodaysChallenge();
      
      if (!challenge) {
        return res.status(404).json({ message: "No challenge for today" });
      }

      // const progress = await storage.getProfileChallengeProgress(profileId, challenge.id);
      
      res.json({
        challenge,
        progress: { currentValue: 0, completed: false },
      });
    } catch (error) {
      console.error("Error fetching today's challenge:", error);
      res.status(500).json({ message: "Failed to fetch today's challenge" });
    }
  });

  // Get user stats
  app.get('/api/user/stats', isAdminAuthenticated, async (req: any, res) => {
    try {
      const userId = getCurrentUser(req)?.id;
      // const stats = await storage.getProfileStats(profileId);
      res.json({ message: "Stats endpoint not implemented yet" });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Get subject performance
  app.get('/api/subjects/:subjectId/performance', isAdminAuthenticated, async (req: any, res) => {
    try {
      const userId = getCurrentUser(req)?.id;
      const { subjectId } = req.params;
      
      const performance = await storage.getSubjectPerformance(userId, subjectId);
      res.json(performance);
    } catch (error) {
      console.error("Error fetching subject performance:", error);
      res.status(500).json({ message: "Failed to fetch subject performance" });
    }
  });

  // Seed initial data (for development)
  app.post('/api/seed', async (req, res) => {
    try {
      // Get KCSE system
      const systems = await storage.getExaminationSystems();
      const kcseSystem = systems.find(s => s.name === 'Kenya Certificate of Secondary Education');
      if (!kcseSystem) throw new Error('KCSE system not found');

      // Create KCSE subjects
      const mathSubject = await storage.createSubject({
        name: 'Mathematics',
        code: 'MATH',
        examinationSystemId: kcseSystem.id,
        icon: 'fas fa-calculator',
        color: 'from-spark-blue to-spark-turquoise',
      });

      const physicsSubject = await storage.createSubject({
        name: 'Physics',
        code: 'PHYS',
        examinationSystemId: kcseSystem.id,
        icon: 'fas fa-atom',
        color: 'from-spark-mint to-spark-turquoise',
      });

      // Get form 1 level and term 1
      const levels = await storage.getLevelsBySystem(kcseSystem.id);
      const form1Level = levels.find(l => l.title === 'Form 1');
      const terms = await storage.getTerms();
      const term1 = terms.find(t => t.title === 'Term 1');
      
      if (!form1Level || !term1) throw new Error('Level or term not found');

      // Create topics for Form 1 Mathematics
      const algebraTopic = await storage.createTopic({
        examinationSystemId: kcseSystem.id,
        subjectId: mathSubject.id,
        levelId: form1Level.id,
        termId: term1.id,
        title: 'Algebra I',
        description: 'Introduction to algebraic expressions and equations',
        order: 1,
      });

      // Create sample questions
      await storage.createQuestion({
        topicId: algebraTopic.id,
        questionText: 'If 3x + 7 = 22, what is the value of x?',
        optionA: '3',
        optionB: '5',
        optionC: '7',
        optionD: '15',
        correctAnswer: 'B',
        explanation: 'To solve 3x + 7 = 22, subtract 7 from both sides: 3x = 15, then divide by 3: x = 5',
        difficulty: 'easy',
      });

      await storage.createQuestion({
        topicId: algebraTopic.id,
        questionText: 'Simplify: 2x + 3x - x',
        optionA: '4x',
        optionB: '5x',
        optionC: '6x',
        optionD: '3x',
        correctAnswer: 'A',
        explanation: 'Combine like terms: 2x + 3x - x = (2 + 3 - 1)x = 4x',
        difficulty: 'easy',
      });

      // Create today's challenge
      const today = new Date().toISOString().split('T')[0];
      await storage.createDailyChallenge({
        date: today,
        title: "Master 10 Questions",
        description: "Answer 10 questions correctly today",
        targetValue: 10,
        sparksReward: 200,
      });

      res.json({ message: "Database seeded successfully" });
    } catch (error) {
      console.error("Error seeding database:", error);
      res.status(500).json({ message: "Failed to seed database" });
    }
  });

  // Gamification API endpoints
  
  // Get all badges
  app.get('/api/badges', async (req, res) => {
    try {
      const badges = await storage.getBadges();
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  // Get user badges
  app.get('/api/user/:userId/badges', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const userBadges = await storage.getUserBadges(userId);
      res.json(userBadges);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({ message: "Failed to fetch user badges" });
    }
  });

  // Award badge to user
  app.post('/api/user/:userId/badges', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { badgeId, streaks = 0 } = req.body;
      
      if (!badgeId) {
        return res.status(400).json({ message: "Badge ID is required" });
      }

      const userBadge = await storage.awardBadge(userId, badgeId, streaks);
      res.json(userBadge);
    } catch (error) {
      console.error("Error awarding badge:", error);
      res.status(500).json({ message: "Failed to award badge" });
    }
  });

  // Get all trophies
  app.get('/api/trophies', async (req, res) => {
    try {
      const trophies = await storage.getTrophies();
      res.json(trophies);
    } catch (error) {
      console.error("Error fetching trophies:", error);
      res.status(500).json({ message: "Failed to fetch trophies" });
    }
  });

  // Get user badges
  app.get('/api/user/:userId/badges', async (req, res) => {
    try {
      const userId = req.params.userId;
      const userBadges = await storage.getUserBadges(userId);
      res.json(userBadges);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({ error: "Failed to fetch user badges" });
    }
  });

  // Get user trophies
  app.get('/api/user/:userId/trophies', async (req, res) => {
    try {
      const userId = req.params.userId;
      const userTrophies = await storage.getUserTrophies(userId);
      res.json(userTrophies);
    } catch (error) {
      console.error("Error fetching user trophies:", error);
      res.status(500).json({ error: "Failed to fetch user trophies" });
    }
  });

  // Award trophy to user
  app.post('/api/user/:userId/trophy', async (req, res) => {
    try {
      const userId = req.params.userId;
      const { trophyId } = req.body;
      
      const userTrophy = await storage.awardTrophy(userId, trophyId);
      
      res.json(userTrophy);
    } catch (error) {
      console.error("Error awarding trophy:", error);
      res.status(500).json({ error: "Failed to award trophy" });
    }
  });

  // Get user challenges progress
  app.get('/api/user/:userId/challenges', async (req, res) => {
    try {
      const userId = req.params.userId;
      const userChallenges = await storage.getUserChallenges(userId);
      res.json(userChallenges);
    } catch (error) {
      console.error("Error fetching user challenges:", error);
      res.status(500).json({ error: "Failed to fetch user challenges" });
    }
  });

  // Award badge to user
  app.post('/api/user/:userId/badge', async (req, res) => {
    try {
      const userId = req.params.userId;
      const { badgeId, streaks } = req.body;
      
      const userBadge = await storage.awardBadge(userId, badgeId, streaks || 0);
      
      res.json(userBadge);
    } catch (error) {
      console.error("Error awarding badge:", error);
      res.status(500).json({ error: "Failed to award badge" });
    }
  });

  // Get all challenges
  app.get('/api/challenges', async (req, res) => {
    try {
      const challenges = await storage.getChallenges();
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  // Get user challenges
  app.get('/api/user/:userId/challenges', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const userChallenges = await storage.getUserChallenges(userId);
      res.json(userChallenges);
    } catch (error) {
      console.error("Error fetching user challenges:", error);
      res.status(500).json({ message: "Failed to fetch user challenges" });
    }
  });

  // Update challenge progress
  app.put('/api/user/:userId/challenges/:challengeId', isAuthenticated, async (req: any, res) => {
    try {
      const { userId, challengeId } = req.params;
      const { progress } = req.body;
      
      if (progress === undefined) {
        return res.status(400).json({ message: "Progress is required" });
      }

      const userChallenge = await storage.updateChallengeProgress(userId, challengeId, progress);
      res.json(userChallenge);
    } catch (error) {
      console.error("Error updating challenge progress:", error);
      res.status(500).json({ message: "Failed to update challenge progress" });
    }
  });

  // Complete challenge
  app.post('/api/user/:userId/challenges/:challengeId/complete', isAuthenticated, async (req: any, res) => {
    try {
      const { userId, challengeId } = req.params;
      const userChallenge = await storage.completeChallenge(userId, challengeId);
      res.json(userChallenge);
    } catch (error) {
      console.error("Error completing challenge:", error);
      res.status(500).json({ message: "Failed to complete challenge" });
    }
  });

  // Get user spark boosts
  app.get('/api/user/:userId/spark-boosts', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const sparkBoosts = await storage.getUserSparkBoosts(userId);
      res.json(sparkBoosts);
    } catch (error) {
      console.error("Error fetching spark boosts:", error);
      res.status(500).json({ message: "Failed to fetch spark boosts" });
    }
  });

  // Create spark boost
  app.post('/api/user/:fromUserId/boost/:toUserId', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { fromUserId, toUserId } = req.params;
      const { sparks } = req.body;
      
      if (!sparks || sparks <= 0) {
        return res.status(400).json({ message: "Valid sparks amount is required" });
      }

      // Check if user can boost today
      const canBoost = await storage.canBoostUser(fromUserId);
      if (!canBoost) {
        return res.status(400).json({ message: "You can only boost one user per day" });
      }

      const sparkBoost = await storage.createSparkBoost(fromUserId, toUserId, sparks);
      res.json(sparkBoost);
    } catch (error) {
      console.error("Error creating spark boost:", error);
      res.status(500).json({ message: "Failed to create spark boost" });
    }
  });

  // Check if user can boost
  app.get('/api/user/:userId/can-boost', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const canBoost = await storage.canBoostUser(userId);
      res.json({ canBoost });
    } catch (error) {
      console.error("Error checking boost availability:", error);
      res.status(500).json({ message: "Failed to check boost availability" });
    }
  });

  // Platform Settings Routes
  // General Settings
  app.get('/api/admin/settings/general', isAdminAuthenticated, async (req: any, res) => {
    try {
      const settings = await storage.getGeneralSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching general settings:", error);
      res.status(500).json({ message: "Failed to fetch general settings" });
    }
  });

  app.put('/api/admin/settings/general', isAdminAuthenticated, async (req: any, res) => {
    try {
      const userId = getCurrentUser(req)?.id;
      const settings = await storage.updateGeneralSettings(req.body, userId);
      res.json(settings);
    } catch (error) {
      console.error("Error updating general settings:", error);
      res.status(500).json({ message: "Failed to update general settings" });
    }
  });

  // Quiz Settings
  app.get('/api/admin/settings/quiz', isAdminAuthenticated, async (req: any, res) => {
    try {
      const settings = await storage.getQuizSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching quiz settings:", error);
      res.status(500).json({ message: "Failed to fetch quiz settings" });
    }
  });

  app.put('/api/admin/settings/quiz', isAdminAuthenticated, async (req: any, res) => {
    try {
      const userId = getCurrentUser(req)?.id;
      const settings = await storage.updateQuizSettings(req.body, userId);
      res.json(settings);
    } catch (error) {
      console.error("Error updating quiz settings:", error);
      res.status(500).json({ message: "Failed to update quiz settings" });
    }
  });

  // Notification Settings
  app.get('/api/admin/settings/notifications', isAdminAuthenticated, async (req: any, res) => {
    try {
      const settings = await storage.getNotificationSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching notification settings:", error);
      res.status(500).json({ message: "Failed to fetch notification settings" });
    }
  });

  app.put('/api/admin/settings/notifications', isAdminAuthenticated, async (req: any, res) => {
    try {
      const userId = getCurrentUser(req)?.id;
      const settings = await storage.updateNotificationSettings(req.body, userId);
      res.json(settings);
    } catch (error) {
      console.error("Error updating notification settings:", error);
      res.status(500).json({ message: "Failed to update notification settings" });
    }
  });

  // ===== SUBSCRIPTION ROUTES =====
  
  // Get subscription plans
  app.get('/api/subscription/plans', async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ message: "Failed to fetch subscription plans" });
    }
  });

  // Get user's current subscription
  app.get('/api/subscription/current', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getCurrentUser(req)?.id;
      console.log('SUBSCRIPTION CHECK FOR USER:', userId);
      
      const subscription = await storage.getUserSubscription(userId);
      console.log('SUBSCRIPTION RESULT:', subscription);
      
      // No auto-creation - users must pay to get subscription
      res.json(subscription);
    } catch (error) {
      console.error("Error fetching user subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  // Get user's daily quiz usage and limits
  app.get('/api/user/quiz-usage', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getCurrentUser(req)?.id;
      
      // Get user's active profile
      const profiles = await storage.getUserProfiles(userId);
      const currentProfile = profiles.find(p => p.isDefault) || profiles[0];
      
      if (!currentProfile) {
        return res.status(400).json({ message: "No profile found" });
      }

      // Get comprehensive usage info
      const limitCheck = await storage.checkDailyQuizLimit(userId, currentProfile.id);
      
      res.json({
        canTakeQuiz: limitCheck.canTakeQuiz,
        ...limitCheck.usageInfo
      });
    } catch (error) {
      console.error("Error fetching quiz usage:", error);
      res.status(500).json({ message: "Failed to fetch quiz usage" });
    }
  });


  // Get user credits
  app.get('/api/user/credits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getCurrentUser(req)?.id;
      const credits = await storage.getUserCredits(userId);
      res.json({ credits });
    } catch (error) {
      console.error("Error fetching user credits:", error);
      res.status(500).json({ message: "Failed to fetch credits" });
    }
  });

  // Create subscription with credits
  app.post('/api/subscription/create-with-credits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getCurrentUser(req)?.id;
      const { planId, paymentMethod, billingCycle } = req.body;

      // Get plan details
      const plans = await storage.getSubscriptionPlans();
      const plan = plans.find(p => p.id === planId);
      
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      if (paymentMethod === 'credits') {
        // Check if user has enough credits
        const userCredits = await storage.getUserCredits(userId);
        const planPrice = parseFloat(plan.price);

        if (userCredits < planPrice) {
          return res.status(400).json({ 
            message: "Insufficient credits", 
            required: planPrice, 
            available: userCredits 
          });
        }

        // Deduct credits
        await storage.deductCredits(userId, planPrice, `Subscription: ${plan.name}`);
      }

      // Create subscription with proper duration based on billing cycle
      const startDate = new Date();
      const endDate = new Date();
      
      // Calculate end date based on selected billing cycle or plan's default
      const selectedBillingCycle = billingCycle || plan.billingCycle;
      switch (selectedBillingCycle) {
        case 'weekly':
          endDate.setDate(endDate.getDate() + 7); // 7 days
          break;
        case 'monthly':
          endDate.setMonth(endDate.getMonth() + 1); // 1 month
          break;
        case 'yearly':
          endDate.setFullYear(endDate.getFullYear() + 1); // 1 year
          break;
        default:
          endDate.setDate(endDate.getDate() + 7); // Default to weekly
          break;
      }

      const subscription = await storage.createSubscription({
        userId,
        planId,
        status: 'active',
        startDate,
        endDate,
        paymentMethod: paymentMethod || 'credits',
        autoRenew: true,
      });

      res.json(subscription);
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription: " + error.message });
    }
  });

  // Get payment history
  app.get('/api/payment/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getCurrentUser(req)?.id;
      const [paymentHistory, creditTransactions] = await Promise.all([
        storage.getPaymentHistory(userId),
        storage.getCreditTransactions(userId),
      ]);

      // Combine and sort by date
      const allTransactions = [
        ...paymentHistory.map(t => ({ ...t, source: 'payment' })),
        ...creditTransactions.map(t => ({ ...t, source: 'credit' })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      res.json(allTransactions);
    } catch (error) {
      console.error("Error fetching payment history:", error);
      res.status(500).json({ message: "Failed to fetch payment history" });
    }
  });

  // Create payment transaction (for Paystack integration)
  app.post('/api/payment/create', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getCurrentUser(req)?.id;
      const { amount, type, description, planId, billingCycle } = req.body;

      const transaction = await storage.createPaymentTransaction({
        userId,
        type,
        amount: amount.toFixed(2),
        currency: 'USD',
        status: 'pending',
        description,
        planId: planId,
        metadata: billingCycle ? { billingCycle } : undefined,
      });

      res.json(transaction);
    } catch (error) {
      console.error("Error creating payment transaction:", error);
      res.status(500).json({ message: "Failed to create payment transaction" });
    }
  });

  // Confirm payment transaction (after successful Paystack payment)
  app.post('/api/payment/confirm', isAuthenticated, async (req: any, res) => {
    console.log('PAYMENT CONFIRM ENDPOINT HIT!!!');
    try {
      const userId = getCurrentUser(req)?.id;
      const { transactionId, paystackReference } = req.body;

      console.log('🔄 Processing payment confirmation for user:', userId, 'transaction:', transactionId);

      // Update transaction status first
      await storage.updatePaymentTransaction(transactionId, {
        status: 'success',
        paystackReference,
        processedAt: new Date(),
      });

      // Get the specific transaction directly by ID
      const paymentHistory = await storage.getPaymentHistory(userId);
      const transaction = paymentHistory.find(t => t.id === transactionId);
      
      if (!transaction) {
        console.error('❌ Transaction not found after update:', transactionId);
        return res.status(404).json({ message: "Transaction not found" });
      }

      console.log('📄 Transaction details:', {
        id: transaction.id,
        type: transaction.type,
        planId: transaction.planId,
        metadata: transaction.metadata
      });

      // Create subscription if payment was for subscription
      if (transaction.type === 'subscription' && transaction.planId) {
        console.log('💳 Creating subscription for plan:', transaction.planId);
        
        // Cancel any existing active subscriptions first
        try {
          const existingSubscription = await storage.getUserSubscription(userId);
          if (existingSubscription && existingSubscription.status === 'active') {
            console.log('🔄 Cancelling existing subscription:', existingSubscription.id);
            await storage.updateSubscription(existingSubscription.id, { status: 'cancelled' });
          }
        } catch (error) {
          console.log('ℹ️ No existing subscription to cancel (this is normal for new users)');
        }

        // Get plan details
        const plans = await storage.getSubscriptionPlans();
        const plan = plans.find(p => p.id === transaction.planId);
        
        if (!plan) {
          console.error('❌ Plan not found for planId:', transaction.planId);
          return res.status(400).json({ message: "Subscription plan not found" });
        }

        // Calculate subscription dates
        const startDate = new Date();
        const endDate = new Date();
        const billingCycle = transaction.metadata?.billingCycle || plan.billingCycle || 'weekly';
        
        console.log('📅 Setting up subscription dates with billing cycle:', billingCycle);
        
        switch (billingCycle) {
          case 'weekly':
            endDate.setDate(endDate.getDate() + 7);
            break;
          case 'monthly':
            endDate.setMonth(endDate.getMonth() + 1);
            break;
          case 'yearly':
            endDate.setFullYear(endDate.getFullYear() + 1);
            break;
          default:
            endDate.setDate(endDate.getDate() + 7); // Default to weekly
            break;
        }

        // Create the subscription
        const subscriptionData = {
          userId,
          planId: plan.id,
          status: 'active',
          startDate,
          endDate,
          paymentMethod: 'paystack',
          autoRenew: true,
        };

        console.log('🆕 Creating subscription with data:', subscriptionData);
        
        try {
          const newSubscription = await storage.createSubscription(subscriptionData);
          console.log('✅ Subscription created successfully:', {
            subscriptionId: newSubscription.id,
            userId: newSubscription.userId,
            planId: newSubscription.planId,
            status: newSubscription.status,
            startDate: newSubscription.startDate,
            endDate: newSubscription.endDate
          });

          // Verify the subscription was created by immediately looking it up
          const verifySubscription = await storage.getUserSubscription(userId);
          console.log('🔍 Verification - subscription lookup after creation:', verifySubscription);
          
        } catch (subscriptionError) {
          console.error('❌ Failed to create subscription:', subscriptionError);
          return res.status(500).json({ message: "Failed to create subscription", error: subscriptionError.message });
        }
      }

      res.json({ 
        message: 'Payment confirmed and subscription activated successfully',
        transactionId: transaction.id,
        success: true
      });

    } catch (error) {
      console.error("❌ Error in payment confirmation:", error);
      res.status(500).json({ 
        message: "Failed to confirm payment", 
        error: error.message 
      });
    }
  });


  // Confirm credit top-up payment transaction
  app.post('/api/payment/confirm-topup', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getCurrentUser(req)?.id;
      const { transactionId, paystackReference, amount } = req.body;

      // Update transaction status
      const updatedTransaction = await storage.updatePaymentTransaction(transactionId, {
        status: 'success',
        paystackReference,
        processedAt: new Date(),
      });

      // Add credits to user account
      await storage.addCredits(
        userId, 
        parseFloat(amount), 
        `Credit Top-up via Paystack: $${amount}`,
        transactionId
      );

      res.json({ 
        message: 'Credit top-up confirmed successfully', 
        transaction: updatedTransaction,
        creditsAdded: amount 
      });
    } catch (error) {
      console.error("Error confirming credit top-up:", error);
      res.status(500).json({ message: "Failed to confirm credit top-up" });
    }
  });

  // Process existing payments and create missing subscriptions
  app.post('/api/subscription/process-payments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getCurrentUser(req)?.id;
      console.log('🔄 Processing existing payments for user:', userId);

      // Get all successful subscription payments for this user
      const paymentHistory = await storage.getPaymentHistory(userId);
      const subscriptionPayments = paymentHistory.filter(payment => 
        payment.type === 'subscription' && 
        payment.status === 'success'
      );

      console.log('💳 Found', subscriptionPayments.length, 'successful subscription payments');

      const createdSubscriptions = [];
      
      for (const payment of subscriptionPayments) {
        // Skip if we already have an active subscription (process only once)
        const existingSubscription = await storage.getUserSubscription(userId);
        if (existingSubscription && existingSubscription.status === 'active') {
          console.log('ℹ️ User already has active subscription, using latest payment for new subscription');
          // Only process the most recent payment
          const latestPayment = subscriptionPayments[0]; // Already sorted by date DESC
          if (payment.id !== latestPayment.id) {
            continue; // Skip older payments if there's already a subscription
          }
        }

        // Extract plan information from payment description
        let planId = null;
        let billingCycle = payment.metadata?.billingCycle || 'monthly';
        
        // Parse plan from description - matches "Subscription: Premium Plan (monthly)"
        const descMatch = payment.description?.match(/Subscription:\s*(.+?)\s*\(/);
        if (descMatch) {
          const planName = descMatch[1].trim();
          const plans = await storage.getSubscriptionPlans();
          const matchedPlan = plans.find(p => p.name === planName);
          if (matchedPlan) {
            planId = matchedPlan.id;
          }
        }

        if (!planId) {
          console.log('❌ Could not determine plan for payment:', payment.id, payment.description);
          continue;
        }

        console.log('✅ Creating subscription for payment:', payment.id, 'plan:', planId);

        // Calculate subscription dates
        const startDate = new Date(payment.processedAt || payment.createdAt);
        const endDate = new Date(startDate);
        
        switch (billingCycle) {
          case 'weekly':
            endDate.setDate(endDate.getDate() + 7);
            break;
          case 'monthly':
            endDate.setMonth(endDate.getMonth() + 1);
            break;
          case 'yearly':
            endDate.setFullYear(endDate.getFullYear() + 1);
            break;
          default:
            endDate.setDate(endDate.getDate() + 7);
            break;
        }

        // Create the subscription
        const subscriptionData = {
          userId,
          planId,
          status: 'active',
          startDate,
          endDate,
          paymentMethod: 'paystack',
          autoRenew: true,
        };

        const newSubscription = await storage.createSubscription(subscriptionData);
        console.log('✅ Created subscription:', newSubscription.id, 'for payment:', payment.id);
        createdSubscriptions.push({
          paymentId: payment.id,
          subscriptionId: newSubscription.id,
          planId,
          amount: payment.amount
        });
      }

      res.json({ 
        message: `Successfully processed ${createdSubscriptions.length} payments and created subscriptions`,
        subscriptions: createdSubscriptions
      });

    } catch (error) {
      console.error("❌ Error processing payments for subscriptions:", error);
      res.status(500).json({ message: "Failed to process payments" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

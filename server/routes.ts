import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateQuestions } from "./aiService";
import { insertQuizSessionSchema, insertUserAnswerSchema, topics, questions, quizSessions, userAnswers } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
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

  // Terms routes
  app.get('/api/terms', async (req, res) => {
    try {
      const terms = await storage.getTerms();
      // Filter to only show basic terms (Term 1, 2, 3) for quiz selection
      const basicTerms = terms.filter(term => term.order <= 3);
      res.json(basicTerms);
    } catch (error) {
      console.error("Error fetching terms:", error);
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
  app.get('/api/quiz-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const quizHistory = await storage.getQuizHistoryForUser(userId);
      res.json(quizHistory);
    } catch (error) {
      console.error('Error fetching quiz history:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Profile update routes
  app.patch('/api/profiles/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.claims.sub;
      
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
  app.post('/api/quizzes/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

      // Check if user has active subscription
      const subscription = await storage.getUserSubscription(userId);
      if (!subscription || subscription.status !== 'active') {
        return res.status(403).json({ 
          message: "Active subscription required", 
          requiresSubscription: true 
        });
      }

      // Get user's active profile
      const profiles = await storage.getUserProfiles(userId);
      const currentProfile = profiles.find(p => p.isDefault) || profiles[0];
      
      if (!currentProfile) {
        return res.status(400).json({ message: "No profile found" });
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
      const userId = req.user.claims.sub;
      
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

  // Submit answer for quiz question
  app.post('/api/quiz-sessions/:sessionId/answers', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/quiz-sessions/:sessionId/complete', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/admin/metrics', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/admin/quizzes', isAuthenticated, async (req: any, res) => {
    try {
      const quizzes = await storage.getAdminQuizList(req.query);
      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching admin quizzes:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  // Get quiz details with questions
  app.get('/api/admin/quizzes/:quizId', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/admin/quizzes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const quizData = { ...req.body, createdBy: userId };
      
      const newQuiz = await storage.createQuiz(quizData);
      res.json(newQuiz);
    } catch (error) {
      console.error("Error creating quiz:", error);
      res.status(500).json({ message: "Failed to create quiz" });
    }
  });

  // Update quiz
  app.put('/api/admin/quizzes/:quizId', isAuthenticated, async (req: any, res) => {
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

  // CRUD routes for Examination Systems
  app.post('/api/admin/examination-systems', isAuthenticated, async (req: any, res) => {
    try {
      const newSystem = await storage.createExaminationSystem(req.body);
      res.json(newSystem);
    } catch (error) {
      console.error("Error creating examination system:", error);
      res.status(500).json({ message: "Failed to create examination system" });
    }
  });

  app.put('/api/admin/examination-systems/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updatedSystem = await storage.updateExaminationSystem(id, req.body);
      res.json(updatedSystem);
    } catch (error) {
      console.error("Error updating examination system:", error);
      res.status(500).json({ message: "Failed to update examination system" });
    }
  });

  app.delete('/api/admin/examination-systems/:id', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/admin/levels', isAuthenticated, async (req: any, res) => {
    try {
      const newLevel = await storage.createLevel(req.body);
      res.json(newLevel);
    } catch (error) {
      console.error("Error creating level:", error);
      res.status(500).json({ message: "Failed to create level" });
    }
  });

  app.put('/api/admin/levels/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updatedLevel = await storage.updateLevel(id, req.body);
      res.json(updatedLevel);
    } catch (error) {
      console.error("Error updating level:", error);
      res.status(500).json({ message: "Failed to update level" });
    }
  });

  app.delete('/api/admin/levels/:id', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/admin/subjects', isAuthenticated, async (req: any, res) => {
    try {
      const newSubject = await storage.createSubject(req.body);
      res.json(newSubject);
    } catch (error) {
      console.error("Error creating subject:", error);
      res.status(500).json({ message: "Failed to create subject" });
    }
  });

  app.put('/api/admin/subjects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updatedSubject = await storage.updateSubject(id, req.body);
      res.json(updatedSubject);
    } catch (error) {
      console.error("Error updating subject:", error);
      res.status(500).json({ message: "Failed to update subject" });
    }
  });

  app.delete('/api/admin/subjects/:id', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/admin/terms', isAuthenticated, async (req: any, res) => {
    try {
      const newTerm = await storage.createTerm(req.body);
      res.json(newTerm);
    } catch (error) {
      console.error("Error creating term:", error);
      res.status(500).json({ message: "Failed to create term" });
    }
  });

  app.put('/api/admin/terms/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updatedTerm = await storage.updateTerm(id, req.body);
      res.json(updatedTerm);
    } catch (error) {
      console.error("Error updating term:", error);
      res.status(500).json({ message: "Failed to update term" });
    }
  });

  app.delete('/api/admin/terms/:id', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/admin/generate-quiz', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
  app.get('/api/admin/recent-activity', isAuthenticated, async (req: any, res) => {
    try {
      const activities = await storage.getRecentActivity();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  // Admin leaderboard
  app.get('/api/admin/leaderboard', isAuthenticated, async (req: any, res) => {
    try {
      const leaderboard = await storage.getTopPerformers();
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching admin leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Enhanced analytics endpoints
  app.get('/api/admin/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const [
        quizActivity,
        subjectDistribution,
        engagementMetrics,
        performanceMetrics
      ] = await Promise.all([
        storage.getQuizActivityByDay(),
        storage.getSubjectDistribution(),
        storage.getEngagementMetrics(),
        storage.getPerformanceMetrics()
      ]);

      res.json({
        quizActivity,
        subjectDistribution,
        engagement: engagementMetrics,
        performance: performanceMetrics
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Top performers by period (daily/weekly/monthly)
  app.get('/api/admin/top-performers/:period', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/admin/topics', isAuthenticated, async (req: any, res) => {
    try {
      const topics = await storage.getAdminTopicList(req.query);
      res.json(topics);
    } catch (error) {
      console.error("Error fetching admin topics:", error);
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  app.post('/api/admin/topics', isAuthenticated, async (req: any, res) => {
    try {
      const topicData = req.body;
      const newTopic = await storage.createTopic(topicData);
      res.json(newTopic);
    } catch (error) {
      console.error("Error creating topic:", error);
      res.status(500).json({ message: "Failed to create topic" });
    }
  });

  app.put('/api/admin/topics/:topicId', isAuthenticated, async (req: any, res) => {
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

  app.delete('/api/admin/topics/:topicId', isAuthenticated, async (req: any, res) => {
    try {
      const { topicId } = req.params;
      await storage.deleteTopic(topicId);
      res.json({ message: "Topic deleted successfully" });
    } catch (error) {
      console.error("Error deleting topic:", error);
      res.status(500).json({ message: "Failed to delete topic" });
    }
  });

  // Admin user management routes
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const users = await storage.getAdminUserList(req.query);
      res.json(users);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/user-stats', isAuthenticated, async (req: any, res) => {
    try {
      const stats = await storage.getAdminUserStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Quiz types management routes
  app.get('/api/admin/quiz-types', isAuthenticated, async (req: any, res) => {
    try {
      const quizTypes = await storage.getQuizTypes();
      res.json(quizTypes);
    } catch (error) {
      console.error('Error fetching quiz types:', error);
      res.status(500).json({ error: 'Failed to fetch quiz types' });
    }
  });

  app.post('/api/admin/quiz-types', isAuthenticated, async (req: any, res) => {
    try {
      const quizType = await storage.createQuizType(req.body);
      res.json(quizType);
    } catch (error) {
      console.error('Error creating quiz type:', error);
      res.status(500).json({ error: 'Failed to create quiz type' });
    }
  });

  app.patch('/api/admin/quiz-types/:id', isAuthenticated, async (req: any, res) => {
    try {
      const quizType = await storage.updateQuizType(req.params.id, req.body);
      res.json(quizType);
    } catch (error) {
      console.error('Error updating quiz type:', error);
      res.status(500).json({ error: 'Failed to update quiz type' });
    }
  });

  app.delete('/api/admin/quiz-types/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteQuizType(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting quiz type:', error);
      res.status(500).json({ error: 'Failed to delete quiz type' });
    }
  });

  // Enhanced quiz system routes
  app.get('/api/admin/quizzes', isAuthenticated, async (req: any, res) => {
    const quizzes = await storage.getAdminQuizzes();
    res.json(quizzes);
  });

  // Get single quiz details for preview
  app.get('/api/admin/quizzes/:quizId', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/quiz/start', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { profileId, subjectId, quizType, topicId, termId } = req.body;
      
      // Check if user has active subscription
      const subscription = await storage.getUserSubscription(userId);
      if (!subscription || subscription.status !== 'active') {
        return res.status(403).json({ 
          message: "Active subscription required", 
          requiresSubscription: true 
        });
      }
      
      // Get profile to access examination system and level
      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      // Get available quizzes based on filters  
      const availableQuizzes = await storage.getQuizzesBySubject(subjectId);

      // If no admin quizzes found, fallback to generating from question bank
      if (!availableQuizzes || availableQuizzes.length === 0) {
        console.log('No admin quizzes found, generating from question bank...');
        
        // Get questions from database - use all available questions for now
        const allQuestions = await storage.getAllQuestions();
        
        if (!allQuestions || allQuestions.length === 0) {
          return res.status(404).json({ message: "No questions available for quiz generation" });
        }

        // Filter physics-related questions (basic keyword matching for now)
        const physicsKeywords = ['force', 'energy', 'motion', 'physics', 'newton', 'gravity', 'electrical', 'mechanical', 'wave', 'light'];
        const relevantQuestions = allQuestions.filter(q => 
          physicsKeywords.some(keyword => 
            q.question_text?.toLowerCase().includes(keyword) ||
            q.explanation?.toLowerCase().includes(keyword)
          )
        );

        if (relevantQuestions.length === 0) {
          return res.status(404).json({ message: "No relevant questions available for this subject" });
        }

        // Shuffle and take 10 questions
        const shuffledQuestions = relevantQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);
        
        // Convert to quiz format and create session
        const quizQuestions = shuffledQuestions.map(q => ({
          id: q.id,
          content: q.question_text,
          choices: [
            { id: `${q.id}_a`, content: q.option_a, isCorrect: q.correct_answer === 'A', orderIndex: 1 },
            { id: `${q.id}_b`, content: q.option_b, isCorrect: q.correct_answer === 'B', orderIndex: 2 },
            { id: `${q.id}_c`, content: q.option_c, isCorrect: q.correct_answer === 'C', orderIndex: 3 },
            { id: `${q.id}_d`, content: q.option_d, isCorrect: q.correct_answer === 'D', orderIndex: 4 }
          ],
          explanation: q.explanation
        }));

        // Create quiz session with generated questions
        const userId = req.user.claims.sub;
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
          currentQuestionIndex: 0
        });
      }

      // Filter to only include quizzes that have questions
      const quizzesWithQuestions = [];
      for (const quiz of availableQuizzes) {
        const quizWithQuestions = await storage.getQuizWithQuestions(quiz.id);
        if (quizWithQuestions.questions && quizWithQuestions.questions.length > 0) {
          quizzesWithQuestions.push(quiz);
        }
      }

      if (quizzesWithQuestions.length === 0) {
        return res.status(404).json({ message: "No quizzes with questions available for this subject" });
      }

      // Select a random quiz from available quizzes that have questions
      const selectedQuiz = quizzesWithQuestions[Math.floor(Math.random() * quizzesWithQuestions.length)];

      // Get quiz questions
      const quizWithQuestions = await storage.getQuizWithQuestions(selectedQuiz.id);

      if (!quizWithQuestions.questions || quizWithQuestions.questions.length === 0) {
        return res.status(404).json({ message: "No questions found in selected quiz" });
      }

      // Check if user has an incomplete quiz session for this subject
      const incompleteSession = await storage.getIncompleteQuizSession(profileId, subjectId);
      
      let quizSession;
      if (incompleteSession) {
        // Return existing incomplete session
        quizSession = incompleteSession;
      } else {
        // Create new quiz session with questions snapshot
        const userId = req.user.claims.sub;
        quizSession = await storage.createQuizSession({
          userId,
          profileId,
          subjectId,
          quizType: 'random',
          totalQuestions: quizWithQuestions.questions.length,
          currentQuestionIndex: 0,
          quizQuestions: quizWithQuestions.questions, // Save questions snapshot
        });
      }

      // Get questions - use session questions if resuming, otherwise use new ones
      let questionsToUse;
      if (incompleteSession && quizSession.quizQuestions) {
        questionsToUse = quizSession.quizQuestions;
      } else {
        questionsToUse = quizWithQuestions.questions;
        // If this is a new session, save questions snapshot
        if (!incompleteSession) {
          await db.update(quizSessions)
            .set({ quizQuestions: quizWithQuestions.questions })
            .where(eq(quizSessions.id, quizSession.id));
        }
      }
      
      // Transform questions to expected format
      const questions = questionsToUse.map((q: any) => ({
        id: q.id,
        questionText: q.content,
        optionA: q.choices[0]?.content || 'Option A',
        optionB: q.choices[1]?.content || 'Option B', 
        optionC: q.choices[2]?.content || 'Option C',
        optionD: q.choices[3]?.content || 'Option D',
        correctAnswer: q.choices.find((c: any) => c.isCorrect)?.content.charAt(0) || 'A',
        explanation: q.explanation
      }));

      res.json({
        sessionId: quizSession.id,
        questions: questions,
        totalQuestions: questions.length,
        currentQuestionIndex: quizSession.currentQuestionIndex || 0,
        isResuming: !!incompleteSession
      });
    } catch (error) {
      console.error("Error starting quiz:", error);
      res.status(500).json({ message: "Failed to start quiz: " + error.message });
    }
  });

  // Profile routes
  app.get('/api/profiles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profiles = await storage.getUserProfiles(userId);
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      res.status(500).json({ message: "Failed to fetch profiles" });
    }
  });

  app.post('/api/profiles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.put('/api/profiles/:profileId/default', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      
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

  // Quiz session routes are now handled by the primary quiz start endpoint above

  // Batch answer submission for better performance
  app.post('/api/quiz/:sessionId/batch-answers', isAuthenticated, async (req: any, res) => {
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
      const userId = req.user.claims.sub;

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
      
      // Handle letter answers (A, B, C, D) - map to choice IDs
      if (userAnswer === 'A' || userAnswer === 'B' || userAnswer === 'C' || userAnswer === 'D') {
        const letterToChoiceId = { 'A': 'a', 'B': 'b', 'C': 'c', 'D': 'd' };
        const choiceId = letterToChoiceId[userAnswer];
        const selectedChoice = question.choices?.find((choice: any) => choice.id === choiceId);
        isCorrect = selectedChoice && selectedChoice.isCorrect === true;
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

  app.post('/api/quiz/:sessionId/complete', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      
      // Get all answers for this quiz session
      const answers = await storage.getQuizAnswers(sessionId);
      const correctAnswers = answers.filter(a => a.isCorrect).length;
      const totalTime = answers.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
      
      // Get quiz settings for configurable values
      const quizSettings = await storage.getQuizSettings();
      
      // Calculate sparks earned (base + accuracy bonus)
      const accuracy = correctAnswers / answers.length;
      const baseSparks = correctAnswers * quizSettings.sparksPerCorrectAnswer;
      
      // Apply accuracy bonuses based on settings
      let bonusMultiplier = 1;
      if (accuracy >= Number(quizSettings.accuracyBonusThreshold)) {
        bonusMultiplier = Number(quizSettings.accuracyBonusMultiplier);
      } else if (accuracy >= Number(quizSettings.goodAccuracyThreshold)) {
        bonusMultiplier = Number(quizSettings.goodAccuracyMultiplier);
      }
      
      const sparksEarned = Math.round(baseSparks * bonusMultiplier);

      // Update quiz session
      const updatedSession = await storage.updateQuizSession(sessionId, {
        correctAnswers,
        sparksEarned,
        timeSpent: totalTime,
        completed: true,
        completedAt: new Date(),
      });

      // Update profile sparks and streak
      const profile = await storage.getProfile(updatedSession.profileId);
      if (profile) {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        let lastQuizDate = null;
        if (profile.lastQuizDate) {
          try {
            const lastDate = new Date(profile.lastQuizDate);
            if (!isNaN(lastDate.getTime())) {
              lastQuizDate = lastDate.toISOString().split('T')[0];
            }
          } catch (error) {
            console.warn('Invalid lastQuizDate format:', profile.lastQuizDate);
          }
        }
        
        // Calculate streak
        let newCurrentStreak = profile.currentStreak || 0;
        let newLongestStreak = profile.longestStreak || 0;
        
        if (lastQuizDate) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          if (lastQuizDate === yesterdayStr) {
            // Consecutive day - increment streak
            newCurrentStreak = (profile.currentStreak || 0) + 1;
          } else if (lastQuizDate === today) {
            // Same day - keep current streak
            newCurrentStreak = profile.currentStreak || 1;
          } else {
            // Gap in days - reset streak
            newCurrentStreak = 1;
          }
        } else {
          // First quiz ever
          newCurrentStreak = 1;
        }
        
        // Update longest streak if current is longer
        newLongestStreak = Math.max(newLongestStreak, newCurrentStreak);
        
        const updatedProfile = await storage.updateProfile(profile.id, {
          sparks: (profile.sparks || 0) + sparksEarned,
          currentStreak: newCurrentStreak,
          longestStreak: newLongestStreak,
          lastQuizDate: new Date(),
          lastActivity: new Date(),
        });
        
        // Rankings are calculated dynamically when leaderboard is requested
        
        console.log(`Profile updated: sparks +${sparksEarned} (total: ${(profile.sparks || 0) + sparksEarned}), streak: ${newCurrentStreak}`);
        
        console.log(`Profile updated: sparks +${sparksEarned} (total: ${(profile.sparks || 0) + sparksEarned}), streak: ${newCurrentStreak}`);
      }

      res.json({
        sessionId: sessionId,
        totalQuestions: answers.length,
        correctAnswers,
        sparksEarned,
        timeSpent: totalTime,
        completed: true,
      });

    } catch (error) {
      console.error("Error completing quiz:", error);
      res.status(500).json({ message: "Failed to complete quiz" });
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

  // Start a quiz session - use test questions for now
  app.post('/api/quiz/start', isAuthenticated, async (req: any, res) => {
    try {
      const { profileId, subjectId, quizType, topicId, term } = req.body;

      if (!profileId || !subjectId) {
        return res.status(400).json({ message: "Profile ID and Subject ID are required" });
      }

      // Get questions from database - fallback from admin quizzes to question bank
      let testQuestions = [];
      
      try {
        // Try to get all questions from database and filter relevant ones
        const allQuestions = await storage.getAllQuestions();
        
        if (allQuestions && allQuestions.length > 0) {
          // Filter physics-related questions (basic keyword matching)
          const physicsKeywords = ['force', 'energy', 'motion', 'physics', 'newton', 'gravity', 'electrical', 'mechanical', 'wave', 'light'];
          const relevantQuestions = allQuestions.filter(q => 
            physicsKeywords.some(keyword => 
              q.question_text?.toLowerCase().includes(keyword) ||
              q.explanation?.toLowerCase().includes(keyword)
            )
          );

          if (relevantQuestions.length > 0) {
            // Shuffle and take 10 questions
            const shuffledQuestions = relevantQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);
            
            // Convert to quiz format
            testQuestions = shuffledQuestions.map(q => ({
              id: q.id,
              content: q.question_text,
              choices: [
                { id: `${q.id}_a`, content: q.option_a || 'Option A', isCorrect: q.correct_answer === 'A', orderIndex: 1 },
                { id: `${q.id}_b`, content: q.option_b || 'Option B', isCorrect: q.correct_answer === 'B', orderIndex: 2 },
                { id: `${q.id}_c`, content: q.option_c || 'Option C', isCorrect: q.correct_answer === 'C', orderIndex: 3 },
                { id: `${q.id}_d`, content: q.option_d || 'Option D', isCorrect: q.correct_answer === 'D', orderIndex: 4 }
              ],
              explanation: q.explanation
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching questions from database:', error);
      }
      
      // Fallback to hardcoded questions if database query failed
      if (testQuestions.length === 0) {
        testQuestions = [
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
      }

      console.log('Creating new quiz session with test questions:', testQuestions.length);
      console.log('Test questions structure:', testQuestions.map(q => ({ id: q.id, content: q.content, choicesCount: q.choices.length })));
      console.log('Full test questions array being passed to storage:', JSON.stringify(testQuestions, null, 2));
      console.log('totalQuestions being set to:', testQuestions.length);

      // Check for incomplete sessions first
      const incompleteSession = await storage.getIncompleteQuizSession(profileId, subjectId);
      
      // If there's an incomplete session, return it for user to decide
      if (incompleteSession && incompleteSession.quizQuestions && incompleteSession.quizQuestions.length > 0) {
        const sessionQuestions = incompleteSession.quizQuestions.map((q: any) => ({
          id: q.id,
          questionText: q.content,
          optionA: q.choices[0]?.content || 'Option A',
          optionB: q.choices[1]?.content || 'Option B', 
          optionC: q.choices[2]?.content || 'Option C',
          optionD: q.choices[3]?.content || 'Option D',
          correctAnswer: q.choices.find((c: any) => c.isCorrect)?.content || 'A',
          explanation: q.explanation
        }));

        return res.json({
          hasIncompleteSession: true,
          incompleteSession: {
            sessionId: incompleteSession.id,
            questions: sessionQuestions,
            totalQuestions: sessionQuestions.length,
            currentQuestionIndex: incompleteSession.currentQuestionIndex || 0,
            startedAt: incompleteSession.startedAt
          }
        });
      }

      // No incomplete session, create new one
      const userId = req.user.claims.sub;
      
      console.log('=== BEFORE CALLING STORAGE ===');
      console.log('Input to createQuizSession - quizQuestions length:', testQuestions.length);
      console.log('Input to createQuizSession - totalQuestions:', testQuestions.length);
      console.log('First question in array:', JSON.stringify(testQuestions[0], null, 2));
      console.log('Second question in array:', JSON.stringify(testQuestions[1], null, 2));
      console.log('Third question in array:', JSON.stringify(testQuestions[2], null, 2));
      
      const quizSession = await storage.createQuizSession({
        userId,
        profileId,
        subjectId,
        quizType: 'random',
        totalQuestions: testQuestions.length,
        currentQuestionIndex: 0,
        quizQuestions: testQuestions,
      });
      console.log('=== AFTER STORAGE RETURNS ===');
      console.log('Created new quiz session:', quizSession.id);
      console.log('Returned quizQuestions length:', quizSession.quizQuestions ? quizSession.quizQuestions.length : 'undefined');
      console.log('Returned totalQuestions:', quizSession.totalQuestions);

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
        hasIncompleteSession: false,
        sessionId: quizSession.id,
        questions: questions,
        totalQuestions: questions.length,
        currentQuestionIndex: 0,
        isResuming: false
      });
    } catch (error) {
      console.error("Error starting quiz:", error);
      res.status(500).json({ message: "Failed to start quiz: " + error.message });
    }
  });

  // Resume an existing quiz session
  app.post('/api/quiz/resume/:sessionId', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/quiz/start-fresh', isAuthenticated, async (req: any, res) => {
    try {
      const { profileId, subjectId, quizType } = req.body;

      if (!profileId || !subjectId) {
        return res.status(400).json({ message: "Profile ID and Subject ID are required" });
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
      const userId = req.user.claims.sub;
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
  app.post('/api/quiz/:sessionId/answer', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
  app.post('/api/quiz/:sessionId/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      
      // Calculate sparks earned
      let sparksEarned = correctAnswers * 10;
      if (correctAnswers === totalQuestions) {
        sparksEarned += 500; // Perfect quiz bonus
      }

      // Update quiz session
      await db.update(quizSessions).set({
        correctAnswers,
        sparksEarned,
        completed: true,
        completedAt: new Date(),
      }).where(eq(quizSessions.id, sessionId));

      // Update profile sparks and streak (placeholder - implement if needed)
      // await storage.updateProfileSparks(profileId, sparksEarned);
      // const updatedProfile = await storage.updateProfileStreak(profileId);

      // Calculate grade
      const percentage = Math.round((correctAnswers / totalQuestions) * 100);
      let grade = 'F';
      if (percentage >= 90) grade = 'A';
      else if (percentage >= 80) grade = 'B+';
      else if (percentage >= 70) grade = 'B';
      else if (percentage >= 60) grade = 'C+';
      else if (percentage >= 50) grade = 'C';
      else if (percentage >= 40) grade = 'D';

      res.json({
        score: `${correctAnswers}/${totalQuestions}`,
        percentage,
        grade,
        sparksEarned,
        // currentStreak: updatedProfile?.streak || 0,
        // totalSparks: updatedProfile?.sparks || 0,
      });
    } catch (error) {
      console.error("Error completing quiz:", error);
      res.status(500).json({ message: "Failed to complete quiz" });
    }
  });

  // Get today's challenge
  app.get('/api/challenge/today', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
  app.get('/api/user/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // const stats = await storage.getProfileStats(profileId);
      res.json({ message: "Stats endpoint not implemented yet" });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Get subject performance
  app.get('/api/subjects/:subjectId/performance', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
  app.get('/api/user/:userId/spark-boosts', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/user/:fromUserId/boost/:toUserId', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/user/:userId/can-boost', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/admin/settings/general', isAuthenticated, async (req: any, res) => {
    try {
      const settings = await storage.getGeneralSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching general settings:", error);
      res.status(500).json({ message: "Failed to fetch general settings" });
    }
  });

  app.put('/api/admin/settings/general', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = await storage.updateGeneralSettings(req.body, userId);
      res.json(settings);
    } catch (error) {
      console.error("Error updating general settings:", error);
      res.status(500).json({ message: "Failed to update general settings" });
    }
  });

  // Quiz Settings
  app.get('/api/admin/settings/quiz', isAuthenticated, async (req: any, res) => {
    try {
      const settings = await storage.getQuizSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching quiz settings:", error);
      res.status(500).json({ message: "Failed to fetch quiz settings" });
    }
  });

  app.put('/api/admin/settings/quiz', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = await storage.updateQuizSettings(req.body, userId);
      res.json(settings);
    } catch (error) {
      console.error("Error updating quiz settings:", error);
      res.status(500).json({ message: "Failed to update quiz settings" });
    }
  });

  // Notification Settings
  app.get('/api/admin/settings/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const settings = await storage.getNotificationSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching notification settings:", error);
      res.status(500).json({ message: "Failed to fetch notification settings" });
    }
  });

  app.put('/api/admin/settings/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const subscription = await storage.getUserSubscription(userId);
      res.json(subscription);
    } catch (error) {
      console.error("Error fetching user subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  // Get user credits
  app.get('/api/user/credits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const { planId, paymentMethod } = req.body;

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

      // Create subscription
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7); // 7 days for weekly billing

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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const { amount, type, description, planId } = req.body;

      const transaction = await storage.createPaymentTransaction({
        userId,
        type,
        amount: amount.toFixed(2),
        currency: 'USD',
        status: 'pending',
        description,
        planId: planId,
      });

      res.json(transaction);
    } catch (error) {
      console.error("Error creating payment transaction:", error);
      res.status(500).json({ message: "Failed to create payment transaction" });
    }
  });

  // Confirm payment transaction (after successful Paystack payment)
  app.post('/api/payment/confirm', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { transactionId, paystackReference } = req.body;

      // Update transaction status
      const updatedTransaction = await storage.updatePaymentTransaction(transactionId, {
        status: 'success',
        paystackReference,
        processedAt: new Date(),
      });

      // Get transaction details to create subscription
      const [paymentHistory] = await Promise.all([
        storage.getPaymentHistory(userId),
      ]);

      const transaction = paymentHistory.find(t => t.id === transactionId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      // Create subscription if payment was for subscription
      if (transaction.type === 'subscription' && transaction.planId) {
        const plans = await storage.getSubscriptionPlans();
        const plan = plans.find(p => p.id === transaction.planId);
        
        if (plan) {
          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 7); // 7 days for weekly billing

          await storage.createSubscription({
            userId,
            planId: plan.id,
            status: 'active',
            startDate,
            endDate,
            paymentMethod: 'paystack',
            autoRenew: true,
          });
        }
      }

      res.json({ message: 'Payment confirmed successfully', transaction: updatedTransaction });
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });

  // Confirm credit top-up payment transaction
  app.post('/api/payment/confirm-topup', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  const httpServer = createServer(app);
  return httpServer;
}
